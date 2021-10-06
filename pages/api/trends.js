import supertrend from '../../utils/supertrend'
import axios from 'axios'

export default async function handler(req, res) {
  const { method } = req
  switch(method){
    case 'POST':
      const coins = req.body.coins || []
      const bases = req.body.bases || []
      const periods = req.body.periods || '300'
      const atrPeriods = req.body.atrPeriods || 10
      const multiplier = req.body.multiplier || 1.5
      // after defaults to yesterday
      const after = req.body.after || Math.floor(new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).getTime() / 1000)
      const results = await Promise.all(coins.map(async coin => {
      // find exchanges for every base
      const ohlcRoutes = bases.map(base => {
        if (base !== coin) {
          return exchanges[0]?.route ? `${exchanges[0].route}/ohlc` : ''
        }
        return ''
      })
      const trends = await Promise.all(ohlcRoutes.map(async route => {
        try {
          if (route) {
            const response = await axios.get(route, { params: { after, periods } })
            let trend = supertrend(response.data.result[periods], { atrPeriods, multiplier })
            trend = trend[trend.length - 1] || ''
            return trend
          } else {
            return ''
          }
        } catch (error) {
          console.log(error.message)
          console.log(error?.response?.data?.error || `Error retrieving history ${route}`)
          return ''
        }
      }))

      let trend = [...trends].filter(entry => entry === 'buy').length
      trend = trend >= Math.round(trends.length / 2) ? 'buy' : 'sell'
      return [coin, trends, trend].flat()
      }))
      res.json(results)
      break
    default:
      res.setHeader('Allow', ['POST', 'GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}