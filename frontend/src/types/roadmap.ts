export type MilestoneStatus = "not_started" | "in_progress" | "completed";

export interface Milestone {
  milestone_id: string;
  goal_id: string;
  title: string;
  description: string;
  due_date: string;
  status: MilestoneStatus;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMilestoneInput {
  title: string;
  description: string;
  due_date: string;
  order?: number;
}

export interface UpdateMilestoneInput {
  title?: string;
  description?: string;
  due_date?: string;
  status?: MilestoneStatus;
  order?: number;
}

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  not_started: "未開始",
  in_progress: "進行中",
  completed: "完了",
};
