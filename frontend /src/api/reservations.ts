import apiClient from "../lib/axios";
import type { Reservation } from "../types";

export const createReservation = async (payload: {
  course: string;
  date: string;
  clubs: string[];
  saveToBag?: boolean;
}): Promise<Reservation> => {
  const { data } = await apiClient.post("/reservations", payload);
  return data;
};

export const getReservations = async (): Promise<Reservation[]> => {
  const { data } = await apiClient.get("/reservations");
  return data.data;
};
