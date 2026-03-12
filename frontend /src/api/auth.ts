import apiClient from "../lib/axios";
import type { AuthResponse, MagicLinkResponse } from "../types";

export const requestMagicLink = async (email: string): Promise<MagicLinkResponse> => {
  const { data } = await apiClient.post<MagicLinkResponse>("/auth/requestMagicLink", { email });
  
  return data;
};

export const verifyMagicLink = async (token: string): Promise<AuthResponse> => {
  const { data } = await apiClient.post(`/auth/verify?token=${token}`);
  return { message: data.message, token: data.data.token, user: data.data.user };
};

export const loginWithPassword = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return { message: data.message, token: data.data.token, user: data.data.user };
};

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  const { data } = await apiClient.post("/auth/forgot-password", { email });
  return { message: data.message };
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  const { data } = await apiClient.post(`/auth/reset-password?token=${token}`, { password });
  return { message: data.message };
};
