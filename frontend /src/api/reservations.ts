import apiClient from "../lib/axios";
import type { Reservation, PaginatedReservations } from "../types";

export const createReservation = async (payload: {
  course: string;
  date: string;
  clubs: string[];
  saveToBag?: boolean;
}): Promise<Reservation> => {
  const { data } = await apiClient.post("/reservations", payload);
  return data;
};

export const getReservations = async (
  page = 1,
  limit = 10
): Promise<PaginatedReservations> => {
  const { data } = await apiClient.get("/reservations", {
    params: { page, limit },
  });
  return data.data;
};
