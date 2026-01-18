import { apiClient } from "./api";
import type { Skill, CreateSkillInput, UpdateSkillInput } from "@/types";

// 個人専用アプリのため固定ユーザーID
const USER_ID = "default";

export const skillsService = {
  async getAll(): Promise<Skill[]> {
    return apiClient.get<Skill[]>(`/skills?user_id=${USER_ID}`);
  },

  async getById(skillId: string): Promise<Skill> {
    return apiClient.get<Skill>(`/skills/${skillId}`);
  },

  async create(data: CreateSkillInput): Promise<Skill> {
    return apiClient.post<Skill>("/skills", { ...data, user_id: USER_ID });
  },

  async update(skillId: string, data: UpdateSkillInput): Promise<Skill> {
    return apiClient.put<Skill>(`/skills/${skillId}`, data);
  },

  async delete(skillId: string): Promise<void> {
    return apiClient.delete(`/skills/${skillId}`);
  },
};
