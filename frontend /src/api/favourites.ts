import apiClient from "../lib/axios";
import type { FavouriteSet } from "../types";

export const getFavourites = async (): Promise<FavouriteSet[]> => {
  const { data } = await apiClient.get("/favourites");
  return data.data;
};

export const getFavouriteById = async (id: string): Promise<FavouriteSet> => {
  const { data } = await apiClient.get(`/favourites/${id}`);
  return data.data;
};

export const createFavourite = async (setName: string, clubs: string[]): Promise<FavouriteSet> => {
  const { data } = await apiClient.post("/favourites", { setName, clubs });
  return data.data;
};

export const updateFavourite = async (
  id: string,
  update: { setName?: string; clubs?: string[] }
): Promise<FavouriteSet> => {
  const { data } = await apiClient.put(`/favourites/${id}`, update);
  return data.data;
};

export const deleteFavourite = async (id: string): Promise<void> => {
  await apiClient.delete(`/favourites/${id}`);
};
