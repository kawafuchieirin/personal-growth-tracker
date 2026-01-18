import { apiClient } from "./api";
import type {
  Milestone,
  CreateMilestoneInput,
  UpdateMilestoneInput,
} from "@/types";

export const roadmapsService = {
  async getByGoalId(goalId: string): Promise<Milestone[]> {
    return apiClient.get<Milestone[]>(`/roadmaps/${goalId}/milestones`);
  },

  async getMilestone(goalId: string, milestoneId: string): Promise<Milestone> {
    return apiClient.get<Milestone>(
      `/roadmaps/${goalId}/milestones/${milestoneId}`
    );
  },

  async createMilestone(
    goalId: string,
    data: CreateMilestoneInput
  ): Promise<Milestone> {
    return apiClient.post<Milestone>(`/roadmaps/${goalId}/milestones`, data);
  },

  async updateMilestone(
    goalId: string,
    milestoneId: string,
    data: UpdateMilestoneInput
  ): Promise<Milestone> {
    return apiClient.put<Milestone>(
      `/roadmaps/${goalId}/milestones/${milestoneId}`,
      data
    );
  },

  async deleteMilestone(goalId: string, milestoneId: string): Promise<void> {
    return apiClient.delete(`/roadmaps/${goalId}/milestones/${milestoneId}`);
  },
};
