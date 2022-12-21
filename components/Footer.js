import { Layout, Space } from 'antd'

import footerStyles from '../styles/footer.module.less'

const Footer = () => {
  const { Footer: AntFooter } = Layout;

  return (
    <AntFooter className={footerStyles.container}>
      <Space size={16}>
        <span>Total UP Trend: <span className={footerStyles.item}>{1}</span></span>
        <span>Total DOWN Trend: <span className={footerStyles.item}>{1}</span></span>
        <span>Total HODL Trend: <span className={footerStyles.item}>{1}</span></span>
        <span>Longest signal streak UP: <span className={footerStyles.item}>{1}</span></span>
        <span>Longest signal streak DOWN: <span className={footerStyles.item}>{1}</span></span>
        <span>Longest signal streak HODL: <span className={footerStyles.item}>{1}</span></span>
      </Space>
    </AntFooter>
  );
}

export default Footer
