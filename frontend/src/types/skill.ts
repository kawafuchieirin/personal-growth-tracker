export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export interface Skill {
  skill_id: string;
  user_id: string;
  name: string;
  category: string;
  level: SkillLevel;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSkillInput {
  name: string;
  category: string;
  level: SkillLevel;
  description: string;
}

export interface UpdateSkillInput {
  name?: string;
  category?: string;
  level?: SkillLevel;
  description?: string;
}

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  1: "入門",
  2: "初級",
  3: "中級",
  4: "上級",
  5: "エキスパート",
};

export const DEFAULT_CATEGORIES = [
  "プログラミング",
  "デザイン",
  "コミュニケーション",
  "リーダーシップ",
  "プロジェクト管理",
  "ビジネス",
  "その他",
];
