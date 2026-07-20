const prisma = require("../../../lib/prisma");

/**
 * Persist one CardReference row.
 * @param {object} data
 */
async function create(data) {
  return prisma.cardReference.create({
    data,
  });
}

/**
 * Read one CardReference by id.
 * @param {string} id
 */
async function findById(id) {
  return prisma.cardReference.findUnique({
    where: {
      id,
    },
  });
}

/**
 * Read one CardReference by reference fingerprint.
 * @param {string} referenceFingerprint
 */
async function findByReferenceFingerprint(referenceFingerprint) {
  return prisma.cardReference.findUnique({
    where: {
      referenceFingerprint,
    },
  });
}

/**
 * Read one CardReference by SportsCardsPro id.
 * @param {string} sportsCardsProId
 */
async function findBySportsCardsProId(sportsCardsProId) {
  return prisma.cardReference.findFirst({
    where: {
      sportsCardsProId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Read one CardReference by TCDB id.
 * @param {string} tcdbId
 */
async function findByTcdbId(tcdbId) {
  return prisma.cardReference.findFirst({
    where: {
      tcdbId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Update one external identifier field for a CardReference.
 * @param {string} id
 * @param {string} field
 * @param {string} value
 */
async function updateExternalIdentifier(id, field, value) {
  return prisma.cardReference.update({
    where: {
      id,
    },
    data: {
      [field]: value,
    },
  });
}

module.exports = {
  create,
  findById,
  findByReferenceFingerprint,
  findBySportsCardsProId,
  findByTcdbId,
  updateExternalIdentifier,
};
