import Link from 'next/link'
import { Layout, Typography, Row, Col, Space } from 'antd'

import styles from '../styles/footer.module.css'
import Logo from './Logo'

const Footer = ({ topCoins, topCategories }) => {
  const { Footer: AntFooter } = Layout;
  const { Text, Paragraph } = Typography;

  return (
    <AntFooter className={styles.footer}>
      <div className={styles.mainFooter}>
        <Row gutter={16}>
          <Col span={8}>
            <Logo />
            <Paragraph type="secondary">
              This website is for informational purposes only, you should not construe any such information or other material as investment or financial advice.
            </Paragraph>
          </Col>
          <Col span={4}>
            <Text type="secondary" strong>Top Coins</Text>
            {topCoins.map(coin => coin.name)}
          </Col>
          <Col span={4}>
            <Text type="secondary" strong>Top Categories</Text>
            {topCategories.map(category => category)}
          </Col>
          <Col span={4}>
            <Text type="secondary" strong>Quick Links</Text>
            <Link href="/faq">
              <a>FAQ</a>
            </Link>
            <Link href="/terms">
              <a>Terms &amp; Conditions</a>
            </Link>
          </Col>
          <Col span={4}>
            <Text type="secondary" strong>Social Media</Text>
            <a href="https://discord.gg/gwTUngQv" target="_blank" rel="noreferrer">
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
          </Col>
        </Row>
      </div>
      <Typography.Paragraph className={styles.sponsor} type="secondary">
        Proudly funded in part by <a className={styles.sponsorLink} href="https://gamblersarea.com/" target="_blank" rel="noreferrer">GamblersArea</a>
      </Typography.Paragraph>
    </AntFooter>
  );
}

export default Footer