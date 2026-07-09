const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const expenses = await prisma.expense.findMany({
      take: 10,
      orderBy: { createdAt: "desc" }
    });
    console.log("Expenses found:", expenses.length);
    console.log(JSON.stringify(expenses, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();
