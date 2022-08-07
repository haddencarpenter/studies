import endOfYesterday from 'date-fns/endOfYesterday';
import isSameDay from 'date-fns/isSameDay';
import subDays from 'date-fns/subDays';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import format from 'date-fns/format'
import groupBy from 'lodash/groupBy';
import { Readable } from 'stream';

import prisma from '../lib/prisma'
import { tweet } from '../lib/twitter'
import { channelCreateMessage } from '../lib/discord'
import { postMessage, sendDocument } from '../lib/telegram'
import convertToDailySignals from '../utils/convertToDailySignals';
import getTrends from '../utils/getTrends';
import { defaultAtrPeriods, defaultMultiplier } from '../utils/variables'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const bot = async () => {
  const transaction = Sentry.startTransaction({
    op: "Bot",
    name: "Bot Transaction",
  });
  const excludedSymbols = ['usdd', 'ustc']
  try {
    const yesterday = endOfYesterday();
    const thirtyDaysAgo = subDays(new Date(), 30)

    let coinsData = await prisma.coin.findMany({
      orderBy: { marketCapRank: 'asc' },
      take: 1000,
      select: {
        id: true,
        symbol: true,
        name: true,
        marketCap: true,
        twitter: true,
        ohlcs: {
          select: {
            closeTime: true,
            open: true,
            high: true,
            low: true,
            close: true,
            quoteSymbol: true
          },
          where: {
            closeTime: {
              gte: thirtyDaysAgo,
              lte: yesterday,
            }
          },
          orderBy: { closeTime: 'asc' }
        }
      }
    })
    coinsData = coinsData.filter(coin => !excludedSymbols.includes(coin.symbol))
    coinsData = coinsData.map((coinData) => {
      const ohlcs = convertToDailySignals(coinData.ohlcs)
      let yesterdaysOhcls = coinData.ohlcs.filter(ohlc => !isSameDay(ohlc.closeTime, yesterday))
      yesterdaysOhcls = convertToDailySignals(yesterdaysOhcls)

      const [_trends, superSuperTrend] = getTrends(ohlcs, defaultAtrPeriods, defaultMultiplier)
      const [_yesterdayTrends, yesterdaySuperSuperTrend] = getTrends(yesterdaysOhcls, defaultAtrPeriods, defaultMultiplier)

      return {
        ...coinData,
        yesterdaySuperSuperTrend,
        superSuperTrend,
      }
    })
    coinsData = coinsData.filter((coinData) => coinData.superSuperTrend !== coinData.yesterdaySuperSuperTrend);
    coinsData = coinsData.sort((a, b) => Number(b.marketCap - a.marketCap))
    const trimmedCoinsData = coinsData.slice(0, 20)
    for (const coin of trimmedCoinsData) {
      const symbol = coin.symbol.toUpperCase()
      const tweetPost = `${coin.name} (${symbol}) changed from ${coin.yesterdaySuperSuperTrend} to ${coin.superSuperTrend} today! Find out more at coinrotator.app/coin/${coin.id} #CoinRotator $${symbol} @${coin.twitter}`
      const channelPost = `${coin.name} (${symbol}) changed from ${coin.yesterdaySuperSuperTrend} to ${coin.superSuperTrend} today! Find out more at https://coinrotator.app/coin/${coin.id}`
      console.log(tweetPost, channelPost)
      tweet(tweetPost)
      channelCreateMessage(channelPost)
      postMessage(channelPost)
      await new Promise((res) => setTimeout(res, 1000))
    }
    await new Promise((res) => setTimeout(res, 50000))
    const groupedTrends = groupBy(trimmedCoinsData, 'superSuperTrend')
    for (const [superSuperTrend, trendData] of Object.entries(groupedTrends)) {
      const fileName = `${format(new Date(), 'MM-dd-yyyy')} ${superSuperTrend} Trends.txt`
      const documentText = trendData
        .map(coin => `Binance:${coin.symbol.toUpperCase()}USDT`)
        .join(`\n`)
      sendDocument(fileName, Readable.from(documentText))
      await new Promise((res) => setTimeout(res, 1000))
    }
  } catch (error) {
    console.log(error)
    Sentry.captureException(error);
    throw(error)
  } finally {
    transaction.finish();
  }
}

bot()