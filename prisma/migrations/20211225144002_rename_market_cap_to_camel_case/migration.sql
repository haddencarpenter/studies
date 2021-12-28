/*
  Warnings:

  - You are about to drop the column `market_cap` on the `Coin` table. All the data in the column will be lost.
  - Added the required column `marketCap` to the `Coin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coin" DROP COLUMN "market_cap",
ADD COLUMN     "marketCap" BIGINT NOT NULL;
