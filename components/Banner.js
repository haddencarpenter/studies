import { Button } from 'antd'
import useKeyPass from '../hooks/useKeyPass';
import headerStyles from '../styles/header.module.less'

const Banner = () => {
  const hasKeyPass = useKeyPass()
  if (hasKeyPass) {
    return <></>
  }
  return (
    <div className={headerStyles.banner}>
      <span>Take 2 minutes to get free Key Pass access.</span>
      <a href="https://tally.so/r/wbLre0" rel="noopener noreferrer" target="_blank"><Button className={headerStyles.bannerButton} type="primary">Mint NFT</Button></a>
      <span>for Advanced Features.</span>
    </div>
  );
}

export default Banner