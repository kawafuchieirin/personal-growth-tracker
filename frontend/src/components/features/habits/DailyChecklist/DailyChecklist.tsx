import { Card } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/ProgressBar";
import { HabitCard } from "../HabitCard";
import { useTodayHabits } from "@/hooks";
import styles from "./DailyChecklist.module.css";

function getProgressColor(progress: number): string {
  // 達成率に応じて緑色の濃さを変化させる
  // 0% = 透明, 100% = 濃い緑
  const opacity = progress / 100;
  // 緑色 (22, 163, 74) - Tailwind green-600相当
  return `rgba(22, 163, 74, ${opacity * 0.15})`;
}

export function DailyChecklist() {
  const {
    habits,
    loading,
    error,
    toggleCompletion,
    isCompleted,
    completedCount,
    totalCount,
  } = useTodayHabits();

  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const progressColor = getProgressColor(progress);

  if (loading) {
    return (
      <Card padding="md">
        <div className={styles.loading}>読み込み中...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="md">
        <div className={styles.error}>エラー: {error}</div>
      </Card>
    );
  }

  if (habits.length === 0) {
    return (
      <Card padding="md">
        <div className={styles.empty}>
          <p>まだ習慣が登録されていません</p>
        </div>
      </Card>
    );
  }

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: progressColor,
        transition: "background-color 0.3s ease",
      }}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>今日の習慣</h2>
        <span className={styles.count}>
          {completedCount}/{totalCount} 完了
        </span>
      </div>

      <div className={styles.progress}>
        <ProgressBar value={progress} variant="success" size="sm" />
      </div>

      <div className={styles.list}>
        {habits.map((habit) => (
          <HabitCard
            key={habit.habit_id}
            habit={habit}
            isCompleted={isCompleted(habit.habit_id)}
            onToggle={() => toggleCompletion(habit.habit_id)}
          />
        ))}
      </div>

      {progress === 100 && (
        <div className={styles.celebration}>
          今日の習慣をすべて達成しました!
        </div>
      )}
    </div>
  );
}
