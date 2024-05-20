import detectEthereumProvider from '@metamask/detect-provider'
import { useEffect, useState, useCallback } from 'react';

const useWallet = () => {
  const [provider, setProvider] = useState(null)
  const [walletAddress, setWalletAddress] = useState(null)
  const [hasKeyPass, setHasKeyPass] = useState(false)

  const checkForPassKey = useCallback(async (walletAddress) => {
    if (!walletAddress) {
      setHasKeyPass(false)
      return;
    }
    try {
      const response = await fetch(`/api/verify-keypass?walletAddress=${walletAddress}`)
      const hasKey = await response.json()
      setHasKeyPass(hasKey.ok)
    } catch(e) {
      console.error(e)
    }
  }, [setHasKeyPass])

  useEffect(() => {
    async function setProviderAndCheckConnection() {
      const provider = await detectEthereumProvider()
      setProvider(provider)
      const accounts = await provider.request({ method: 'eth_accounts' })
      const walletAddress = accounts?.[0]
      setWalletAddress(walletAddress)
      checkForPassKey(walletAddress)

      provider.on('accountsChanged', async (accounts) => {
        const walletAddress = accounts?.[0]
        console.log('accountsChanged', walletAddress)
        setWalletAddress(walletAddress)
        checkForPassKey(walletAddress)
      })
    }
    setProviderAndCheckConnection();
  }, [checkForPassKey])

  return [walletAddress, setWalletAddress, provider, hasKeyPass, setHasKeyPass]
}

export default useWallet