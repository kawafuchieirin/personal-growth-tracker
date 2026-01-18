import { Link } from "react-router-dom";
import { useUser } from "@/contexts";
import styles from "./Header.module.css";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useUser();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <Link to="/" className={styles.logo}>
          Personal Growth Tracker
        </Link>
      </div>
      <div className={styles.right}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className={styles.userName}>{user.name}</span>
        </div>
      </div>
    </header>
  );
}
