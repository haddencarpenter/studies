/*
  Warnings:

  - You are about to drop the column `circulating_supply` on the `Coin` table. All the data in the column will be lost.
  - You are about to drop the column `current_price_usd` on the `Coin` table. All the data in the column will be lost.
  - You are about to drop the column `fully_diluted_valuation` on the `Coin` table. All the data in the column will be lost.
  - You are about to drop the column `market_cap_rank` on the `Coin` table. All the data in the column will be lost.
  - You are about to drop the column `twitter_followers` on the `Coin` table. All the data in the column will be lost.
  - You are about to drop the column `close_time` on the `Ohlc` table. All the data in the column will be lost.
  - Added the required column `circulatingSupply` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentPriceUsd` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marketCapRank` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `twitterFollowers` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `closeTime` to the `Ohlc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coin" DROP COLUMN "circulating_supply",
DROP COLUMN "current_price_usd",
DROP COLUMN "fully_diluted_valuation",
DROP COLUMN "market_cap_rank",
DROP COLUMN "twitter_followers",
ADD COLUMN     "circulatingSupply" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "currentPriceUsd" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "fullyDilutedValuation" DECIMAL(65,30),
ADD COLUMN     "marketCapRank" INTEGER NOT NULL,
ADD COLUMN     "twitterFollowers" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Ohlc" DROP COLUMN "close_time",
ADD COLUMN     "closeTime" TIMESTAMP(3) NOT NULL;
