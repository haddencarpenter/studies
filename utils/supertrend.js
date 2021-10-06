const supertrend = (data = [], options = { atrPeriods: 10, multiplier: 1.5 }) => {
  return data
  .map((entry, index) => {
    if (index === 0) {
      return [...entry, 0]
    }
    // Max of (High-Low, High-Close, Low-Close)
    const tr = Math.max(...[entry[2] - entry[3], Math.abs(entry[2] - data[index - 1][4]), Math.abs(entry[3] - data[index - 1][4])]) || 0
    return [...entry, tr]
  })
  .map((entry, index, array) => {
    if (index >= options.atrPeriods) {
      // Calc ATR(SMA)
      const atrSMA = array
        .slice(index - options.atrPeriods, index)
        .map(atrEntry => atrEntry[atrEntry.length - 1])
        .reduce((previous, next) => previous + next, 0) / options.atrPeriods
      // Calc Basic upperband
      const basicUpperband = (entry[2] + entry[3]) / 2 + options.multiplier * atrSMA
      // Calc Basic lowerband
      const basicLowerband = (entry[2] + entry[3]) / 2 - options.multiplier * atrSMA

      return [...entry, atrSMA, basicUpperband, basicLowerband]
    }
    return entry
  })
  .map((entry, index) => {
    if (index === options.atrPeriods) {
      return [...entry, entry[7], entry[8]]
    }
    return entry
  })
  .reduce((previousResult, currentEntry, index) => {
    if (index > options.atrPeriods) {
      // IF( (Current Basic Upperband  < Previous Final Upperband) and (Previous Close > Previous Final Upperband)) Then (Current Basic Upperband) ELSE Previous Final Upperband)
      const previousFinalUpperband = previousResult[index - 1][7]
      const finalUpperband = currentEntry[7] < previousFinalUpperband && previousResult[index -1][4] > previousFinalUpperband ? currentEntry[7] : previousFinalUpperband
      // IF( (Current Basic Lowerband  > Previous Final Lowerband) and (Previous Close < Previous Final Lowerband)) Then (Current Basic Lowerband) ELSE Previous Final Lowerband)
      const previousFinalLowerband = previousResult[index - 1][8]
      const finalLowerband = currentEntry[8] > previousFinalLowerband && previousResult[index -1][4] > previousFinalLowerband ? currentEntry[8] : previousFinalLowerband
      return [...previousResult, [...currentEntry, finalUpperband, finalLowerband]]
    }
    return [...previousResult, currentEntry]
  }, [])
  .map((entry, index) => {
    if (index > options.atrPeriods) {
      // IF(Current Close <= Current Final Upperband ) Then Current Final Upperband ELSE Current  Final Lowerband
      const supertrend = entry[4] <= entry[7] ? entry[7] : entry[8]
      return entry[4] < supertrend ? 'sell' : 'buy'
    }
    return ''
  })
}

export default supertrend
