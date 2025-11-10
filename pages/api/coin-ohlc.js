import sql from '../../lib/database.mjs'

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(400).json({ error: 'Bad request' })
  }

  const coinIdsParam = req.query.coinIds
  if (!coinIdsParam) {
    return res.status(400).json({ error: 'coinIds parameter required' })
  }

  try {
    const coinIds = coinIdsParam.split(',').filter(id => id.trim())
    
    if (coinIds.length === 0) {
      return res.status(400).json({ error: 'No valid coin IDs provided' })
    }

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get BTC's OHLC data for baseline (current + 7d ago)
    const btcOhlc = await sql`
      SELECT close, "closeTime"
      FROM "Ohlc"
      WHERE "coinId" = 'bitcoin'
        AND "quoteSymbol" = 'usd'
        AND "closeTime" >= ${sevenDaysAgo}
      ORDER BY "closeTime" DESC
    `

    let btcChange7d = null
    if (btcOhlc.length >= 2) {
      const btcCurrent = parseFloat(btcOhlc[0].close)
      const btcOldest = parseFloat(btcOhlc[btcOhlc.length - 1].close)
      btcChange7d = ((btcCurrent - btcOldest) / btcOldest) * 100
    }

    // Get OHLC data for requested coins
    const ohlcData = await sql`
      SELECT "coinId", close, "closeTime"
      FROM "Ohlc"
      WHERE "coinId" IN ${sql(coinIds)}
        AND "quoteSymbol" = 'usd'
        AND "closeTime" >= ${sevenDaysAgo}
      ORDER BY "coinId", "closeTime" DESC
    `

    // Group by coinId
    const ohlcByCoin = {}
    for (const row of ohlcData) {
      if (!ohlcByCoin[row.coinId]) {
        ohlcByCoin[row.coinId] = []
      }
      ohlcByCoin[row.coinId].push({
        close: parseFloat(row.close),
        closeTime: row.closeTime
      })
    }

    // Calculate 7d change for each coin
    const result = {}
    for (const coinId of coinIds) {
      const coinOhlc = ohlcByCoin[coinId]
      
      if (!coinOhlc || coinOhlc.length < 2) {
        // Not enough data
        result[coinId] = null
        continue
      }

      // Current price (most recent)
      const current = coinOhlc[0].close
      
      // Price from 7 days ago (oldest in our dataset)
      const oldest = coinOhlc[coinOhlc.length - 1].close
      
      // Verify we actually have ~7 days of data
      const currentDate = new Date(coinOhlc[0].closeTime)
      const oldestDate = new Date(coinOhlc[coinOhlc.length - 1].closeTime)
      const daysDiff = (currentDate - oldestDate) / (1000 * 60 * 60 * 24)
      
      // Only calculate if we have at least 6 days of data (allow some tolerance)
      if (daysDiff >= 6) {
        const change7d = ((current - oldest) / oldest) * 100
        
        result[coinId] = {
          change7d: change7d,
          btcDelta: btcChange7d !== null ? (change7d - btcChange7d) : null,
          daysCovered: daysDiff
        }
      } else {
        // Not enough historical data
        result[coinId] = null
      }
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate') // 5 min cache
    res.status(200).json(result)
  } catch (error) {
    console.error('Error in coin-ohlc API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default handler

