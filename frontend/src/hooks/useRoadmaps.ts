import { useState, useEffect, useCallback } from 'react';
import { roadmapsService } from '@/services';
import type { Milestone, CreateMilestoneInput, UpdateMilestoneInput } from '@/types';

export function useRoadmaps(goalId: string | undefined) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    if (!goalId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await roadmapsService.getByGoalId(goalId);
      setMilestones(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch milestones');
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const createMilestone = useCallback(
    async (data: CreateMilestoneInput) => {
      if (!goalId) return null;
      const newMilestone = await roadmapsService.createMilestone(goalId, {
        ...data,
        order: data.order ?? milestones.length,
      });
      setMilestones((prev) =>
        [...prev, newMilestone].sort((a, b) => a.order - b.order)
      );
      return newMilestone;
    },
    [goalId, milestones.length]
  );

  const updateMilestone = useCallback(
    async (milestoneId: string, data: UpdateMilestoneInput) => {
      if (!goalId) return null;
      const updatedMilestone = await roadmapsService.updateMilestone(
        goalId,
        milestoneId,
        data
      );
      setMilestones((prev) =>
        prev
          .map((m) => (m.milestone_id === milestoneId ? updatedMilestone : m))
          .sort((a, b) => a.order - b.order)
      );
      return updatedMilestone;
    },
    [goalId]
  );

  const deleteMilestone = useCallback(
    async (milestoneId: string) => {
      if (!goalId) return;
      await roadmapsService.deleteMilestone(goalId, milestoneId);
      setMilestones((prev) =>
        prev.filter((m) => m.milestone_id !== milestoneId)
      );
    },
    [goalId]
  );

  return {
    milestones,
    loading,
    error,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  };
}
