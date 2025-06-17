import { createContext, useContext, useEffect, useState } from 'react';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { ethers } from 'ethers';

const Web3AuthContext = createContext(null);

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider');
  }
  return context;
};

const clientId = "BGkgGCsO6v6Uve1k6glWCNKU2ims2t1Ljc9tU9HKUO5me2OTlxXP-bhY9OU7PPuBeT0FQ8qAZPU_ArEoLpSeeEU";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x2105", // Base chain
  rpcTarget: "https://mainnet.base.org",
  displayName: "Base",
  blockExplorerUrl: "https://basescan.org",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
  uiConfig: {
    appName: "CoinRotator",
    mode: "light",
    logoLight: "https://coinrotator.app/coin.svg",
    logoDark: "https://coinrotator.app/coin.svg",
    defaultLanguage: "en",
    theme: {
      primary: "#1890ff",
    },
  },
});

export const Web3AuthProvider = ({ children }) => {
  const [web3authProvider, setWeb3authProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setWeb3authProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
          const user = await web3auth.getUserInfo();
          setUser(user);
        }
      } catch (error) {
        console.error("Web3Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = async (loginProvider) => {
    try {
      const web3authProvider = await web3auth.connect();
      setWeb3authProvider(web3authProvider);
      
      if (web3auth.connected) {
        const user = await web3auth.getUserInfo();
        setUser(user);
        setLoggedIn(true);
        
        // Get wallet address
        const ethProvider = new ethers.providers.Web3Provider(web3authProvider);
        const signer = ethProvider.getSigner();
        const address = await signer.getAddress();
        
        // Save user data to database
        await saveUserToDatabase({
          ...user,
          walletAddress: address,
          provider: loginProvider || user.typeOfLogin,
        });
        
        return { user, address };
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await web3auth.logout();
      setWeb3authProvider(null);
      setUser(null);
      setLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const getAccounts = async () => {
    if (!web3authProvider) {
      console.log("provider not initialized yet");
      return [];
    }
    
    const ethProvider = new ethers.providers.Web3Provider(web3authProvider);
    const signer = ethProvider.getSigner();
    const address = await signer.getAddress();
    return [address];
  };

  const getBalance = async () => {
    if (!web3authProvider) {
      console.log("provider not initialized yet");
      return "0";
    }
    
    const ethProvider = new ethers.providers.Web3Provider(web3authProvider);
    const signer = ethProvider.getSigner();
    const address = await signer.getAddress();
    const balance = await ethProvider.getBalance(address);
    return ethers.utils.formatEther(balance);
  };

  const saveUserToDatabase = async (userData) => {
    try {
      const response = await fetch('/api/web3auth-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save user data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving user to database:', error);
      throw error;
    }
  };

  const contextProvider = {
    web3auth,
    web3authProvider,
    user,
    loggedIn,
    isLoading,
    login,
    logout,
    getAccounts,
    getBalance,
  };

  return (
    <Web3AuthContext.Provider value={contextProvider}>
      {children}
    </Web3AuthContext.Provider>
  );
};