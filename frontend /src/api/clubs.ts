import apiClient from "../lib/axios";
import type { AvailableClub, PaginatedClubs } from "../types";

export const getClubs = async (params?: {
  brand?: string;
  category?: string;
  search?: string;
  isActive?: "true" | "false" | "all";
  archived?: "true" | "false" | "all";
  page?: number;
  limit?: number;
}): Promise<PaginatedClubs> => {
  const { data } = await apiClient.get("/clubs", { params });
  return data.data;
};

export const getAvailableClubs = async (course: string, date: string): Promise<AvailableClub[]> => {
  const { data } = await apiClient.get("/clubs/available", {
    params: { course, date },
  });
  return data.data;
};
