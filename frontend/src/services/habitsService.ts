import { apiClient } from "./api";
import type {
  Habit,
  CreateHabitInput,
  UpdateHabitInput,
  HabitLog,
  CreateHabitLogInput,
  ContributionResponse,
} from "@/types";

const USER_ID = "default";

interface HabitApiResponse {
  habit_id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: string;
  reminder_time: string | null;
  reminder_enabled: boolean;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface HabitLogApiResponse {
  habit_id: string;
  date: string;
  completed: boolean;
  completed_at: string | null;
  note: string | null;
}

function mapResponseToHabit(response: HabitApiResponse): Habit {
  return {
    ...response,
    frequency: response.frequency as Habit["frequency"],
  };
}

function mapResponseToHabitLog(response: HabitLogApiResponse): HabitLog {
  return response;
}

export const habitsService = {
  async getAll(): Promise<Habit[]> {
    const data = await apiClient.get<HabitApiResponse[]>(
      `/habits?user_id=${USER_ID}`
    );
    return data.map(mapResponseToHabit);
  },

  async getById(habitId: string): Promise<Habit> {
    const data = await apiClient.get<HabitApiResponse>(
      `/habits/${habitId}?user_id=${USER_ID}`
    );
    return mapResponseToHabit(data);
  },

  async create(data: CreateHabitInput): Promise<Habit> {
    const response = await apiClient.post<HabitApiResponse>(
      `/habits?user_id=${USER_ID}`,
      data
    );
    return mapResponseToHabit(response);
  },

  async update(habitId: string, data: UpdateHabitInput): Promise<Habit> {
    const response = await apiClient.put<HabitApiResponse>(
      `/habits/${habitId}?user_id=${USER_ID}`,
      data
    );
    return mapResponseToHabit(response);
  },

  async delete(habitId: string): Promise<void> {
    return apiClient.delete(`/habits/${habitId}?user_id=${USER_ID}`);
  },

  async getLogs(
    habitId: string,
    startDate?: string,
    endDate?: string
  ): Promise<HabitLog[]> {
    let url = `/habits/${habitId}/logs?user_id=${USER_ID}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    const data = await apiClient.get<HabitLogApiResponse[]>(url);
    return data.map(mapResponseToHabitLog);
  },

  async createLog(
    habitId: string,
    data: CreateHabitLogInput
  ): Promise<HabitLog> {
    const response = await apiClient.post<HabitLogApiResponse>(
      `/habits/${habitId}/logs?user_id=${USER_ID}`,
      data
    );
    return mapResponseToHabitLog(response);
  },

  async deleteLog(habitId: string, date: string): Promise<void> {
    return apiClient.delete(
      `/habits/${habitId}/logs/${date}?user_id=${USER_ID}`
    );
  },

  async getContributions(year?: number): Promise<ContributionResponse> {
    const yearParam = year ? `&year=${year}` : "";
    return apiClient.get<ContributionResponse>(
      `/habits/contributions?user_id=${USER_ID}${yearParam}`
    );
  },
};
