-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('OFFICE', 'SHIPPING', 'SUPPLIES', 'SOFTWARE', 'MARKETING', 'TRAVEL', 'FUEL', 'BANK', 'ACCOUNTING', 'INSURANCE', 'RENT', 'PHONE', 'INTERNET', 'EBAY_FEES', 'WHATNOT_FEES', 'WOOCOMMERCE_FEES', 'PAYPAL_FEES', 'STRIPE_FEES', 'SALARY', 'TRAINING', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE', 'CASH', 'CHECK', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PENDING', 'REFUNDED');

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "expenseNumber" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "supplierId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amountHT" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "amountTTC" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "invoiceNumber" TEXT,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Expense_expenseNumber_key" ON "Expense"("expenseNumber");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "Expense_supplierId_idx" ON "Expense"("supplierId");

-- CreateIndex
CREATE INDEX "Expense_expenseDate_idx" ON "Expense"("expenseDate");

-- CreateIndex
CREATE INDEX "Expense_paymentStatus_idx" ON "Expense"("paymentStatus");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
