import { apiClient } from "./api";
import type { Skill, CreateSkillInput, UpdateSkillInput } from "@/types";

export const skillsService = {
  async getAll(userId: string): Promise<Skill[]> {
    return apiClient.get<Skill[]>(`/skills?user_id=${userId}`);
  },

  async getById(skillId: string): Promise<Skill> {
    return apiClient.get<Skill>(`/skills/${skillId}`);
  },

  async create(userId: string, data: CreateSkillInput): Promise<Skill> {
    return apiClient.post<Skill>("/skills", { ...data, user_id: userId });
  },

  async update(skillId: string, data: UpdateSkillInput): Promise<Skill> {
    return apiClient.put<Skill>(`/skills/${skillId}`, data);
  },

  async delete(skillId: string): Promise<void> {
    return apiClient.delete(`/skills/${skillId}`);
  },
};
