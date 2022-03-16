import { CopyOutlined } from '@ant-design/icons';
import { Space, Tag, notification } from 'antd'
import capitalize from 'lodash/capitalize'
import { useCallback } from 'react';

import styles from '../styles/contractTag.module.less'

const ContractTag = ({ image, defaultPlatform, platform, symbol, address, decimals=18 }) => {
  const displayedAddress = `${address.substr(0, 6)}...${address.substr(-4)}`
  const addCoin = useCallback(() => {
    const addMetamaskCoin = async () => {
      let wasAdded;
      try {
        wasAdded = await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address,
              symbol,
              decimals,
              image,
            },
          },
        })
      } catch(e) { console.error(e) }

      if (!wasAdded) {
        notification.error({
          description: "Couldn't add coin to metamask",
        })
      }
    }

    addMetamaskCoin();
  }, [image, symbol, address, decimals]);
  const addToClipboard = useCallback(() => {
    const copy = async () => {
      await navigator.clipboard.writeText(address);
      notification.open({
        description: 'Smart contract address copied.'
      })
    }

    copy()
  }, [address]);
  return (
    <Tag className={styles.tag}>
      <Space size={8}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* <img src={image} alt={symbol} className={styles.icon} /> */}
        <span><span className={styles.platform}>{capitalize(platform)}:</span> {displayedAddress}</span>
        {defaultPlatform === 'ethereum' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.metamask} src="/metamask.svg" alt={symbol} onClick={addCoin} />
        ) : <></>}
        <CopyOutlined onClick={addToClipboard}/>
      </Space>
    </Tag>
  );
};

export default ContractTag