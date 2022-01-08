/*
  Warnings:

  - A unique constraint covering the columns `[coinId,quoteSymbol,closeTime]` on the table `Ohlc` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tickers` to the `Coin` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Coin_marketCapRank_idx";

-- DropIndex
DROP INDEX "Ohlc_closeTime_idx";

-- DropIndex
DROP INDEX "Ohlc_coinId_quoteSymbol_closeTime_key";

-- DropIndex
DROP INDEX "Ohlc_coinId_quoteSymbol_idx";

-- AlterTable
ALTER TABLE "Coin" ADD COLUMN     "tickers" JSONB NOT NULL;

-- CreateIndex
CREATE INDEX "Coin_marketCapRank_idx" ON "Coin"("marketCapRank");

-- CreateIndex
CREATE INDEX "Ohlc_coinId_quoteSymbol_idx" ON "Ohlc"("coinId", "quoteSymbol");

-- CreateIndex
CREATE INDEX "Ohlc_closeTime_idx" ON "Ohlc"("closeTime" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Ohlc_coinId_quoteSymbol_closeTime_key" ON "Ohlc"("coinId", "quoteSymbol", "closeTime");
