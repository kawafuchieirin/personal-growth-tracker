import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import type { Habit } from "@/types";
import { HABIT_FREQUENCY_LABELS } from "@/types";
import styles from "./HabitCard.module.css";

interface HabitCardProps {
  habit: Habit;
  isCompleted?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}

export function HabitCard({
  habit,
  isCompleted = false,
  onToggle,
  onClick,
}: HabitCardProps) {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle?.();
  };

  return (
    <Card
      hoverable={!!onClick}
      padding="md"
      className={styles.card}
      onClick={onClick}
    >
      <div className={styles.content}>
        {onToggle && (
          <button
            type="button"
            className={`${styles.checkbox} ${isCompleted ? styles.checked : ""}`}
            onClick={handleToggle}
            style={
              {
                "--habit-color": habit.color,
              } as React.CSSProperties
            }
            aria-label={isCompleted ? "完了を取り消す" : "完了にする"}
          >
            {isCompleted && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className={styles.checkIcon}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        )}
        <div className={styles.info}>
          <div className={styles.header}>
            <h3
              className={`${styles.name} ${isCompleted ? styles.completed : ""}`}
            >
              {habit.name}
            </h3>
            <div
              className={styles.colorDot}
              style={{ backgroundColor: habit.color }}
            />
          </div>
          {habit.description && (
            <p className={styles.description}>{habit.description}</p>
          )}
          <div className={styles.meta}>
            <Badge variant="default" size="sm">
              {HABIT_FREQUENCY_LABELS[habit.frequency]}
            </Badge>
            {habit.reminder_enabled && habit.reminder_time && (
              <span className={styles.reminder}>{habit.reminder_time}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
