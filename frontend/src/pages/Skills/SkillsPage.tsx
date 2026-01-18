import { useState, useMemo } from "react";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { Modal } from "@/components/common/Modal";
import { SkillCard, SkillForm, SkillChart } from "@/components/features/skills";
import { useSkills } from "@/hooks/useSkills";
import type { Skill, CreateSkillInput, UpdateSkillInput } from "@/types";
import styles from "./Skills.module.css";

export function SkillsPage() {
  const {
    skills,
    categories,
    skillsByCategory,
    loading,
    error,
    createSkill,
    updateSkill,
    deleteSkill,
  } = useSkills();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deletingSkillId, setDeletingSkillId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [saving, setSaving] = useState(false);

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "すべてのカテゴリ" },
      ...categories.map((cat) => ({ value: cat, label: cat })),
    ],
    [categories]
  );

  const filteredSkills = useMemo(() => {
    if (categoryFilter === "all") return skills;
    return skills.filter((skill) => skill.category === categoryFilter);
  }, [skills, categoryFilter]);

  const handleCreate = async (data: CreateSkillInput) => {
    setSaving(true);
    try {
      await createSkill(data);
      setIsCreateModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: UpdateSkillInput) => {
    if (!editingSkill) return;
    setSaving(true);
    try {
      await updateSkill(editingSkill.skill_id, data);
      setEditingSkill(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSkillId) return;
    setSaving(true);
    try {
      await deleteSkill(deletingSkillId);
      setDeletingSkillId(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>エラーが発生しました: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>スキル一覧</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>スキル追加</Button>
      </div>

      {skills.length > 0 && (
        <div className={styles.chartSection}>
          <h2>スキルチャート</h2>
          <div className={styles.chartGrid}>
            <SkillChart skills={skills} size={320} />
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>総スキル数</span>
                <span className={styles.summaryValue}>{skills.length}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>カテゴリ数</span>
                <span className={styles.summaryValue}>{categories.length}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>平均レベル</span>
                <span className={styles.summaryValue}>
                  {(
                    skills.reduce((sum, s) => sum + s.level, 0) / skills.length
                  ).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.filters}>
        <Select
          label="カテゴリ"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={categoryOptions}
        />
      </div>

      {filteredSkills.length === 0 ? (
        <div className={styles.empty}>
          <p>スキルがありません</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            最初のスキルを追加
          </Button>
        </div>
      ) : categoryFilter === "all" && categories.length > 1 ? (
        <div className={styles.categoryList}>
          {categories.map((category) => (
            <div key={category} className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              <div className={styles.grid}>
                {skillsByCategory[category]?.map((skill) => (
                  <SkillCard
                    key={skill.skill_id}
                    skill={skill}
                    onEdit={setEditingSkill}
                    onDelete={setDeletingSkillId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.skill_id}
              skill={skill}
              onEdit={setEditingSkill}
              onDelete={setDeletingSkillId}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="スキルを追加"
      >
        <SkillForm
          skill={undefined}
          existingCategories={categories}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={saving}
        />
      </Modal>

      <Modal
        isOpen={!!editingSkill}
        onClose={() => setEditingSkill(null)}
        title="スキルを編集"
      >
        {editingSkill && (
          <SkillForm
            skill={editingSkill}
            existingCategories={categories}
            onSubmit={handleUpdate}
            onCancel={() => setEditingSkill(null)}
            loading={saving}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!deletingSkillId}
        onClose={() => setDeletingSkillId(null)}
        title="スキルを削除"
        size="sm"
      >
        <div className={styles.deleteConfirm}>
          <p>このスキルを削除しますか？</p>
          <div className={styles.deleteActions}>
            <Button
              variant="secondary"
              onClick={() => setDeletingSkillId(null)}
            >
              キャンセル
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={saving}>
              削除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
