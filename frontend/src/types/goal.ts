export type GoalStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "on_hold";
export type GoalPriority = "low" | "medium" | "high";

export interface Goal {
  goal_id: string;
  user_id: string;
  title: string;
  description: string;
  target_date: string;
  status: GoalStatus;
  priority: GoalPriority;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  title: string;
  description: string;
  target_date: string;
  priority: GoalPriority;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  target_date?: string;
  status?: GoalStatus;
  priority?: GoalPriority;
  progress?: number;
}

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: "未開始",
  in_progress: "進行中",
  completed: "完了",
  on_hold: "保留中",
};

export const GOAL_PRIORITY_LABELS: Record<GoalPriority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};
