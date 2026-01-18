import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Card } from '@/components/common/Card';
import { MilestoneCard } from '../MilestoneCard';
import { MilestoneForm } from '../MilestoneForm';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import type { Milestone, CreateMilestoneInput, UpdateMilestoneInput, MilestoneStatus } from '@/types';
import styles from './MilestoneTimeline.module.css';

interface MilestoneTimelineProps {
  goalId: string;
}

export function MilestoneTimeline({ goalId }: MilestoneTimelineProps) {
  const {
    milestones,
    loading,
    error,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  } = useRoadmaps(goalId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [deletingMilestoneId, setDeletingMilestoneId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (data: CreateMilestoneInput) => {
    setSaving(true);
    try {
      await createMilestone(data);
      setIsCreateModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: UpdateMilestoneInput) => {
    if (!editingMilestone) return;
    setSaving(true);
    try {
      await updateMilestone(editingMilestone.milestone_id, data);
      setEditingMilestone(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMilestoneId) return;
    setSaving(true);
    try {
      await deleteMilestone(deletingMilestoneId);
      setDeletingMilestoneId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (milestoneId: string, status: MilestoneStatus) => {
    await updateMilestone(milestoneId, { status });
  };

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const progressPercentage = milestones.length > 0
    ? Math.round((completedCount / milestones.length) * 100)
    : 0;

  if (loading) {
    return (
      <Card padding="lg">
        <div className={styles.loading}>読み込み中...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg">
        <div className={styles.error}>エラー: {error}</div>
      </Card>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.stats}>
          <span className={styles.progress}>
            {completedCount} / {milestones.length} 完了 ({progressPercentage}%)
          </span>
        </div>
        <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
          マイルストーン追加
        </Button>
      </div>

      {milestones.length === 0 ? (
        <Card padding="lg">
          <div className={styles.empty}>
            <p>マイルストーンがありません</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              最初のマイルストーンを追加
            </Button>
          </div>
        </Card>
      ) : (
        <div className={styles.timeline}>
          {milestones.map((milestone, index) => (
            <div key={milestone.milestone_id} className={styles.timelineItem}>
              <div className={styles.connector}>
                <div
                  className={`${styles.dot} ${
                    milestone.status === 'completed' ? styles.completed : ''
                  }`}
                />
                {index < milestones.length - 1 && <div className={styles.line} />}
              </div>
              <div className={styles.cardWrapper}>
                <MilestoneCard
                  milestone={milestone}
                  onEdit={setEditingMilestone}
                  onDelete={setDeletingMilestoneId}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="マイルストーンを追加"
      >
        <MilestoneForm
          milestone={undefined}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={saving}
        />
      </Modal>

      <Modal
        isOpen={!!editingMilestone}
        onClose={() => setEditingMilestone(null)}
        title="マイルストーンを編集"
      >
        {editingMilestone && (
          <MilestoneForm
            milestone={editingMilestone}
            onSubmit={handleUpdate}
            onCancel={() => setEditingMilestone(null)}
            loading={saving}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!deletingMilestoneId}
        onClose={() => setDeletingMilestoneId(null)}
        title="マイルストーンを削除"
        size="sm"
      >
        <div className={styles.deleteConfirm}>
          <p>このマイルストーンを削除しますか？</p>
          <div className={styles.deleteActions}>
            <Button variant="secondary" onClick={() => setDeletingMilestoneId(null)}>
              キャンセル
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={saving}>
              削除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
