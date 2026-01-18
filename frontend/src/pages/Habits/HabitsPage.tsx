import { useState, useMemo } from "react";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { Modal } from "@/components/common/Modal";
import {
  ContributionGraph,
  DailyChecklist,
  HabitCard,
  HabitForm,
} from "@/components/features/habits";
import { useHabits } from "@/hooks";
import type {
  CreateHabitInput,
  UpdateHabitInput,
  Habit,
  HabitFrequency,
} from "@/types";
import { HABIT_FREQUENCY_LABELS } from "@/types";
import styles from "./Habits.module.css";

const frequencyFilterOptions = [
  { value: "all", label: "すべて" },
  ...(Object.entries(HABIT_FREQUENCY_LABELS) as [HabitFrequency, string][]).map(
    ([value, label]) => ({ value, label })
  ),
];

const statusFilterOptions = [
  { value: "all", label: "すべて" },
  { value: "active", label: "アクティブ" },
  { value: "inactive", label: "非アクティブ" },
];

export function HabitsPage() {
  const { habits, loading, error, createHabit, updateHabit, deleteHabit } =
    useHabits();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [processing, setProcessing] = useState(false);
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      if (frequencyFilter !== "all" && habit.frequency !== frequencyFilter)
        return false;
      if (statusFilter === "active" && !habit.is_active) return false;
      if (statusFilter === "inactive" && habit.is_active) return false;
      return true;
    });
  }, [habits, frequencyFilter, statusFilter]);

  const handleCreate = async (data: CreateHabitInput) => {
    setProcessing(true);
    try {
      await createHabit(data);
      setIsCreateModalOpen(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdate = async (data: UpdateHabitInput) => {
    if (!editingHabit) return;
    setProcessing(true);
    try {
      await updateHabit(editingHabit.habit_id, data);
      setEditingHabit(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingHabit) return;
    setProcessing(true);
    try {
      await deleteHabit(deletingHabit.habit_id);
      setDeletingHabit(null);
    } finally {
      setProcessing(false);
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

  if (error) {
    return (
      <div className={styles.error}>
        <p>エラーが発生しました: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>習慣トラッカー</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>新規作成</Button>
      </div>

      <div className={styles.todaySection}>
        <DailyChecklist />
      </div>

      <div className={styles.graphSection}>
        <ContributionGraph />
      </div>

      <div className={styles.listSection}>
        <h2>習慣一覧</h2>
        <div className={styles.filters}>
          <Select
            label="頻度"
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
            options={frequencyFilterOptions}
          />
          <Select
            label="ステータス"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusFilterOptions}
          />
        </div>

        {filteredHabits.length === 0 ? (
          <div className={styles.empty}>
            <p>習慣がありません</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              最初の習慣を作成
            </Button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredHabits.map((habit) => (
              <div key={habit.habit_id} className={styles.habitItem}>
                <HabitCard
                  habit={habit}
                  onClick={() => setEditingHabit(habit)}
                />
                <div className={styles.habitActions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingHabit(habit)}
                  >
                    編集
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeletingHabit(habit)}
                  >
                    削除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="新しい習慣を作成"
      >
        <HabitForm
          habit={undefined}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={processing}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        title="習慣を編集"
      >
        {editingHabit && (
          <HabitForm
            habit={editingHabit}
            onSubmit={handleUpdate}
            onCancel={() => setEditingHabit(null)}
            loading={processing}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingHabit}
        onClose={() => setDeletingHabit(null)}
        title="習慣を削除"
      >
        <div className={styles.deleteConfirm}>
          <p>
            「<strong>{deletingHabit?.name}</strong>
            」を削除してもよろしいですか？
          </p>
          <p className={styles.deleteWarning}>
            この操作は取り消せません。すべての記録も削除されます。
          </p>
          <div className={styles.deleteActions}>
            <Button variant="secondary" onClick={() => setDeletingHabit(null)}>
              キャンセル
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={processing}
            >
              削除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
