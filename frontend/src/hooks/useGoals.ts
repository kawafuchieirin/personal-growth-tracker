import { useState, useEffect, useCallback } from 'react';
import { goalsService } from '@/services';
import { useUser } from '@/contexts';
import type { Goal, CreateGoalInput, UpdateGoalInput } from '@/types';

export function useGoals() {
  const { user } = useUser();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await goalsService.getAll(user.id);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = useCallback(
    async (data: CreateGoalInput) => {
      const newGoal = await goalsService.create(user.id, data);
      setGoals((prev) => [...prev, newGoal]);
      return newGoal;
    },
    [user.id]
  );

  const updateGoal = useCallback(async (goalId: string, data: UpdateGoalInput) => {
    const updatedGoal = await goalsService.update(goalId, data);
    setGoals((prev) =>
      prev.map((goal) => (goal.goal_id === goalId ? updatedGoal : goal))
    );
    return updatedGoal;
  }, []);

  const deleteGoal = useCallback(async (goalId: string) => {
    await goalsService.delete(goalId);
    setGoals((prev) => prev.filter((goal) => goal.goal_id !== goalId));
  }, []);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}

export function useGoal(goalId: string | undefined) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoal = useCallback(async () => {
    if (!goalId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await goalsService.getById(goalId);
      setGoal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goal');
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  const updateGoal = useCallback(
    async (data: UpdateGoalInput) => {
      if (!goalId) return null;
      const updatedGoal = await goalsService.update(goalId, data);
      setGoal(updatedGoal);
      return updatedGoal;
    },
    [goalId]
  );

  const deleteGoal = useCallback(async () => {
    if (!goalId) return;
    await goalsService.delete(goalId);
    setGoal(null);
  }, [goalId]);

  return {
    goal,
    loading,
    error,
    fetchGoal,
    updateGoal,
    deleteGoal,
  };
}
