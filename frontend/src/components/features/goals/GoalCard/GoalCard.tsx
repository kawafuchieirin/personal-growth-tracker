import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { formatDate, getDaysRemaining } from '@/utils';
import type { Goal, GoalStatus, GoalPriority } from '@/types';
import { GOAL_STATUS_LABELS, GOAL_PRIORITY_LABELS } from '@/types';
import styles from './GoalCard.module.css';

interface GoalCardProps {
  goal: Goal;
}

function getStatusVariant(status: GoalStatus) {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'primary';
    case 'on_hold':
      return 'warning';
    default:
      return 'default';
  }
}

function getPriorityVariant(priority: GoalPriority) {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    default:
      return 'default';
  }
}

export function GoalCard({ goal }: GoalCardProps) {
  const daysRemaining = getDaysRemaining(goal.target_date);
  const isOverdue = daysRemaining < 0 && goal.status !== 'completed';

  return (
    <Link to={`/goals/${goal.goal_id}`} className={styles.link}>
      <Card hoverable padding="md">
        <div className={styles.header}>
          <h3 className={styles.title}>{goal.title}</h3>
          <Badge variant={getPriorityVariant(goal.priority)} size="sm">
            {GOAL_PRIORITY_LABELS[goal.priority]}
          </Badge>
        </div>
        <p className={styles.description}>{goal.description}</p>
        <div className={styles.progress}>
          <ProgressBar
            value={goal.progress}
            variant={goal.status === 'completed' ? 'success' : 'primary'}
            showLabel
          />
        </div>
        <div className={styles.footer}>
          <Badge variant={getStatusVariant(goal.status)}>
            {GOAL_STATUS_LABELS[goal.status]}
          </Badge>
          <span className={`${styles.date} ${isOverdue ? styles.overdue : ''}`}>
            {isOverdue
              ? `${Math.abs(daysRemaining)}日超過`
              : goal.status === 'completed'
                ? `完了: ${formatDate(goal.updated_at)}`
                : `期限: ${formatDate(goal.target_date)}`}
          </span>
        </div>
      </Card>
    </Link>
  );
}
