export type HabitFrequency = "daily" | "weekdays" | "weekly";

export interface Habit {
  habit_id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  reminder_time: string | null;
  reminder_enabled: boolean;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  frequency: HabitFrequency;
  reminder_time?: string;
  reminder_enabled?: boolean;
  color?: string;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string;
  frequency?: HabitFrequency;
  reminder_time?: string;
  reminder_enabled?: boolean;
  color?: string;
  is_active?: boolean;
}

export interface HabitLog {
  habit_id: string;
  date: string;
  completed: boolean;
  completed_at: string | null;
  note: string | null;
}

export interface CreateHabitLogInput {
  date: string;
  completed?: boolean;
  note?: string;
}

export interface ContributionData {
  date: string;
  count: number;
  level: number;
}

export interface ContributionResponse {
  year: number;
  total_contributions: number;
  data: ContributionData[];
}

export const HABIT_FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: "毎日",
  weekdays: "平日のみ",
  weekly: "週1回",
};

export const DEFAULT_HABIT_COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];
