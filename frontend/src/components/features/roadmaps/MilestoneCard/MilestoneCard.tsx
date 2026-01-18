import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { formatDate, isOverdue } from "@/utils";
import type { Milestone, MilestoneStatus } from "@/types";
import { MILESTONE_STATUS_LABELS } from "@/types";
import styles from "./MilestoneCard.module.css";

interface MilestoneCardProps {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestoneId: string) => void;
  onStatusChange: (milestoneId: string, status: MilestoneStatus) => void;
}

function getStatusVariant(status: MilestoneStatus) {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "primary";
    default:
      return "default";
  }
}

export function MilestoneCard({
  milestone,
  onEdit,
  onDelete,
  onStatusChange,
}: MilestoneCardProps) {
  const isOverdueDate =
    isOverdue(milestone.due_date) && milestone.status !== "completed";

  const handleNextStatus = () => {
    const statusOrder: MilestoneStatus[] = [
      "not_started",
      "in_progress",
      "completed",
    ];
    const currentIndex = statusOrder.indexOf(milestone.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];
    if (nextStatus) {
      onStatusChange(milestone.milestone_id, nextStatus);
    }
  };

  return (
    <div className={`${styles.card} ${styles[milestone.status]}`}>
      <div className={styles.indicator} />
      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.title}>{milestone.title}</h4>
          <Badge variant={getStatusVariant(milestone.status)} size="sm">
            {MILESTONE_STATUS_LABELS[milestone.status]}
          </Badge>
        </div>
        {milestone.description && (
          <p className={styles.description}>{milestone.description}</p>
        )}
        <div className={styles.footer}>
          <span
            className={`${styles.date} ${isOverdueDate ? styles.overdue : ""}`}
          >
            期限: {formatDate(milestone.due_date)}
          </span>
          <div className={styles.actions}>
            <Button variant="ghost" size="sm" onClick={handleNextStatus}>
              ステータス変更
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(milestone)}>
              編集
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(milestone.milestone_id)}
            >
              削除
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
