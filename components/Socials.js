import { Space } from 'antd'

import styles from "../styles/socials.module.less"

const Socials = () => {
  return (
    <Space size={16} className={styles.socials}>
      <a href="https://discord.gg/zfnxHyrhSK" target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/discord.svg" alt="Discord Logo" />
      </a>
      <a href="https://twitter.com/coinrotatorapp" target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/twitter.svg" alt="Twitter Logo" />
      </a>
      <a href="https://coinrotator.medium.com/" target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/medium.svg" alt="Medium Logo" />
      </a>
      <a href="https://t.me/+8DRbgvB2NxE2YmFk" target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/telegram.svg" alt="Telegram Logo" />
      </a>
      <a href="https://www.youtube.com/@coinrotator" target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/youtube.svg" alt="YouTube Logo" />
      </a>
    </Space>
  );
}

export default Socials