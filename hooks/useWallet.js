import detectEthereumProvider from '@metamask/detect-provider'
import { useEffect, useState } from 'react';

const useWallet = () => {
  const [provider, setProvider] = useState(null)
  const [walletAddress, setWalletAddress] = useState(null)
  const [hasKeyPass, setHasKeyPass] = useState(false)

  useEffect(() => {
    async function setProviderAndCheckConnection() {
      const provider = await detectEthereumProvider()
      setProvider(provider)
      const accounts = await provider.request({ method: 'eth_accounts' })
      if (accounts?.[0]) {
        setWalletAddress(accounts[0])
      }
      provider.on('accountsChanged', (accounts) => setWalletAddress(accounts?.[0]))
    }
    setProviderAndCheckConnection();
  }, [])

  return [walletAddress, setWalletAddress, provider, hasKeyPass, setHasKeyPass]
}

export default useWallet