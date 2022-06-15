import Link from 'next/link';
import styles from './header.module.scss';

export function Header() {
  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <Link href="/">
          <img src="/icons/logo.svg" alt="logo" />
        </Link>
      </div>
    </div>
  );
}
