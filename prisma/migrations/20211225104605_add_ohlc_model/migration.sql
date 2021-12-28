-- CreateTable
CREATE TABLE "Ohlc" (
    "id" SERIAL NOT NULL,
    "close_time" TIMESTAMP(3) NOT NULL,
    "open" DECIMAL(65,30) NOT NULL,
    "high" DECIMAL(65,30) NOT NULL,
    "low" DECIMAL(65,30) NOT NULL,
    "close" DECIMAL(65,30) NOT NULL,
    "coinId" VARCHAR(255) NOT NULL,

    CONSTRAINT "Ohlc_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ohlc" ADD CONSTRAINT "Ohlc_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
