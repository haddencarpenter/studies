/*
  Warnings:

  - Added the required column `quoteSymbol` to the `Ohlc` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Coin_marketCapRank_idx";

-- DropIndex
DROP INDEX "Ohlc_closeTime_idx";

-- DropIndex
DROP INDEX "Ohlc_coinId_idx";

-- AlterTable
ALTER TABLE "Ohlc" ADD COLUMN     "quoteSymbol" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Coin_marketCapRank_idx" ON "Coin"("marketCapRank");

-- CreateIndex
CREATE INDEX "Ohlc_coinId_quoteSymbol_idx" ON "Ohlc"("coinId", "quoteSymbol");

-- CreateIndex
CREATE INDEX "Ohlc_closeTime_idx" ON "Ohlc"("closeTime" DESC);
