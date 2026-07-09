-- CreateTable
CREATE TABLE "Reception" (
    "id" TEXT NOT NULL,
    "receptionNumber" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "remainingQuantity" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceptionItem" (
    "id" TEXT NOT NULL,
    "receptionId" TEXT NOT NULL,
    "purchaseItemId" TEXT NOT NULL,
    "quantityReceived" INTEGER NOT NULL,
    "quantityRemaining" INTEGER NOT NULL,
    "inventoryCreated" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceptionItem_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN "receptionItemId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reception_receptionNumber_key" ON "Reception"("receptionNumber");

-- CreateIndex
CREATE INDEX "Reception_purchaseId_idx" ON "Reception"("purchaseId");

-- CreateIndex
CREATE INDEX "Reception_receivedAt_idx" ON "Reception"("receivedAt");

-- CreateIndex
CREATE INDEX "ReceptionItem_receptionId_idx" ON "ReceptionItem"("receptionId");

-- CreateIndex
CREATE INDEX "ReceptionItem_purchaseItemId_idx" ON "ReceptionItem"("purchaseItemId");

-- CreateIndex
CREATE INDEX "ReceptionItem_inventoryCreated_idx" ON "ReceptionItem"("inventoryCreated");

-- CreateIndex
CREATE INDEX "Inventory_receptionItemId_idx" ON "Inventory"("receptionItemId");

-- AddForeignKey
ALTER TABLE "Reception" ADD CONSTRAINT "Reception_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceptionItem" ADD CONSTRAINT "ReceptionItem_receptionId_fkey" FOREIGN KEY ("receptionId") REFERENCES "Reception"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceptionItem" ADD CONSTRAINT "ReceptionItem_purchaseItemId_fkey" FOREIGN KEY ("purchaseItemId") REFERENCES "PurchaseItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_receptionItemId_fkey" FOREIGN KEY ("receptionItemId") REFERENCES "ReceptionItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
