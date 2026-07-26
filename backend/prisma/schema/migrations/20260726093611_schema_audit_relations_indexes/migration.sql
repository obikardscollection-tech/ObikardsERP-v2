/*
  Warnings:

  - A unique constraint covering the columns `[sportsCardsProId]` on the table `CardReference` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tcdbId]` on the table `CardReference` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[beckettId]` on the table `CardReference` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[psaPopulationId]` on the table `CardReference` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cardUuid]` on the table `CardReference` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CardReference_beckettId_idx";

-- DropIndex
DROP INDEX "CardReference_cardUuid_idx";

-- DropIndex
DROP INDEX "CardReference_psaPopulationId_idx";

-- DropIndex
DROP INDEX "CardReference_sportsCardsProId_idx";

-- DropIndex
DROP INDEX "CardReference_tcdbId_idx";

-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "cardReferenceId" TEXT;

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "receptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CardReference_sportsCardsProId_key" ON "CardReference"("sportsCardsProId");

-- CreateIndex
CREATE UNIQUE INDEX "CardReference_tcdbId_key" ON "CardReference"("tcdbId");

-- CreateIndex
CREATE UNIQUE INDEX "CardReference_beckettId_key" ON "CardReference"("beckettId");

-- CreateIndex
CREATE UNIQUE INDEX "CardReference_psaPopulationId_key" ON "CardReference"("psaPopulationId");

-- CreateIndex
CREATE UNIQUE INDEX "CardReference_cardUuid_key" ON "CardReference"("cardUuid");

-- CreateIndex
CREATE INDEX "Inventory_cardReferenceId_idx" ON "Inventory"("cardReferenceId");

-- CreateIndex
CREATE INDEX "StockMovement_receptionId_idx" ON "StockMovement"("receptionId");

-- CreateIndex
CREATE INDEX "StockMovement_inventoryId_createdAt_idx" ON "StockMovement"("inventoryId", "createdAt");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_cardReferenceId_fkey" FOREIGN KEY ("cardReferenceId") REFERENCES "CardReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_receptionId_fkey" FOREIGN KEY ("receptionId") REFERENCES "Reception"("id") ON DELETE SET NULL ON UPDATE CASCADE;
