import dotenv from 'dotenv';
import axios from 'axios'

import prisma from '../lib/prisma.mjs';

import { getSupportedFutureMarkets, getOpenInterest, getFundingRate } from '../lib/coinalyze.mjs';

dotenv.config();

const preferredMarkets = ['A', '6'];

const fetchCoinalyze = async () => {
  let supportedFutureMarkets = await getSupportedFutureMarkets();
  supportedFutureMarkets = supportedFutureMarkets.data.filter(market => market.is_perpetual);

  const databaseCoins = await prisma.coin.findMany({
    select: {
      symbol: true,
      id: true,
    },
    where: {
      symbol: {
        in: supportedFutureMarkets.map(market => market.base_asset.toLowerCase())
      }
    }
  });
  for (const coin of databaseCoins) {
    const supportedMarketsForCoin = supportedFutureMarkets.filter(market => market.base_asset.toLowerCase() === coin.symbol);
    let market = supportedMarketsForCoin.find(market => preferredMarkets.includes(market.exchange));
    if (!market) {
      market = supportedMarketsForCoin[0];
    }
    const openInterest = (await getOpenInterest(market.symbol)).data[0].value;
    const fundingRate = (await getFundingRate(market.symbol)).data[0].value;
    await prisma.coin.update({
      where: {
        id: coin.id
      },
      data: {
        openInterest,
        fundingRate,
      }
    });
  }
}

setTimeout(async () => {
  await fetchCoinalyze()
  if (process.env.NODE_ENV === 'production') {
    await axios.post('https://coinrotator-realtime-2.onrender.com/new-coinalyze-data')
  }
}, 99);