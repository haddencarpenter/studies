import mapValues from 'lodash/mapValues.js'

import supertrend from './supertrend.mjs'
import convertToWeeklySignals from './convertToWeeklySignals.mjs'
import supersupertrend from './supersupertrend.mjs';

export default function getTrends(ohlcs, atrPeriods, multiplier, showWeeklySignals, skipLastWeek) {
  const trends = mapValues(ohlcs, (ohlcs) => {
    if (showWeeklySignals) {
      ohlcs = convertToWeeklySignals(ohlcs)
    }
    if (skipLastWeek) {
      ohlcs.pop();
    }
    const trends = supertrend(ohlcs, { atrPeriods, multiplier })
    const lastTrend = trends[trends.length - 1] || ''
    let trendLength = 0
    for (let i = trends.length - 1; i > 0; i--) {
      if (lastTrend === trends[i]) {
        trendLength++
      } else {
        break
      }
    }
    return [lastTrend, trendLength]
  })
  const superSupertrend = supersupertrend(mapValues(trends, (trends) => trends[0]))

  return [trends, superSupertrend]
}