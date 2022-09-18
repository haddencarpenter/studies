/*
  Warnings:

  - A unique constraint covering the columns `[coinId,quoteSymbol,closeTime]` on the table `Ohlc` will be added. If there are existing duplicate values, this will fail.

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
ALTER TABLE "Coin" ADD COLUMN     "coinpaprikaActive" BOOLEAN,
ADD COLUMN     "coinpaprikaContracts" JSONB,
ADD COLUMN     "coinpaprikaDescription" TEXT,
ADD COLUMN     "coinpaprikaDevelopmentStatus" TEXT,
ADD COLUMN     "coinpaprikaHardwarewallet" BOOLEAN,
ADD COLUMN     "coinpaprikaHashAlgorithm" TEXT,
ADD COLUMN     "coinpaprikaId" VARCHAR(255),
ADD COLUMN     "coinpaprikaLaunchDateStart" TEXT,
ADD COLUMN     "coinpaprikaLinks" JSONB,
ADD COLUMN     "coinpaprikaLinksExtended" JSONB,
ADD COLUMN     "coinpaprikaMessage" TEXT,
ADD COLUMN     "coinpaprikaName" TEXT,
ADD COLUMN     "coinpaprikaOpenSource" BOOLEAN,
ADD COLUMN     "coinpaprikaOrgStructure" TEXT,
ADD COLUMN     "coinpaprikaProofType" TEXT,
ADD COLUMN     "coinpaprikaRank" INTEGER,
ADD COLUMN     "coinpaprikaTags" TEXT[],
ADD COLUMN     "coinpaprikaTeam" JSONB,
ADD COLUMN     "coinpaprikaWhitepaper" JSONB;

-- CreateIndex
CREATE INDEX "Coin_marketCapRank_idx" ON "Coin"("marketCapRank");

-- CreateIndex
CREATE INDEX "Ohlc_coinId_quoteSymbol_idx" ON "Ohlc"("coinId", "quoteSymbol");

-- CreateIndex
CREATE INDEX "Ohlc_closeTime_idx" ON "Ohlc"("closeTime" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Ohlc_coinId_quoteSymbol_closeTime_key" ON "Ohlc"("coinId", "quoteSymbol", "closeTime");
