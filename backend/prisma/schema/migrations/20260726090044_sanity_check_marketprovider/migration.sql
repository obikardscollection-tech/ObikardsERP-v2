-- CreateEnum
CREATE TYPE "MarketLinkStatus" AS ENUM ('NOT_FOUND', 'LINKED', 'MULTIPLE_MATCHES');

-- CreateEnum
CREATE TYPE "InventoryMarketProvider" AS ENUM ('SPORTSCARDSPRO');

-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('USD', 'EUR');

-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "margin" DOUBLE PRECISION,
ADD COLUMN     "marketCurrency" TEXT,
ADD COLUMN     "marketLastRefreshAt" TIMESTAMP(3),
ADD COLUMN     "marketLinkStatus" "MarketLinkStatus" DEFAULT 'NOT_FOUND',
ADD COLUMN     "marketMatches" JSONB,
ADD COLUMN     "marketSource" TEXT,
ADD COLUMN     "marketValueEur" DOUBLE PRECISION,
ADD COLUMN     "marketValueUsd" DOUBLE PRECISION,
ADD COLUMN     "profit" DOUBLE PRECISION,
ADD COLUMN     "roi" DOUBLE PRECISION,
ADD COLUMN     "sportsCardsProId" TEXT;

-- AlterTable
ALTER TABLE "MarketImportJob" ADD COLUMN     "processedRows" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "skippedRows" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalRows" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "InventoryMarketSnapshot" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "provider" "InventoryMarketProvider" NOT NULL,
    "providerCardId" TEXT,
    "currency" "CurrencyCode" NOT NULL,
    "valueUsd" DOUBLE PRECISION,
    "valueEur" DOUBLE PRECISION,
    "exchangeRate" DOUBLE PRECISION,
    "profit" DOUBLE PRECISION,
    "margin" DOUBLE PRECISION,
    "roi" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMarketSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryMarketSnapshot_inventoryId_idx" ON "InventoryMarketSnapshot"("inventoryId");

-- CreateIndex
CREATE INDEX "InventoryMarketSnapshot_createdAt_idx" ON "InventoryMarketSnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "InventoryMarketSnapshot_inventoryId_createdAt_idx" ON "InventoryMarketSnapshot"("inventoryId", "createdAt");

-- CreateIndex
CREATE INDEX "CardReference_sportsCardsProId_idx" ON "CardReference"("sportsCardsProId");

-- CreateIndex
CREATE INDEX "CardReference_tcdbId_idx" ON "CardReference"("tcdbId");

-- CreateIndex
CREATE INDEX "CardReference_beckettId_idx" ON "CardReference"("beckettId");

-- CreateIndex
CREATE INDEX "CardReference_psaPopulationId_idx" ON "CardReference"("psaPopulationId");

-- CreateIndex
CREATE INDEX "CardReference_cardUuid_idx" ON "CardReference"("cardUuid");

-- AddForeignKey
ALTER TABLE "InventoryMarketSnapshot" ADD CONSTRAINT "InventoryMarketSnapshot_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
