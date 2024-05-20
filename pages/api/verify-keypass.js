import axios from 'axios';
import axiosRetry, { exponentialDelay } from 'axios-retry';
import * as AxiosLogger from 'axios-logger'

const KEY_PASS_CONTRACT = '0x486bda3013ff013c0dae9abb2c8d234cad9c5f7b';

const alchemy = axios.create({
  baseURL: 'https://base-mainnet.g.alchemy.com/v2/TbFuq5tQAa5kedmODXaxUO0diDWcPDgf/',
  timeout: 30000,
})
axiosRetry(alchemy, {
  onRetry: (_count, err) => console.log(_count, err),
  shouldResetTimeout: true,
  retryDelay: exponentialDelay
})
alchemy.interceptors.request.use(AxiosLogger.requestLogger);

const handler = async (req, res) => {
  const walletAddress = req.query.walletAddress
  const validWallet = walletAddress?.startsWith('0x')
  if (req.method !== 'GET' || !validWallet) {
    res.status(400).json({ ok: false })
  } else {
    try {
      const result = (await alchemy.get(`getNFTs/?owner=${walletAddress}`)).data
      const contracts = result?.ownedNfts?.map(nft => nft?.contract?.address)
      console.log(contracts)
      res.setHeader('Cache-Control', 'maxage=3600')
      if (contracts?.includes(KEY_PASS_CONTRACT)) {
        res.status(200).json({ ok: true })
      } else {
        res.status(403).json({ ok: false })
      }
    } catch(e) {
      res.status(500).json({ ok: false })
    }
  }
}

export default handler