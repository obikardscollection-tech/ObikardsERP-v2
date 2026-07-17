-- CreateIndex
CREATE INDEX "CardReference_sport_player_idx" ON "CardReference"("sport", "player");

-- CreateIndex
CREATE INDEX "CardReference_sport_year_idx" ON "CardReference"("sport", "year");

-- CreateIndex
CREATE INDEX "CardReference_player_year_idx" ON "CardReference"("player", "year");

-- CreateIndex
CREATE INDEX "CardReference_manufacturer_brand_set_idx" ON "CardReference"("manufacturer", "brand", "set");

-- CreateIndex
CREATE INDEX "CardReference_year_brand_set_idx" ON "CardReference"("year", "brand", "set");

-- CreateIndex
CREATE INDEX "CardReference_sport_player_year_idx" ON "CardReference"("sport", "player", "year");
