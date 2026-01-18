import { useState, useMemo } from "react";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { Modal } from "@/components/common/Modal";
import { GoalCard, GoalForm } from "@/components/features/goals";
import { useGoals } from "@/hooks";
import type { CreateGoalInput, GoalStatus, GoalPriority } from "@/types";
import { GOAL_STATUS_LABELS, GOAL_PRIORITY_LABELS } from "@/types";
import styles from "./Goals.module.css";

const statusFilterOptions = [
  { value: "all", label: "すべて" },
  ...(Object.entries(GOAL_STATUS_LABELS) as [GoalStatus, string][]).map(
    ([value, label]) => ({
      value,
      label,
    })
  ),
];

const priorityFilterOptions = [
  { value: "all", label: "すべて" },
  ...(Object.entries(GOAL_PRIORITY_LABELS) as [GoalPriority, string][]).map(
    ([value, label]) => ({
      value,
      label,
    })
  ),
];

export function GoalsPage() {
  const { goals, loading, error, createGoal } = useGoals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      if (statusFilter !== "all" && goal.status !== statusFilter) return false;
      if (priorityFilter !== "all" && goal.priority !== priorityFilter)
        return false;
      return true;
    });
  }, [goals, statusFilter, priorityFilter]);

  const handleCreate = async (data: CreateGoalInput) => {
    setCreating(true);
    try {
      await createGoal(data);
      setIsModalOpen(false);
    } finally {
      setCreating(false);
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
        <h1>目標一覧</h1>
        <Button onClick={() => setIsModalOpen(true)}>新規作成</Button>
      </div>

      <div className={styles.filters}>
        <Select
          label="ステータス"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusFilterOptions}
        />
        <Select
          label="優先度"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={priorityFilterOptions}
        />
      </div>

      {filteredGoals.length === 0 ? (
        <div className={styles.empty}>
          <p>目標がありません</p>
          <Button onClick={() => setIsModalOpen(true)}>最初の目標を作成</Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.goal_id} goal={goal} />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新しい目標を作成"
      >
        <GoalForm
          goal={undefined}
          onSubmit={handleCreate}
          onCancel={() => setIsModalOpen(false)}
          loading={creating}
        />
      </Modal>
    </div>
  );
}
