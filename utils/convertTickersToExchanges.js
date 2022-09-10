import groupBy from 'lodash/groupBy'
import sumBy from 'lodash/sumBy'

export default function convertTickersToExchanges(tickers) {
  let exchanges = groupBy(tickers, 'market.name')

  Object.keys(exchanges).forEach((key) => {
    exchanges[key] = sumBy(exchanges[key], 'volume')
  })
  exchanges = Object.entries(exchanges)
  exchanges = exchanges.sort((exchangeA, exchangeB) => exchangeB[1] - exchangeA[1])

  return exchanges
}