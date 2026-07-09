const prisma = require("../../lib/prisma");
const { generateReference } = require("../common/referenceGeneratorService");

const prefixMap = {
  NBA: "NBA",
  NFL: "NFL",
  MLB: "MLB",
  Soccer: "SOC",
  NHL: "NHL",
  F1: "F1",
  UFC: "UFC",
  Pokémon: "PKM",
  Fournitures: "SUP",
  Luxe: "LUX",
  Antiquités: "ANT",
};

async function generateSku(category, tx) {
  // Use centralized generator with transaction if provided
  if (tx) {
    return generateReference("INV", tx);
  }
  
  // Fallback for non-transaction context
  return prisma.$transaction(async (transaction) => {
    return generateReference("INV", transaction);
  });
}

module.exports = {
  generateSku,
};