/*
  Warnings:

  - You are about to drop the column `icon_url` on the `Coin` table. All the data in the column will be lost.
  - Added the required column `ath` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `atl` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `circulating_supply` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `current_price_usd` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fully_diluted_valuation` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homepage` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `images` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `market_cap` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `market_cap_rank` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `twitter` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `twitter_followers` to the `Coin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coin" DROP COLUMN "icon_url",
ADD COLUMN     "ath" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "atl" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "circulating_supply" INTEGER NOT NULL,
ADD COLUMN     "current_price_usd" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "fully_diluted_valuation" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "homepage" TEXT NOT NULL,
ADD COLUMN     "images" JSONB NOT NULL,
ADD COLUMN     "market_cap" INTEGER NOT NULL,
ADD COLUMN     "market_cap_rank" INTEGER NOT NULL,
ADD COLUMN     "twitter" TEXT NOT NULL,
ADD COLUMN     "twitter_followers" INTEGER NOT NULL;
