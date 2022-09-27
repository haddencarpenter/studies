import { Layout, Menu } from 'antd'

import Logo from './Logo'

import headerStyles from '../styles/header.module.less'
import DarkModeSwitch from './DarkModeSwitch';
import useDarkMode from '../hooks/usedarkmode';

const Header = () => {
  const { Header: AntHeader } = Layout;
  const [darkMode, setDarkMode] = useDarkMode();

  return (
    <AntHeader className={headerStyles.header}>
      <Menu mode="horizontal">
        <Menu.Item key="logo" className={headerStyles.logo} data-id="logo">
          <Logo />
        </Menu.Item>
        <Menu.Item key="dark-mode" className={headerStyles.darkModeSwitchItem}><DarkModeSwitch darkMode={darkMode} setDarkMode={setDarkMode} /></Menu.Item>
      </Menu>
    </AntHeader>
  );
}

export default Header