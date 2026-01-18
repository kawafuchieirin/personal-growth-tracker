import { apiClient } from "./api";
import type {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
  GoalPriority,
} from "@/types";

// 個人専用アプリのため固定ユーザーID
const USER_ID = "default";

// フロントエンド優先度（文字列） ⇔ バックエンド優先度（整数）の変換
const PRIORITY_TO_INT: Record<GoalPriority, number> = {
  low: 1,
  medium: 5,
  high: 10,
};

function priorityToInt(priority: GoalPriority): number {
  return PRIORITY_TO_INT[priority] ?? 5;
}

function intToPriority(value: number): GoalPriority {
  if (value <= 3) return "low";
  if (value <= 7) return "medium";
  return "high";
}

// バックエンドレスポンスの型
interface GoalApiResponse {
  goal_id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

function mapResponseToGoal(response: GoalApiResponse): Goal {
  return {
    ...response,
    description: response.description ?? "",
    target_date: response.target_date ?? "",
    priority: intToPriority(response.priority),
    progress: 0, // バックエンドにはprogress未実装のためデフォルト値
  } as Goal;
}

export const goalsService = {
  async getAll(): Promise<Goal[]> {
    const data = await apiClient.get<GoalApiResponse[]>(
      `/goals?user_id=${USER_ID}`
    );
    return data.map(mapResponseToGoal);
  },

  async getById(goalId: string): Promise<Goal> {
    const data = await apiClient.get<GoalApiResponse>(
      `/goals/${goalId}?user_id=${USER_ID}`
    );
    return mapResponseToGoal(data);
  },

  async create(data: CreateGoalInput): Promise<Goal> {
    const payload = {
      title: data.title,
      description: data.description,
      target_date: data.target_date,
      priority: priorityToInt(data.priority),
    };
    const response = await apiClient.post<GoalApiResponse>(
      `/goals?user_id=${USER_ID}`,
      payload
    );
    return mapResponseToGoal(response);
  },

  async update(goalId: string, data: UpdateGoalInput): Promise<Goal> {
    const payload: Record<string, unknown> = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.target_date !== undefined) payload.target_date = data.target_date;
    if (data.status !== undefined) payload.status = data.status;
    if (data.priority !== undefined)
      payload.priority = priorityToInt(data.priority);

    const response = await apiClient.put<GoalApiResponse>(
      `/goals/${goalId}?user_id=${USER_ID}`,
      payload
    );
    return mapResponseToGoal(response);
  },

  async delete(goalId: string): Promise<void> {
    return apiClient.delete(`/goals/${goalId}?user_id=${USER_ID}`);
  },
};
