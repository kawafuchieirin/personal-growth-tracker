import { useState, useEffect, useCallback } from "react";
import { habitsService } from "@/services";
import type {
  Habit,
  CreateHabitInput,
  UpdateHabitInput,
  HabitLog,
  CreateHabitLogInput,
  ContributionResponse,
} from "@/types";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await habitsService.getAll();
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch habits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const createHabit = useCallback(async (data: CreateHabitInput) => {
    const newHabit = await habitsService.create(data);
    setHabits((prev) => [...prev, newHabit]);
    return newHabit;
  }, []);

  const updateHabit = useCallback(
    async (habitId: string, data: UpdateHabitInput) => {
      const updatedHabit = await habitsService.update(habitId, data);
      setHabits((prev) =>
        prev.map((habit) => (habit.habit_id === habitId ? updatedHabit : habit))
      );
      return updatedHabit;
    },
    []
  );

  const deleteHabit = useCallback(async (habitId: string) => {
    await habitsService.delete(habitId);
    setHabits((prev) => prev.filter((habit) => habit.habit_id !== habitId));
  }, []);

  return {
    habits,
    loading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
  };
}

export function useHabit(habitId: string | undefined) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabit = useCallback(async () => {
    if (!habitId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await habitsService.getById(habitId);
      setHabit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch habit");
    } finally {
      setLoading(false);
    }
  }, [habitId]);

  useEffect(() => {
    fetchHabit();
  }, [fetchHabit]);

  const updateHabit = useCallback(
    async (data: UpdateHabitInput) => {
      if (!habitId) return null;
      const updatedHabit = await habitsService.update(habitId, data);
      setHabit(updatedHabit);
      return updatedHabit;
    },
    [habitId]
  );

  const deleteHabit = useCallback(async () => {
    if (!habitId) return;
    await habitsService.delete(habitId);
    setHabit(null);
  }, [habitId]);

  return {
    habit,
    loading,
    error,
    fetchHabit,
    updateHabit,
    deleteHabit,
  };
}

export function useHabitLogs(habitId: string | undefined) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (startDate?: string, endDate?: string) => {
      if (!habitId) return;

      setLoading(true);
      setError(null);
      try {
        const data = await habitsService.getLogs(habitId, startDate, endDate);
        setLogs(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch habit logs"
        );
      } finally {
        setLoading(false);
      }
    },
    [habitId]
  );

  const createLog = useCallback(
    async (data: CreateHabitLogInput) => {
      if (!habitId) return null;
      const newLog = await habitsService.createLog(habitId, data);
      setLogs((prev) => {
        const filtered = prev.filter((log) => log.date !== data.date);
        return [...filtered, newLog];
      });
      return newLog;
    },
    [habitId]
  );

  const deleteLog = useCallback(
    async (date: string) => {
      if (!habitId) return;
      await habitsService.deleteLog(habitId, date);
      setLogs((prev) => prev.filter((log) => log.date !== date));
    },
    [habitId]
  );

  const isCompleted = useCallback(
    (date: string) => {
      return logs.some((log) => log.date === date && log.completed);
    },
    [logs]
  );

  return {
    logs,
    loading,
    error,
    fetchLogs,
    createLog,
    deleteLog,
    isCompleted,
  };
}

export function useContributions(year?: number) {
  const [contributions, setContributions] =
    useState<ContributionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContributions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await habitsService.getContributions(year);
      setContributions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch contributions"
      );
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  return {
    contributions,
    loading,
    error,
    fetchContributions,
  };
}

export function useTodayHabits() {
  const { habits, loading: habitsLoading, error: habitsError } = useHabits();
  const [todayLogs, setTodayLogs] = useState<Map<string, HabitLog>>(new Map());
  const [logsLoading, setLogsLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0] as string;

  const fetchTodayLogs = useCallback(async () => {
    if (habits.length === 0) return;

    setLogsLoading(true);
    try {
      const logsMap = new Map<string, HabitLog>();
      await Promise.all(
        habits.map(async (habit) => {
          const logs = await habitsService.getLogs(
            habit.habit_id,
            today,
            today
          );
          const firstLog = logs[0];
          if (firstLog) {
            logsMap.set(habit.habit_id, firstLog);
          }
        })
      );
      setTodayLogs(logsMap);
    } finally {
      setLogsLoading(false);
    }
  }, [habits, today]);

  useEffect(() => {
    fetchTodayLogs();
  }, [fetchTodayLogs]);

  const toggleCompletion = useCallback(
    async (habitId: string) => {
      const existingLog = todayLogs.get(habitId);
      if (existingLog?.completed) {
        await habitsService.deleteLog(habitId, today);
        setTodayLogs((prev) => {
          const newMap = new Map(prev);
          newMap.delete(habitId);
          return newMap;
        });
      } else {
        const newLog = await habitsService.createLog(habitId, {
          date: today,
          completed: true,
        });
        setTodayLogs((prev) => new Map(prev).set(habitId, newLog));
      }
    },
    [todayLogs, today]
  );

  const isCompleted = useCallback(
    (habitId: string) => {
      const log = todayLogs.get(habitId);
      return log?.completed ?? false;
    },
    [todayLogs]
  );

  const activeHabits = habits.filter((h) => h.is_active);

  return {
    habits: activeHabits,
    loading: habitsLoading || logsLoading,
    error: habitsError,
    toggleCompletion,
    isCompleted,
    completedCount: Array.from(todayLogs.values()).filter((l) => l.completed)
      .length,
    totalCount: activeHabits.length,
  };
}
