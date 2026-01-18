import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Modal } from '@/components/common/Modal';
import { GoalForm } from '@/components/features/goals';
import { MilestoneTimeline } from '@/components/features/roadmaps';
import { useGoal } from '@/hooks';
import { formatDate } from '@/utils';
import type { UpdateGoalInput, GoalStatus, GoalPriority } from '@/types';
import { GOAL_STATUS_LABELS, GOAL_PRIORITY_LABELS } from '@/types';
import styles from './Goals.module.css';

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

export function GoalDetailPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { goal, loading, error, updateGoal, deleteGoal } = useGoal(goalId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (data: UpdateGoalInput) => {
    setUpdating(true);
    try {
      await updateGoal(data);
      setIsEditModalOpen(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteGoal();
      navigate('/goals');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className={styles.error}>
        <p>{error || '目標が見つかりません'}</p>
        <Button onClick={() => navigate('/goals')}>目標一覧に戻る</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backLink}>
        <Button variant="ghost" onClick={() => navigate('/goals')}>
          ← 目標一覧
        </Button>
      </div>

      <Card padding="lg">
        <div className={styles.detailHeader}>
          <div>
            <h1 className={styles.detailTitle}>{goal.title}</h1>
            <div className={styles.badges}>
              <Badge variant={getStatusVariant(goal.status)}>
                {GOAL_STATUS_LABELS[goal.status]}
              </Badge>
              <Badge variant={getPriorityVariant(goal.priority)}>
                優先度: {GOAL_PRIORITY_LABELS[goal.priority]}
              </Badge>
            </div>
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
              編集
            </Button>
            <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
              削除
            </Button>
          </div>
        </div>

        <div className={styles.detailContent}>
          <div className={styles.section}>
            <h3>説明</h3>
            <p className={styles.description}>{goal.description}</p>
          </div>

          <div className={styles.section}>
            <h3>進捗</h3>
            <ProgressBar
              value={goal.progress}
              variant={goal.status === 'completed' ? 'success' : 'primary'}
              size="lg"
              showLabel
            />
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>期限</span>
              <span className={styles.metaValue}>{formatDate(goal.target_date)}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>作成日</span>
              <span className={styles.metaValue}>{formatDate(goal.created_at)}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>更新日</span>
              <span className={styles.metaValue}>{formatDate(goal.updated_at)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className={styles.roadmapSection}>
        <h2>ロードマップ</h2>
        <MilestoneTimeline goalId={goal.goal_id} />
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="目標を編集"
      >
        <GoalForm
          goal={goal}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          loading={updating}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="目標を削除"
        size="sm"
      >
        <div className={styles.deleteConfirm}>
          <p>「{goal.title}」を削除しますか？</p>
          <p className={styles.deleteWarning}>この操作は取り消せません。</p>
          <div className={styles.deleteActions}>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              キャンセル
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              削除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
