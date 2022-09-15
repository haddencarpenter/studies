import axios from 'axios'

const lunr = axios.create({
  baseURL: 'https://lunarcrush.com/api3/',
  timeout: 30000,
  headers: {
    'Authorization': `Bearer ${process.env.LUNR_API_TOKEN}`,
  }
})

export const getAllCoins = () => {
  return lunr.get('coins')
}

export default lunr