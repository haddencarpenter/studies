import Link from 'next/link'
import styles from '../styles/logo.module.css'

const Logo = () => {
  return (
    <span className={styles.logo}>
      <Link href="/" key="img">
        <a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/coin.svg" alt="Logo" height={24} width={24} className={styles.logoSvg}/>
        </a>
      </Link>
      <Link href="/" key="title">
        <a>
          <span className={styles.logoTitle}><b>Coin</b>Rotator</span>
        </a>
      </Link>
    </span>
  );
}

export default Logo