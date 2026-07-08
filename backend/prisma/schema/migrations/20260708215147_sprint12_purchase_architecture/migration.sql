/*
  Warnings:

  - You are about to drop the column `inventoryId` on the `PurchaseItem` table. All the data in the column will be lost.
  - Added the required column `name` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PurchasePlatform" ADD VALUE 'FACEBOOK';
ALTER TYPE "PurchasePlatform" ADD VALUE 'INSTAGRAM';
ALTER TYPE "PurchasePlatform" ADD VALUE 'SHOP';
ALTER TYPE "PurchasePlatform" ADD VALUE 'DISTRIBUTOR';

-- AlterEnum
ALTER TYPE "PurchaseStatus" ADD VALUE 'PARTIALLY_RECEIVED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SalePlatform" ADD VALUE 'FACEBOOK';
ALTER TYPE "SalePlatform" ADD VALUE 'SHOP';

-- AlterEnum
ALTER TYPE "SaleStatus" ADD VALUE 'PARTIALLY_REFUNDED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StockMovementSource" ADD VALUE 'PURCHASE';
ALTER TYPE "StockMovementSource" ADD VALUE 'SALE';
ALTER TYPE "StockMovementSource" ADD VALUE 'CARDHEDGE';
ALTER TYPE "StockMovementSource" ADD VALUE 'SCANNER';
ALTER TYPE "StockMovementSource" ADD VALUE 'INVENTORY';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StockMovementType" ADD VALUE 'RECEIPT';
ALTER TYPE "StockMovementType" ADD VALUE 'TRANSFER';
ALTER TYPE "StockMovementType" ADD VALUE 'INVENTORY';
ALTER TYPE "StockMovementType" ADD VALUE 'RESERVED';
ALTER TYPE "StockMovementType" ADD VALUE 'RELEASED';

-- DropForeignKey
ALTER TABLE "PurchaseItem" DROP CONSTRAINT "PurchaseItem_inventoryId_fkey";

-- DropIndex
DROP INDEX "PurchaseItem_inventoryId_idx";

-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "purchaseItemId" TEXT;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "totalItems" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PurchaseItem" DROP COLUMN "inventoryId",
ADD COLUMN     "cardReference" TEXT,
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "inventoryCreated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "totalItems" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "purchaseId" TEXT,
ADD COLUMN     "saleId" TEXT;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Inventory_purchaseItemId_idx" ON "Inventory"("purchaseItemId");

-- CreateIndex
CREATE INDEX "Purchase_currency_idx" ON "Purchase"("currency");

-- CreateIndex
CREATE INDEX "PurchaseItem_name_idx" ON "PurchaseItem"("name");

-- CreateIndex
CREATE INDEX "PurchaseItem_cardReference_idx" ON "PurchaseItem"("cardReference");

-- CreateIndex
CREATE INDEX "PurchaseItem_inventoryCreated_idx" ON "PurchaseItem"("inventoryCreated");

-- CreateIndex
CREATE INDEX "Sale_currency_idx" ON "Sale"("currency");

-- CreateIndex
CREATE INDEX "SaleItem_sku_idx" ON "SaleItem"("sku");

-- CreateIndex
CREATE INDEX "StockMovement_purchaseId_idx" ON "StockMovement"("purchaseId");

-- CreateIndex
CREATE INDEX "StockMovement_saleId_idx" ON "StockMovement"("saleId");

-- CreateIndex
CREATE INDEX "Supplier_country_idx" ON "Supplier"("country");

-- CreateIndex
CREATE INDEX "Supplier_currency_idx" ON "Supplier"("currency");

-- CreateIndex
CREATE INDEX "Supplier_isActive_idx" ON "Supplier"("isActive");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_purchaseItemId_fkey" FOREIGN KEY ("purchaseItemId") REFERENCES "PurchaseItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
