const prisma = require("../../lib/prisma");
const { mapRowToSyncPayload } = require("./sportsCardsProMapperService");
const { buildChangedFields } = require("./sportsCardsProHelpers");
const { manageSnapshot } = require("./sportsCardsProSnapshotService");
const {
  MARKET_CARD_SYNC_FIELDS,
  PROVIDER_CARD_SYNC_FIELDS,
} = require("./sportsCardsProConstants");

async function synchronizeOneRow(providerId, row, stats, synchronizedAt) {
  const payload = mapRowToSyncPayload(row, synchronizedAt);

  await prisma.$transaction(async (tx) => {
    const existingCard = await tx.marketCard.findUnique({
      where: {
        fingerprint: payload.marketCard.fingerprint,
      },
    });

    let marketCard = existingCard;

    if (!existingCard) {
      marketCard = await tx.marketCard.create({
        data: payload.marketCard,
      });
      stats.cardsCreated += 1;
    } else {
      const changedCardFields = buildChangedFields(
        existingCard,
        payload.marketCard,
        MARKET_CARD_SYNC_FIELDS
      );

      if (Object.keys(changedCardFields).length > 0) {
        marketCard = await tx.marketCard.update({
          where: {
            id: existingCard.id,
          },
          data: changedCardFields,
        });

        stats.cardsUpdated += 1;
      }
    }

    const existingProviderCard = await tx.marketProviderCard.findUnique({
      where: {
        marketProviderId_providerCardId: {
          marketProviderId: providerId,
          providerCardId: payload.providerCardId,
        },
      },
    });

    let providerCard = existingProviderCard;

    if (!existingProviderCard) {
      providerCard = await tx.marketProviderCard.create({
        data: {
          marketCardId: marketCard.id,
          marketProviderId: providerId,
          providerCardId: payload.providerCardId,
          providerUrl: payload.providerUrl,
          providerChecksum: payload.providerChecksum,
          active: true,
          firstSeenAt: synchronizedAt,
          lastSeenAt: synchronizedAt,
        },
      });

      stats.providerCardsCreated += 1;
    } else {
      const changedProviderFields = buildChangedFields(
        existingProviderCard,
        {
          marketCardId: marketCard.id,
          providerUrl: payload.providerUrl,
          providerChecksum: payload.providerChecksum,
          active: true,
          lastSeenAt: synchronizedAt,
        },
        PROVIDER_CARD_SYNC_FIELDS
      );

      changedProviderFields.lastSeenAt = synchronizedAt;

      providerCard = await tx.marketProviderCard.update({
        where: {
          id: existingProviderCard.id,
        },
        data: changedProviderFields,
      });

      if (Object.keys(changedProviderFields).length > 1) {
        stats.providerCardsUpdated += 1;
      }
    }

    await manageSnapshot(tx, providerCard.id, payload.snapshot, stats);
  });

  stats.processedRows += 1;
  return true;
}

module.exports = {
  synchronizeOneRow,
};
