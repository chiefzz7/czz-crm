import api from "@/services/api";
import type { Course, CourseCreateRequest, DashboardMetrics } from "@/types";

export const coursesApi = {
  list: async (): Promise<Course[]> => {
    const res = await api.get<Course[]>("/courses");
    return res.data;
  },

  getById: async (id: string): Promise<Course> => {
    const res = await api.get<Course>(`/courses/${id}`);
    return res.data;
  },

  create: async (data: CourseCreateRequest): Promise<Course> => {
    const res = await api.post<Course>("/courses", data);
    return res.data;
  },

  update: async (id: string, data: Partial<CourseCreateRequest>): Promise<Course> => {
    const res = await api.patch<Course>(`/courses/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/courses/${id}`);
  },
};

export const dashboardApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const res = await api.get<DashboardMetrics>("/dashboard");
    return res.data;
  },
};
