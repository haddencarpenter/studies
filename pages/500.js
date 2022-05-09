import { Layout, Typography } from 'antd';

import globalData from '../lib/globalData';
import styles from '../styles/404.module.less';

export default function Custom404() {
  return (
    <Layout.Content className={styles.content}>
      <Typography.Title>
        500 - Server Error
      </Typography.Title>
    </Layout.Content>
  )
}

export async function getStaticProps() {
  console.debug('building 500');
  const appData = await globalData();
  console.debug('done building 500');

  return { props: { appData } };
}