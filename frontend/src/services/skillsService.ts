import { apiClient } from "./api";
import type {
  Skill,
  CreateSkillInput,
  UpdateSkillInput,
  SkillLevel,
} from "@/types";

// 個人専用アプリのため固定ユーザーID
const USER_ID = "default";

// フロントエンドレベル（1-5） ⇔ バックエンドレベル（1-100）の変換
function levelToBackend(level: SkillLevel): number {
  return level * 20;
}

function levelToFrontend(level: number): SkillLevel {
  const frontendLevel = Math.round(level / 20);
  return Math.max(1, Math.min(5, frontendLevel)) as SkillLevel;
}

// バックエンドレスポンスの型
interface SkillApiResponse {
  skill_id: string;
  user_id: string;
  name: string;
  category: string | null;
  level: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

function mapResponseToSkill(response: SkillApiResponse): Skill {
  return {
    ...response,
    category: response.category ?? "",
    description: response.description ?? "",
    level: levelToFrontend(response.level),
  };
}

export const skillsService = {
  async getAll(): Promise<Skill[]> {
    const data = await apiClient.get<SkillApiResponse[]>(
      `/skills?user_id=${USER_ID}`
    );
    return data.map(mapResponseToSkill);
  },

  async getById(skillId: string): Promise<Skill> {
    const data = await apiClient.get<SkillApiResponse>(
      `/skills/${skillId}?user_id=${USER_ID}`
    );
    return mapResponseToSkill(data);
  },

  async create(data: CreateSkillInput): Promise<Skill> {
    const payload = {
      name: data.name,
      category: data.category,
      level: levelToBackend(data.level),
      description: data.description,
    };
    const response = await apiClient.post<SkillApiResponse>(
      `/skills?user_id=${USER_ID}`,
      payload
    );
    return mapResponseToSkill(response);
  },

  async update(skillId: string, data: UpdateSkillInput): Promise<Skill> {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.category !== undefined) payload.category = data.category;
    if (data.level !== undefined) payload.level = levelToBackend(data.level);
    if (data.description !== undefined) payload.description = data.description;

    const response = await apiClient.put<SkillApiResponse>(
      `/skills/${skillId}?user_id=${USER_ID}`,
      payload
    );
    return mapResponseToSkill(response);
  },

  async delete(skillId: string): Promise<void> {
    return apiClient.delete(`/skills/${skillId}?user_id=${USER_ID}`);
  },
};
