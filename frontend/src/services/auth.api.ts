import api from "@/services/api";
import type { AuthTokens, User, LoginRequest } from "@/types";

export const authApi = {
  login: async (data: LoginRequest): Promise<{ user: User } & AuthTokens> => {
    const res = await api.post<{ user: User } & AuthTokens>("/auth/login", data);
    return res.data;
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const res = await api.post<AuthTokens>("/auth/refresh", { refresh_token: refreshToken });
    return res.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/auth/logout", { refresh_token: refreshToken });
  },

  me: async (): Promise<User> => {
    const res = await api.get<User>("/auth/me");
    return res.data;
  },
};
