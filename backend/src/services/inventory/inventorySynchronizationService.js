const prisma = require("../../lib/prisma");

const { createInventory } = require("./createInventoryService");
const inventoryMapper = require("./mappers/inventoryMapper");

const INTERNALS = {
  STATUS: {
    CREATE: "CREATE",
    UPDATE: "UPDATE",
    SKIP: "SKIP",
    INVALID: "INVALID",
  },
  ERRORS: {
    INVALID_DTO: "Le DTO inventory est invalide.",
  },
  MATCHING: {
    // First matching strategy for synchronization. New strategies can be appended here.
    STRATEGIES: [
      {
        id: "by-core-card-fingerprint",
        canMatch(dto) {
          const currentYear = new Date().getFullYear();
          const normalizedYear =
            typeof dto.year === "number"
              ? dto.year
              : typeof dto.year === "string" && dto.year.trim() !== ""
                ? Number(dto.year)
                : Number.NaN;

          return (
            typeof dto.player === "string" && dto.player.trim() !== "" &&
            Number.isInteger(normalizedYear) &&
            normalizedYear > 1800 &&
            normalizedYear <= currentYear &&
            typeof dto.series === "string" && dto.series.trim() !== "" &&
            typeof dto.cardNumber === "string" && dto.cardNumber.trim() !== ""
          );
        },
        async findExisting(dto) {
          const where = {
            player: dto.player.trim(),
            year: Number(dto.year),
            series: dto.series.trim(),
            cardNumber: dto.cardNumber.trim(),
          };

          if (typeof dto.sport === "string" && dto.sport.trim() !== "") {
            where.sport = dto.sport.trim();
          }

          if (typeof dto.grade === "string" && dto.grade.trim() !== "") {
            where.grade = dto.grade.trim();
          }

          if (dto.parallel !== undefined && dto.parallel !== null && String(dto.parallel).trim() !== "") {
            where.parallel = String(dto.parallel).trim();
          }

          if (dto.variation !== undefined && dto.variation !== null && String(dto.variation).trim() !== "") {
            where.variation = String(dto.variation).trim();
          }

          if (dto.printRun !== undefined && dto.printRun !== null && String(dto.printRun).trim() !== "") {
            where.printRun = String(dto.printRun).trim();
          }

          return prisma.inventory.findFirst({
            where,
            orderBy: {
              createdAt: "asc",
            },
          });
        },
      },
    ],
  },
};

const INVENTORY_SYNC_STATUS = Object.freeze({
  CREATE: INTERNALS.STATUS.CREATE,
  UPDATE: INTERNALS.STATUS.UPDATE,
  SKIP: INTERNALS.STATUS.SKIP,
  INVALID: INTERNALS.STATUS.INVALID,
});

/**
 * Build stable synchronization result payload.
 * @param {{status:string,entity:object|null,changes:object,warnings:string[],errors:string[]}} input
 * @returns {{status:string,entity:object|null,changes:object,warnings:string[],errors:string[]}}
 */
function createSyncResult(input) {
  return {
    status: input.status,
    entity: input.entity || null,
    changes: input.changes || {},
    warnings: Array.isArray(input.warnings) ? [...input.warnings] : [],
    errors: Array.isArray(input.errors) ? [...input.errors] : [],
  };
}

/**
 * Check whether one DTO contains at least one meaningful value.
 * @param {unknown} dto
 * @returns {boolean}
 */
function isValidDto(dto) {
  if (!dto || typeof dto !== "object" || Array.isArray(dto)) {
    return false;
  }

  for (const value of Object.values(dto)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "string" && value.trim() === "") {
      continue;
    }

    return true;
  }

  return false;
}

/**
 * Compare two scalar values with Date awareness.
 * @param {unknown} left
 * @param {unknown} right
 * @returns {boolean}
 */
function areValuesEqual(left, right) {
  if (left instanceof Date || right instanceof Date) {
    if (!(left instanceof Date) || !(right instanceof Date)) {
      return false;
    }

    return left.getTime() === right.getTime();
  }

  return left === right;
}

/**
 * Build changed fields map for update operation.
 * @param {object} existingItem
 * @param {object} mappedInput
 * @returns {object}
 */
function buildChangedFields(existingItem, mappedInput) {
  const changes = {};

  for (const [key, nextValue] of Object.entries(mappedInput)) {
    const currentValue = existingItem[key];

    if (!areValuesEqual(currentValue, nextValue)) {
      changes[key] = nextValue;
    }
  }

  return changes;
}

/**
 * Resolve an existing inventory item by ordered matching strategies.
 * @param {object} dto
 * @returns {Promise<object|null>}
 */
async function resolveExistingInventory(dto) {
  for (const strategy of INTERNALS.MATCHING.STRATEGIES) {
    if (!strategy.canMatch(dto)) {
      continue;
    }

    const existingItem = await strategy.findExisting(dto);

    if (existingItem) {
      return existingItem;
    }
  }

  return null;
}

/**
 * Synchronize one Inventory DTO into create/update/skip decision.
 * @param {object} dto
 * @returns {Promise<{status:string,entity:object|null,changes:object,warnings:string[],errors:string[]}>}
 */
async function synchronizeInventoryFromDto(dto) {
  if (!isValidDto(dto)) {
    return createSyncResult({
      status: INTERNALS.STATUS.INVALID,
      entity: null,
      changes: {},
      warnings: [],
      errors: [INTERNALS.ERRORS.INVALID_DTO],
    });
  }

  const existingItem = await resolveExistingInventory(dto);

  if (!existingItem) {
    const createdItem = await createInventory(dto);

    return createSyncResult({
      status: INTERNALS.STATUS.CREATE,
      entity: createdItem,
      changes: {},
      warnings: [],
      errors: [],
    });
  }

  const mappedInput = inventoryMapper(dto);
  const changes = buildChangedFields(existingItem, mappedInput);

  if (Object.keys(changes).length === 0) {
    return createSyncResult({
      status: INTERNALS.STATUS.SKIP,
      entity: existingItem,
      changes: {},
      warnings: [],
      errors: [],
    });
  }

  const updatedItem = await prisma.inventory.update({
    where: {
      id: existingItem.id,
    },
    data: changes,
  });

  return createSyncResult({
    status: INTERNALS.STATUS.UPDATE,
    entity: updatedItem,
    changes,
    warnings: [],
    errors: [],
  });
}

module.exports = {
  INVENTORY_SYNC_STATUS,
  synchronizeInventoryFromDto,
};
