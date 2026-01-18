import { Link } from "react-router-dom";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { useGoals, useSkills, useTodayHabits } from "@/hooks";
import { formatDate, getDaysRemaining } from "@/utils";
import type { GoalStatus, GoalPriority } from "@/types";
import {
  GOAL_STATUS_LABELS,
  GOAL_PRIORITY_LABELS,
  HABIT_FREQUENCY_LABELS,
} from "@/types";
import styles from "./Dashboard.module.css";

function getHabitProgressColor(progress: number): string {
  const opacity = progress / 100;
  return `rgba(22, 163, 74, ${opacity * 0.2})`;
}

function getStatusVariant(status: GoalStatus) {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "primary";
    case "on_hold":
      return "warning";
    default:
      return "default";
  }
}

function getPriorityVariant(priority: GoalPriority) {
  switch (priority) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    default:
      return "default";
  }
}

export function Dashboard() {
  const { goals, loading: goalsLoading } = useGoals();
  const { skills, loading: skillsLoading } = useSkills();
  const {
    habits,
    loading: habitsLoading,
    isCompleted,
    completedCount,
    totalCount,
    toggleCompletion,
  } = useTodayHabits();

  const loading = goalsLoading || skillsLoading || habitsLoading;
  const habitProgress =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const inProgressGoals = goals.filter(
    (g) => g.status === "in_progress"
  ).length;
  const averageProgress =
    goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0;
  const averageSkillLevel =
    skills.length > 0
      ? (skills.reduce((sum, s) => sum + s.level, 0) / skills.length).toFixed(1)
      : "0";

  const recentGoals = [...goals]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 5);

  const upcomingDeadlines = goals
    .filter((g) => g.status !== "completed")
    .sort(
      (a, b) =>
        new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>ダッシュボード</h1>
      </div>

      <div className={styles.statsGrid}>
        <Card padding="lg">
          <div className={styles.statCard}>
            <span className={styles.statLabel}>総目標数</span>
            <span className={styles.statValue}>{goals.length}</span>
            <span className={styles.statSub}>
              {completedGoals} 完了 / {inProgressGoals} 進行中
            </span>
          </div>
        </Card>
        <Card padding="lg">
          <div className={styles.statCard}>
            <span className={styles.statLabel}>平均達成率</span>
            <span className={styles.statValue}>{averageProgress}%</span>
            <ProgressBar value={averageProgress} size="sm" />
          </div>
        </Card>
        <Card padding="lg">
          <div className={styles.statCard}>
            <span className={styles.statLabel}>スキル数</span>
            <span className={styles.statValue}>{skills.length}</span>
            <span className={styles.statSub}>
              平均レベル: {averageSkillLevel}
            </span>
          </div>
        </Card>
        <Card padding="lg">
          <div
            className={styles.statCard}
            style={{
              backgroundColor: getHabitProgressColor(habitProgress),
              borderRadius: "var(--radius-md)",
              padding: "var(--spacing-sm)",
              margin: "calc(-1 * var(--spacing-sm))",
              transition: "background-color 0.3s ease",
            }}
          >
            <span className={styles.statLabel}>今日の習慣</span>
            <span className={styles.statValue}>
              {completedCount}/{totalCount}
            </span>
            <ProgressBar value={habitProgress} variant="success" size="sm" />
          </div>
        </Card>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>最近更新された目標</h2>
            <Link to="/goals">
              <Button variant="ghost" size="sm">
                すべて表示
              </Button>
            </Link>
          </div>
          {recentGoals.length === 0 ? (
            <Card padding="lg">
              <div className={styles.empty}>
                <p>目標がありません</p>
                <Link to="/goals">
                  <Button>目標を作成</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className={styles.goalList}>
              {recentGoals.map((goal) => (
                <Link
                  key={goal.goal_id}
                  to={`/goals/${goal.goal_id}`}
                  className={styles.goalLink}
                >
                  <Card hoverable padding="md">
                    <div className={styles.goalCard}>
                      <div className={styles.goalHeader}>
                        <h3 className={styles.goalTitle}>{goal.title}</h3>
                        <Badge
                          variant={getPriorityVariant(goal.priority)}
                          size="sm"
                        >
                          {GOAL_PRIORITY_LABELS[goal.priority]}
                        </Badge>
                      </div>
                      <ProgressBar value={goal.progress} size="sm" showLabel />
                      <div className={styles.goalFooter}>
                        <Badge
                          variant={getStatusVariant(goal.status)}
                          size="sm"
                        >
                          {GOAL_STATUS_LABELS[goal.status]}
                        </Badge>
                        <span className={styles.goalDate}>
                          期限: {formatDate(goal.target_date)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>期限が近い目標</h2>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <Card padding="lg">
              <div className={styles.empty}>
                <p>期限が近い目標はありません</p>
              </div>
            </Card>
          ) : (
            <div className={styles.deadlineList}>
              {upcomingDeadlines.map((goal) => {
                const daysRemaining = getDaysRemaining(goal.target_date);
                const isOverdue = daysRemaining < 0;
                const isUrgent = daysRemaining >= 0 && daysRemaining <= 7;

                return (
                  <Link
                    key={goal.goal_id}
                    to={`/goals/${goal.goal_id}`}
                    className={styles.deadlineLink}
                  >
                    <Card padding="sm" hoverable>
                      <div className={styles.deadlineCard}>
                        <div className={styles.deadlineInfo}>
                          <span className={styles.deadlineTitle}>
                            {goal.title}
                          </span>
                          <span
                            className={`${styles.deadlineDays} ${
                              isOverdue
                                ? styles.overdue
                                : isUrgent
                                  ? styles.urgent
                                  : ""
                            }`}
                          >
                            {isOverdue
                              ? `${Math.abs(daysRemaining)}日超過`
                              : daysRemaining === 0
                                ? "今日"
                                : `あと${daysRemaining}日`}
                          </span>
                        </div>
                        <ProgressBar value={goal.progress} size="sm" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>今日の習慣</h2>
          <Link to="/habits">
            <Button variant="ghost" size="sm">
              すべて表示
            </Button>
          </Link>
        </div>
        <div
          className={styles.habitTableContainer}
          style={{
            backgroundColor: getHabitProgressColor(habitProgress),
            transition: "background-color 0.3s ease",
          }}
        >
          {habits.length === 0 ? (
            <Card padding="lg">
              <div className={styles.empty}>
                <p>今日の習慣はありません</p>
                <Link to="/habits">
                  <Button>習慣を作成</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <table className={styles.habitTable}>
              <thead>
                <tr>
                  <th>状態</th>
                  <th>習慣名</th>
                  <th>頻度</th>
                  <th>リマインダー</th>
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => {
                  const completed = isCompleted(habit.habit_id);
                  return (
                    <tr
                      key={habit.habit_id}
                      className={completed ? styles.completedRow : ""}
                    >
                      <td>
                        <button
                          type="button"
                          className={`${styles.checkButton} ${completed ? styles.checked : ""}`}
                          onClick={() => toggleCompletion(habit.habit_id)}
                          style={
                            {
                              "--habit-color": habit.color,
                            } as React.CSSProperties
                          }
                        >
                          {completed && (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td>
                        <div className={styles.habitNameCell}>
                          <div
                            className={styles.habitColorDot}
                            style={{ backgroundColor: habit.color }}
                          />
                          <span
                            className={completed ? styles.completedText : ""}
                          >
                            {habit.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge variant="default" size="sm">
                          {HABIT_FREQUENCY_LABELS[habit.frequency]}
                        </Badge>
                      </td>
                      <td>
                        {habit.reminder_enabled && habit.reminder_time
                          ? habit.reminder_time
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2>クイックアクション</h2>
        <div className={styles.actionButtons}>
          <Link to="/goals">
            <Button>目標を追加</Button>
          </Link>
          <Link to="/skills">
            <Button variant="secondary">スキルを追加</Button>
          </Link>
          <Link to="/habits">
            <Button variant="secondary">習慣を追加</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
