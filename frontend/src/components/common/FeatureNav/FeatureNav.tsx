import { Link } from "react-router-dom";
import styles from "./FeatureNav.module.css";

interface FeatureItem {
  to: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const features: FeatureItem[] = [
  {
    to: "/",
    label: "ダッシュボード",
    description: "進捗状況の概要を確認",
    icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    color: "var(--color-primary)",
  },
  {
    to: "/goals",
    label: "目標管理",
    description: "目標の作成・編集・進捗管理",
    icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    color: "var(--color-success)",
  },
  {
    to: "/skills",
    label: "スキル管理",
    description: "スキルの記録と可視化",
    icon: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z",
    color: "var(--color-warning)",
  },
];

interface FeatureNavProps {
  excludeCurrent?: string;
  compact?: boolean;
}

export function FeatureNav({
  excludeCurrent,
  compact = false,
}: FeatureNavProps) {
  const filteredFeatures = excludeCurrent
    ? features.filter((f) => f.to !== excludeCurrent)
    : features;

  return (
    <nav
      className={`${styles.container} ${compact ? styles.compact : ""}`}
      aria-label="機能ナビゲーション"
    >
      {filteredFeatures.map((feature) => (
        <Link
          key={feature.to}
          to={feature.to}
          className={styles.card}
          style={{ "--feature-color": feature.color } as React.CSSProperties}
        >
          <div className={styles.iconWrapper}>
            <svg
              className={styles.icon}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={feature.icon} />
            </svg>
          </div>
          <div className={styles.content}>
            <span className={styles.label}>{feature.label}</span>
            {!compact && (
              <span className={styles.description}>{feature.description}</span>
            )}
          </div>
          <svg
            className={styles.arrow}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </Link>
      ))}
    </nav>
  );
}
