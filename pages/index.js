import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'
import axios from 'axios'
import supertrend from '../utils/supertrend'

export async function getServerSideProps({ query }) {
  const markets = query.markets?.split(',') || ['usd', 'eth', 'btc']
  const days = query.days || 30
  const atrPeriods = query.atrPeriods || 10
  const multiplier = query.multiplier || 1.5
  try {
    const coins = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/coins/markets?vs_currency=usd`)
    let results = []
    for (let coin of coins.data) {
      const ohlcRoutes = markets.map(market => market !== coin.symbol ? `${process.env.NEXT_PUBLIC_API_URL}/coins/${coin.id}/ohlc?vs_currency=${market}&days=${days}` : '')
      let trends = []
      for (let route of ohlcRoutes) {
        try {
          if (route) {
            const response = await axios.get(route)
            console.log('request took place')
            await new Promise(resolve => setTimeout(resolve, 1500))
            let trend = supertrend(response.data, { atrPeriods, multiplier })
            trends.push(trend[trend.length - 1] || '')
          } else {
            return ''
          }
        } catch (error) {
          console.log(error.message)
          console.log(`Error retrieving history ${route}`)
          trends.push('')
        }
      }
      let trend = [...trends].filter(entry => entry === 'buy').length
      // Figure out if there are more buys than sells
      trend = trend >= Math.round(trends.length / 2) ? 'buy' : 'sell'
      results.push([coin.id, trends, trend].flat())
    }
    return ({
      props: {
        markets,
        results
      }
    })
  } catch (error) {
    console.log(error.message)
  }
  return ({
    props: {
      markets
    }
  })
}

export default function Home({ markets, results = [] }) {
  return (
    <Container className='mt-5'>
      <Row>
        <Col>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th className="text-center bg-primary text-white">Coin</th>
              {
                markets.map(market => <th key={`market-${market}`} className="text-center">{market.toUpperCase()}</th>)
              }
              <th className="text-center">Trend</th>
            </tr>
          </thead>
          <tbody>
              {
                results.map((result, index) => <tr key={`row-${index}`}>{result.map(res => <td key={`value-${res}`} className="text-center">{res}</td>)}</tr>)
              }
          </tbody>
        </Table>
        </Col>
      </Row>
    </Container>
  )
}
