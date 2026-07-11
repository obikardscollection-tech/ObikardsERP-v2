-- CreateEnum
CREATE TYPE "MarketProviderType" AS ENUM ('CSV', 'API', 'BOTH');

-- CreateEnum
CREATE TYPE "MarketImportStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MarketReferenceType" AS ENUM ('SPORT', 'LEAGUE', 'PLAYER', 'TEAM', 'BRAND', 'SET', 'SUBSET', 'PARALLEL', 'VARIATION', 'YEAR', 'LANGUAGE', 'COUNTRY');

-- CreateEnum
CREATE TYPE "MarketImportSource" AS ENUM ('CSV', 'API', 'MANUAL', 'SCHEDULER');

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "customerNumber" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Supplier" ALTER COLUMN "supplierNumber" DROP DEFAULT;

-- CreateTable
CREATE TABLE "MarketProviderCard" (
    "id" TEXT NOT NULL,
    "marketCardId" TEXT NOT NULL,
    "marketProviderId" TEXT NOT NULL,
    "providerCardId" TEXT NOT NULL,
    "providerUrl" TEXT,
    "providerChecksum" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketProviderCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketSnapshot" (
    "id" TEXT NOT NULL,
    "marketProviderCardId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "rawPrice" DECIMAL(10,2),
    "psa8Price" DECIMAL(10,2),
    "psa9Price" DECIMAL(10,2),
    "psa10Price" DECIMAL(10,2),
    "bgs10Price" DECIMAL(10,2),
    "cgc10Price" DECIMAL(10,2),
    "sgc10Price" DECIMAL(10,2),
    "retailBuy" DECIMAL(10,2),
    "retailSell" DECIMAL(10,2),
    "salesVolume" INTEGER,
    "lastSalePrice" DECIMAL(10,2),
    "lastSaleDate" TIMESTAMP(3),
    "population" INTEGER,
    "providerUpdatedAt" TIMESTAMP(3),
    "synchronizedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketAnalytics" (
    "id" TEXT NOT NULL,
    "marketCardId" TEXT NOT NULL,
    "averagePrice" DECIMAL(10,2),
    "medianPrice" DECIMAL(10,2),
    "minPrice" DECIMAL(10,2),
    "maxPrice" DECIMAL(10,2),
    "volatility" DOUBLE PRECISION,
    "liquidity" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION,
    "trendScore" DOUBLE PRECISION,
    "marketScore" DOUBLE PRECISION,
    "growth7d" DOUBLE PRECISION,
    "growth30d" DOUBLE PRECISION,
    "growth90d" DOUBLE PRECISION,
    "growth1y" DOUBLE PRECISION,
    "recommendedBuyPrice" DECIMAL(10,2),
    "recommendedSellPrice" DECIMAL(10,2),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketCard" (
    "id" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "league" TEXT,
    "player" TEXT NOT NULL,
    "team" TEXT,
    "brand" TEXT NOT NULL,
    "set" TEXT NOT NULL,
    "subset" TEXT,
    "year" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "cardNumber" TEXT,
    "parallel" TEXT,
    "variation" TEXT,
    "rookie" BOOLEAN NOT NULL DEFAULT false,
    "autograph" BOOLEAN NOT NULL DEFAULT false,
    "memorabilia" BOOLEAN NOT NULL DEFAULT false,
    "serialNumbered" BOOLEAN NOT NULL DEFAULT false,
    "printRun" INTEGER,
    "language" TEXT NOT NULL DEFAULT 'EN',
    "country" TEXT,
    "releaseDate" TIMESTAMP(3),
    "slug" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "searchText" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketHistory" (
    "id" TEXT NOT NULL,
    "marketProviderCardId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "rawPrice" DECIMAL(10,2),
    "psa8Price" DECIMAL(10,2),
    "psa9Price" DECIMAL(10,2),
    "psa10Price" DECIMAL(10,2),
    "bgs10Price" DECIMAL(10,2),
    "cgc10Price" DECIMAL(10,2),
    "sgc10Price" DECIMAL(10,2),
    "retailBuy" DECIMAL(10,2),
    "retailSell" DECIMAL(10,2),
    "salesVolume" INTEGER,
    "lastSalePrice" DECIMAL(10,2),
    "lastSaleDate" TIMESTAMP(3),
    "population" INTEGER,
    "providerUpdatedAt" TIMESTAMP(3),
    "synchronizedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketImportError" (
    "id" TEXT NOT NULL,
    "marketImportJobId" TEXT NOT NULL,
    "lineNumber" INTEGER,
    "providerCardId" TEXT,
    "field" TEXT,
    "errorCode" TEXT,
    "message" TEXT NOT NULL,
    "rawData" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketImportError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketImportJob" (
    "id" TEXT NOT NULL,
    "marketProviderId" TEXT NOT NULL,
    "status" "MarketImportStatus" NOT NULL,
    "source" "MarketImportSource" NOT NULL,
    "fileName" TEXT,
    "fileHash" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "cardsCreated" INTEGER NOT NULL DEFAULT 0,
    "cardsUpdated" INTEGER NOT NULL DEFAULT 0,
    "providerCardsCreated" INTEGER NOT NULL DEFAULT 0,
    "providerCardsUpdated" INTEGER NOT NULL DEFAULT 0,
    "snapshotsCreated" INTEGER NOT NULL DEFAULT 0,
    "historyCreated" INTEGER NOT NULL DEFAULT 0,
    "referencesUpdated" INTEGER NOT NULL DEFAULT 0,
    "analyticsUpdated" INTEGER NOT NULL DEFAULT 0,
    "errorsCount" INTEGER NOT NULL DEFAULT 0,
    "warningsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketProvider" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MarketProviderType" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "supportsCsv" BOOLEAN NOT NULL DEFAULT false,
    "supportsApi" BOOLEAN NOT NULL DEFAULT false,
    "apiDailyLimit" INTEGER,
    "apiCallsToday" INTEGER NOT NULL DEFAULT 0,
    "lastCsvSync" TIMESTAMP(3),
    "lastApiSync" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketReference" (
    "id" TEXT NOT NULL,
    "type" "MarketReferenceType" NOT NULL,
    "value" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketProviderCard_marketCardId_idx" ON "MarketProviderCard"("marketCardId");

-- CreateIndex
CREATE INDEX "MarketProviderCard_marketProviderId_idx" ON "MarketProviderCard"("marketProviderId");

-- CreateIndex
CREATE INDEX "MarketProviderCard_providerCardId_idx" ON "MarketProviderCard"("providerCardId");

-- CreateIndex
CREATE INDEX "MarketProviderCard_active_idx" ON "MarketProviderCard"("active");

-- CreateIndex
CREATE UNIQUE INDEX "MarketProviderCard_marketProviderId_providerCardId_key" ON "MarketProviderCard"("marketProviderId", "providerCardId");

-- CreateIndex
CREATE INDEX "MarketSnapshot_marketProviderCardId_idx" ON "MarketSnapshot"("marketProviderCardId");

-- CreateIndex
CREATE INDEX "MarketSnapshot_synchronizedAt_idx" ON "MarketSnapshot"("synchronizedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MarketSnapshot_marketProviderCardId_key" ON "MarketSnapshot"("marketProviderCardId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketAnalytics_marketCardId_key" ON "MarketAnalytics"("marketCardId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketCard_slug_key" ON "MarketCard"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MarketCard_fingerprint_key" ON "MarketCard"("fingerprint");

-- CreateIndex
CREATE INDEX "MarketCard_player_idx" ON "MarketCard"("player");

-- CreateIndex
CREATE INDEX "MarketCard_team_idx" ON "MarketCard"("team");

-- CreateIndex
CREATE INDEX "MarketCard_brand_idx" ON "MarketCard"("brand");

-- CreateIndex
CREATE INDEX "MarketCard_set_idx" ON "MarketCard"("set");

-- CreateIndex
CREATE INDEX "MarketCard_year_idx" ON "MarketCard"("year");

-- CreateIndex
CREATE INDEX "MarketCard_fingerprint_idx" ON "MarketCard"("fingerprint");

-- CreateIndex
CREATE INDEX "MarketHistory_marketProviderCardId_idx" ON "MarketHistory"("marketProviderCardId");

-- CreateIndex
CREATE INDEX "MarketHistory_synchronizedAt_idx" ON "MarketHistory"("synchronizedAt");

-- CreateIndex
CREATE INDEX "MarketImportError_marketImportJobId_idx" ON "MarketImportError"("marketImportJobId");

-- CreateIndex
CREATE INDEX "MarketImportError_providerCardId_idx" ON "MarketImportError"("providerCardId");

-- CreateIndex
CREATE INDEX "MarketImportError_errorCode_idx" ON "MarketImportError"("errorCode");

-- CreateIndex
CREATE INDEX "MarketImportError_resolved_idx" ON "MarketImportError"("resolved");

-- CreateIndex
CREATE INDEX "MarketImportJob_marketProviderId_idx" ON "MarketImportJob"("marketProviderId");

-- CreateIndex
CREATE INDEX "MarketImportJob_status_idx" ON "MarketImportJob"("status");

-- CreateIndex
CREATE INDEX "MarketImportJob_source_idx" ON "MarketImportJob"("source");

-- CreateIndex
CREATE INDEX "MarketImportJob_startedAt_idx" ON "MarketImportJob"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MarketProvider_code_key" ON "MarketProvider"("code");

-- CreateIndex
CREATE INDEX "MarketReference_type_idx" ON "MarketReference"("type");

-- CreateIndex
CREATE INDEX "MarketReference_value_idx" ON "MarketReference"("value");

-- CreateIndex
CREATE INDEX "MarketReference_active_idx" ON "MarketReference"("active");

-- CreateIndex
CREATE UNIQUE INDEX "MarketReference_type_value_key" ON "MarketReference"("type", "value");

-- AddForeignKey
ALTER TABLE "MarketProviderCard" ADD CONSTRAINT "MarketProviderCard_marketCardId_fkey" FOREIGN KEY ("marketCardId") REFERENCES "MarketCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketProviderCard" ADD CONSTRAINT "MarketProviderCard_marketProviderId_fkey" FOREIGN KEY ("marketProviderId") REFERENCES "MarketProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketSnapshot" ADD CONSTRAINT "MarketSnapshot_marketProviderCardId_fkey" FOREIGN KEY ("marketProviderCardId") REFERENCES "MarketProviderCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketAnalytics" ADD CONSTRAINT "MarketAnalytics_marketCardId_fkey" FOREIGN KEY ("marketCardId") REFERENCES "MarketCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketHistory" ADD CONSTRAINT "MarketHistory_marketProviderCardId_fkey" FOREIGN KEY ("marketProviderCardId") REFERENCES "MarketProviderCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketImportError" ADD CONSTRAINT "MarketImportError_marketImportJobId_fkey" FOREIGN KEY ("marketImportJobId") REFERENCES "MarketImportJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketImportJob" ADD CONSTRAINT "MarketImportJob_marketProviderId_fkey" FOREIGN KEY ("marketProviderId") REFERENCES "MarketProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
