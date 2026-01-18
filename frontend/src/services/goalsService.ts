import { apiClient } from "./api";
import type { Goal, CreateGoalInput, UpdateGoalInput } from "@/types";

// 個人専用アプリのため固定ユーザーID
const USER_ID = "default";

export const goalsService = {
  async getAll(): Promise<Goal[]> {
    return apiClient.get<Goal[]>(`/goals?user_id=${USER_ID}`);
  },

  async getById(goalId: string): Promise<Goal> {
    return apiClient.get<Goal>(`/goals/${goalId}`);
  },

  async create(data: CreateGoalInput): Promise<Goal> {
    return apiClient.post<Goal>("/goals", { ...data, user_id: USER_ID });
  },

  async update(goalId: string, data: UpdateGoalInput): Promise<Goal> {
    return apiClient.put<Goal>(`/goals/${goalId}`, data);
  },

  async delete(goalId: string): Promise<void> {
    return apiClient.delete(`/goals/${goalId}`);
  },
};
