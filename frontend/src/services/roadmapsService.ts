import { apiClient } from "./api";
import type {
  Milestone,
  CreateMilestoneInput,
  UpdateMilestoneInput,
} from "@/types";

// バックエンドレスポンスの型
interface MilestoneApiResponse {
  milestone_id: string;
  goal_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: string;
  order: number;
  created_at: string;
  updated_at: string;
}

function mapResponseToMilestone(response: MilestoneApiResponse): Milestone {
  return {
    milestone_id: response.milestone_id,
    goal_id: response.goal_id,
    title: response.title,
    description: response.description ?? "",
    due_date: response.target_date ?? "",
    status: response.status as Milestone["status"],
    order: response.order,
    created_at: response.created_at,
    updated_at: response.updated_at,
  };
}

export const roadmapsService = {
  async getByGoalId(goalId: string): Promise<Milestone[]> {
    const data = await apiClient.get<MilestoneApiResponse[]>(
      `/roadmaps?goal_id=${goalId}`
    );
    return data.map(mapResponseToMilestone);
  },

  async getMilestone(goalId: string, milestoneId: string): Promise<Milestone> {
    const data = await apiClient.get<MilestoneApiResponse>(
      `/roadmaps/${milestoneId}?goal_id=${goalId}`
    );
    return mapResponseToMilestone(data);
  },

  async createMilestone(
    goalId: string,
    data: CreateMilestoneInput
  ): Promise<Milestone> {
    const payload = {
      title: data.title,
      description: data.description,
      target_date: data.due_date,
      order: data.order ?? 0,
    };
    const response = await apiClient.post<MilestoneApiResponse>(
      `/roadmaps?goal_id=${goalId}`,
      payload
    );
    return mapResponseToMilestone(response);
  },

  async updateMilestone(
    goalId: string,
    milestoneId: string,
    data: UpdateMilestoneInput
  ): Promise<Milestone> {
    const payload: Record<string, unknown> = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.due_date !== undefined) payload.target_date = data.due_date;
    if (data.status !== undefined) payload.status = data.status;
    if (data.order !== undefined) payload.order = data.order;

    const response = await apiClient.put<MilestoneApiResponse>(
      `/roadmaps/${milestoneId}?goal_id=${goalId}`,
      payload
    );
    return mapResponseToMilestone(response);
  },

  async deleteMilestone(goalId: string, milestoneId: string): Promise<void> {
    return apiClient.delete(`/roadmaps/${milestoneId}?goal_id=${goalId}`);
  },
};
