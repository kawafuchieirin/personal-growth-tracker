import { apiClient } from './api';
import type { Goal, CreateGoalInput, UpdateGoalInput } from '@/types';

export const goalsService = {
  async getAll(userId: string): Promise<Goal[]> {
    return apiClient.get<Goal[]>(`/goals?user_id=${userId}`);
  },

  async getById(goalId: string): Promise<Goal> {
    return apiClient.get<Goal>(`/goals/${goalId}`);
  },

  async create(userId: string, data: CreateGoalInput): Promise<Goal> {
    return apiClient.post<Goal>('/goals', { ...data, user_id: userId });
  },

  async update(goalId: string, data: UpdateGoalInput): Promise<Goal> {
    return apiClient.put<Goal>(`/goals/${goalId}`, data);
  },

  async delete(goalId: string): Promise<void> {
    return apiClient.delete(`/goals/${goalId}`);
  },
};
