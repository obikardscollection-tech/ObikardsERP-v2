-- CreateTable
CREATE TABLE "CardReference" (
    "id" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "league" TEXT,
    "year" INTEGER NOT NULL,
    "manufacturer" TEXT,
    "brand" TEXT,
    "set" TEXT,
    "subset" TEXT,
    "cardNumber" TEXT,
    "player" TEXT NOT NULL,
    "playerDisplayName" TEXT,
    "team" TEXT,
    "parallel" TEXT,
    "variation" TEXT,
    "rookie" BOOLEAN NOT NULL DEFAULT false,
    "autograph" BOOLEAN NOT NULL DEFAULT false,
    "memorabilia" BOOLEAN NOT NULL DEFAULT false,
    "insert" BOOLEAN NOT NULL DEFAULT false,
    "printRun" INTEGER,
    "language" TEXT,
    "referenceFingerprint" TEXT NOT NULL,
    "sportsCardsProId" TEXT,
    "tcdbId" TEXT,
    "beckettId" TEXT,
    "psaPopulationId" TEXT,
    "cardUuid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardReference_referenceFingerprint_key" ON "CardReference"("referenceFingerprint");

-- CreateIndex
CREATE INDEX "CardReference_player_idx" ON "CardReference"("player");

-- CreateIndex
CREATE INDEX "CardReference_year_idx" ON "CardReference"("year");

-- CreateIndex
CREATE INDEX "CardReference_sport_idx" ON "CardReference"("sport");

-- CreateIndex
CREATE INDEX "CardReference_manufacturer_idx" ON "CardReference"("manufacturer");

-- CreateIndex
CREATE INDEX "CardReference_brand_idx" ON "CardReference"("brand");

-- CreateIndex
CREATE INDEX "CardReference_set_idx" ON "CardReference"("set");

-- CreateIndex
CREATE INDEX "CardReference_parallel_idx" ON "CardReference"("parallel");

-- CreateIndex
CREATE INDEX "CardReference_variation_idx" ON "CardReference"("variation");

-- CreateIndex
CREATE INDEX "CardReference_cardNumber_idx" ON "CardReference"("cardNumber");
