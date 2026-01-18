import { useState, useEffect, useCallback, useMemo } from "react";
import { skillsService } from "@/services";
import type { Skill, CreateSkillInput, UpdateSkillInput } from "@/types";

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await skillsService.getAll();
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch skills");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const createSkill = useCallback(async (data: CreateSkillInput) => {
    const newSkill = await skillsService.create(data);
    setSkills((prev) => [...prev, newSkill]);
    return newSkill;
  }, []);

  const updateSkill = useCallback(
    async (skillId: string, data: UpdateSkillInput) => {
      const updatedSkill = await skillsService.update(skillId, data);
      setSkills((prev) =>
        prev.map((skill) => (skill.skill_id === skillId ? updatedSkill : skill))
      );
      return updatedSkill;
    },
    []
  );

  const deleteSkill = useCallback(async (skillId: string) => {
    await skillsService.delete(skillId);
    setSkills((prev) => prev.filter((skill) => skill.skill_id !== skillId));
  }, []);

  const categories = useMemo(() => {
    const categorySet = new Set(skills.map((skill) => skill.category));
    return Array.from(categorySet).sort();
  }, [skills]);

  const skillsByCategory = useMemo(() => {
    return skills.reduce<Record<string, Skill[]>>((acc, skill) => {
      const categorySkills = acc[skill.category] ?? [];
      categorySkills.push(skill);
      acc[skill.category] = categorySkills;
      return acc;
    }, {});
  }, [skills]);

  return {
    skills,
    categories,
    skillsByCategory,
    loading,
    error,
    fetchSkills,
    createSkill,
    updateSkill,
    deleteSkill,
  };
}
