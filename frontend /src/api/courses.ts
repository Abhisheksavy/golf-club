import apiClient from "../lib/axios";
import type { Course } from "../types";

export const getCourses = async (): Promise<Course[]> => {
  const { data } = await apiClient.get("/courses");
  return data.data;
};

export const getAvailableDates = async (
  locationId: string,
  year: number,
  month: number
): Promise<string[]> => {
  const { data } = await apiClient.get(
    `/courses/${locationId}/available-dates`,
    {
      params: { year, month },
    }
  );
  return data.data.dates;
};
