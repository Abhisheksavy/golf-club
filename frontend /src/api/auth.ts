import apiClient from "../lib/axios";
import type { AuthResponse, MagicLinkResponse } from "../types";

export const requestMagicLink = async (email: string): Promise<MagicLinkResponse> => {
  const { data } = await apiClient.post<MagicLinkResponse>("/auth/requestMagicLink", { email });
  return data;
};

export const verifyMagicLink = async (token: string): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>(`/auth/verify?token=${token}`);
  return data;
};
