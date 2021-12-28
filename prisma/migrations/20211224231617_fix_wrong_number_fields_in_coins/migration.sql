/*
  Warnings:

  - You are about to alter the column `ath` on the `Coin` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `atl` on the `Coin` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `current_price_usd` on the `Coin` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `fully_diluted_valuation` on the `Coin` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "Coin" ALTER COLUMN "ath" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "atl" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "current_price_usd" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "fully_diluted_valuation" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "market_cap" SET DATA TYPE BIGINT;
