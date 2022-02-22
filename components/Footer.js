import Link from 'next/link'
import { Layout, Typography, Row, Col } from 'antd'

import styles from '../styles/footer.module.css'

const Footer = () => {
  const { Footer: AntFooter } = Layout;

  return (
    <AntFooter className={styles.footer}>
      <Typography.Paragraph className={styles.footerLove} type="secondary">
        Proudly funded in part by <a className={styles.gaLink} href="https://gamblersarea.com/" target="_blank" rel="noreferrer">GamblersArea</a>
      </Typography.Paragraph>
    </AntFooter>
  );
}

export default Footer