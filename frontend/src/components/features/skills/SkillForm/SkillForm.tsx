import { useState, type FormEvent } from "react";
import { Button } from "@/components/common/Button";
import { Input, Textarea } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import type {
  Skill,
  CreateSkillInput,
  UpdateSkillInput,
  SkillLevel,
} from "@/types";
import { SKILL_LEVEL_LABELS, DEFAULT_CATEGORIES } from "@/types";
import styles from "./SkillForm.module.css";

interface SkillFormBaseProps {
  existingCategories?: string[];
  onCancel: () => void;
  loading?: boolean;
}

interface CreateSkillFormProps extends SkillFormBaseProps {
  skill?: undefined;
  onSubmit: (data: CreateSkillInput) => Promise<void>;
}

interface EditSkillFormProps extends SkillFormBaseProps {
  skill: Skill;
  onSubmit: (data: UpdateSkillInput) => Promise<void>;
}

type SkillFormProps = CreateSkillFormProps | EditSkillFormProps;

const levelOptions = (
  Object.entries(SKILL_LEVEL_LABELS) as [string, string][]
).map(([value, label]) => ({ value, label: `${value} - ${label}` }));

export function SkillForm({
  skill,
  existingCategories = [],
  onSubmit,
  onCancel,
  loading = false,
}: SkillFormProps) {
  const [name, setName] = useState(skill?.name || "");
  const [category, setCategory] = useState(skill?.category || "");
  const [customCategory, setCustomCategory] = useState("");
  const [level, setLevel] = useState<SkillLevel>(skill?.level || 1);
  const [description, setDescription] = useState(skill?.description || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!skill;
  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...existingCategories])
  ).sort();

  const categoryOptions = [
    ...allCategories.map((cat) => ({ value: cat, label: cat })),
    { value: "__custom__", label: "その他（カスタム）" },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "スキル名は必須です";
    }
    if (!category && !customCategory.trim()) {
      newErrors.category = "カテゴリは必須です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory =
      category === "__custom__" ? customCategory.trim() : category;

    await onSubmit({
      name: name.trim(),
      category: finalCategory,
      level,
      description: description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="スキル名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="例: React, プレゼンテーション"
        error={errors.name}
        fullWidth
        required
      />
      <Select
        label="カテゴリ"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={categoryOptions}
        placeholder="カテゴリを選択"
        error={errors.category}
        fullWidth
      />
      {category === "__custom__" && (
        <Input
          label="カスタムカテゴリ"
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
          placeholder="新しいカテゴリ名"
          fullWidth
        />
      )}
      <Select
        label="レベル"
        value={level.toString()}
        onChange={(e) => setLevel(parseInt(e.target.value, 10) as SkillLevel)}
        options={levelOptions}
        fullWidth
      />
      <Textarea
        label="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="スキルの詳細説明（任意）"
        fullWidth
      />
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? "更新" : "追加"}
        </Button>
      </div>
    </form>
  );
}
