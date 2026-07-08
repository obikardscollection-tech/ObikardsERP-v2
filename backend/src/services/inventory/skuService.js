const prisma = require("../../lib/prisma");

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

async function generateSku(category) {
  const prefix = prefixMap[category] || "OBI";

  const lastItem = await prisma.inventory.findFirst({
    where: {
      category,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let next = 1;

  if (lastItem?.sku) {
    const parts = lastItem.sku.split("-");

    if (parts.length === 2) {
      next = Number(parts[1]) + 1;
    }
  }

  return `${prefix}-${String(next).padStart(6, "0")}`;
}

module.exports = {
  generateSku,
};