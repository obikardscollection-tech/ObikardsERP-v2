const prisma = require("../../lib/prisma");

const {
  getReceivedQuantities,
  normalizeReceptionItems,
  validateReceptionPlan,
} = require("./receptionCalculationsService");
const {
  createInventoryFromReceptionItem,
} = require("./receptionInventoryService");
const {
  updatePurchaseReceptionState,
} = require("./updatePurchaseReceptionStateService");
const { generateReference } = require("../common/referenceGeneratorService");

const MAX_SERIALIZABLE_ATTEMPTS = 3;
const RECEPTION_RESULT_INCLUDE = {
  purchase: true,
  receptionItems: {
    include: {
      purchaseItem: true,
      inventory: true,
    },
  },
};

function normalizeIdempotencyKey(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const key = String(value).trim();
  return key || null;
}

function buildReceptionPayloadIdentity(purchaseId, items) {
  return JSON.stringify({
    purchaseId,
    items: items
      .map((item) => ({
        purchaseItemId: item.purchaseItemId,
        quantityReceived: Number(item.quantityReceived),
      }))
      .sort((left, right) =>
        left.purchaseItemId.localeCompare(right.purchaseItemId)
      ),
  });
}

function assertIdempotentPayloadMatches(reception, purchaseId, items) {
  const requestedIdentity = buildReceptionPayloadIdentity(purchaseId, items);
  const existingIdentity = buildReceptionPayloadIdentity(
    reception.purchaseId,
    reception.receptionItems
  );

  if (requestedIdentity !== existingIdentity) {
    const error = new Error(
      "Cette cle d'idempotence est deja associee a une reception avec un payload different."
    );
    error.code = "RECEPTION_IDEMPOTENCY_PAYLOAD_MISMATCH";
    throw error;
  }
}

async function findReceptionByIdempotencyKey(client, idempotencyKey) {
  return client.reception.findUnique({
    where: { idempotencyKey },
    include: RECEPTION_RESULT_INCLUDE,
  });
}

function isRetryableTransactionError(error) {
  return error?.code === "P2034";
}

async function runSerializableTransaction(operation, client = prisma) {
  for (let attempt = 1; attempt <= MAX_SERIALIZABLE_ATTEMPTS; attempt += 1) {
    try {
      return await client.$transaction(operation, {
        isolationLevel: "Serializable",
      });
    } catch (error) {
      if (!isRetryableTransactionError(error)) {
        throw error;
      }

      if (attempt === MAX_SERIALIZABLE_ATTEMPTS) {
        const conflictError = new Error(
          "Conflit de reception concurrente. Veuillez reessayer."
        );
        conflictError.code = "RECEPTION_TRANSACTION_CONFLICT";
        conflictError.cause = error;
        throw conflictError;
      }
    }
  }

  throw new Error("Transaction de reception non executee.");
}

async function createReceptionTransaction(tx, data) {
  const purchaseId = data.purchaseId;

  if (!purchaseId) {
    throw new Error("purchaseId est obligatoire.");
  }

  const items = normalizeReceptionItems(
    data.items || data.receptionItems
  );
  const idempotencyKey = normalizeIdempotencyKey(data.idempotencyKey);

  if (idempotencyKey) {
    const existingReception = await findReceptionByIdempotencyKey(
      tx,
      idempotencyKey
    );

    if (existingReception) {
      assertIdempotentPayloadMatches(existingReception, purchaseId, items);
      return existingReception;
    }
  }

  const purchase = await tx.purchase.findUnique({
      where: {
        id: purchaseId,
      },
      include: {
        supplier: true,
        purchaseItems: true,
      },
    });

    if (!purchase) {
      throw new Error("Achat introuvable.");
    }

    const receivedQuantities =
      await getReceivedQuantities(tx, purchaseId);

    const plan = validateReceptionPlan(
      purchase,
      items,
      receivedQuantities
    );

    const receptionNumber = await generateReference("REC", tx);

    const reception = await tx.reception.create({
      data: {
        receptionNumber,
        idempotencyKey,
        purchaseId,
        totalQuantity: plan.totalQuantity,
        remainingQuantity: plan.remainingQuantity,
        notes: data.notes || null,
        receivedAt: data.receivedAt
          ? new Date(data.receivedAt)
          : new Date(),
      },
    });

    for (const item of plan.items) {
      const receptionItem =
        await tx.receptionItem.create({
          data: {
            receptionId: reception.id,
            purchaseItemId: item.purchaseItemId,
            quantityReceived: item.quantityReceived,
            quantityRemaining: item.quantityRemaining,
            notes: item.notes || null,
          },
        });

      const inventory = await createInventoryFromReceptionItem(
        tx,
        purchase,
        item.purchaseItem,
        {
          ...item,
          id: receptionItem.id,
          receptionId: receptionItem.receptionId,
        }
      );

      const linkedInventoryCount =
        await tx.inventory.count({
          where: {
            id: inventory.id,
            receptionItemId: receptionItem.id,
          },
        });

      if (linkedInventoryCount === 0) {
        throw new Error(
          "Création inventaire non exécutée pour la réception complète."
        );
      }

      await tx.receptionItem.update({
        where: {
          id: receptionItem.id,
        },
        data: {
          inventoryCreated: true,
        },
      });
    }

    await updatePurchaseReceptionState(tx, purchaseId);

    return tx.reception.findUnique({
      where: {
        id: reception.id,
      },
      include: RECEPTION_RESULT_INCLUDE,
    });
}

async function createReception(data) {
  const idempotencyKey = normalizeIdempotencyKey(data.idempotencyKey);

  try {
    return await runSerializableTransaction((tx) =>
      createReceptionTransaction(tx, data)
    );
  } catch (error) {
    if (!idempotencyKey || error?.code !== "P2002") {
      throw error;
    }

    const existingReception = await findReceptionByIdempotencyKey(
      prisma,
      idempotencyKey
    );

    if (!existingReception) {
      throw error;
    }

    const items = normalizeReceptionItems(
      data.items || data.receptionItems
    );
    assertIdempotentPayloadMatches(
      existingReception,
      data.purchaseId,
      items
    );
    return existingReception;
  }
}

module.exports = {
  createReception,
  isRetryableTransactionError,
  runSerializableTransaction,
};
