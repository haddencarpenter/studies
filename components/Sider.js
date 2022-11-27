import { Layout, Menu } from 'antd'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons'
import classnames from 'classnames'
import { useState } from 'react'

import Logo from './Logo'
import Search from './Search'
import styles from "../styles/sider.module.less"

const Sider = ({ categories, coins }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Layout.Sider
      collapsible
      collapsed={collapsed}
      onCollapse={value => setCollapsed(value)}
      collapsedWidth={56}
      width={240}
      trigger={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      className={classnames(styles.sidebar, { [styles.collapsed]: collapsed })}
    >
      <Logo className={styles.logo}/>
      <Search categories={categories} coins={coins} />
    </Layout.Sider>
  );
}

export default Sider