import api from "@/services/api";
import type { Lead, LeadCreateRequest, LeadUpdateRequest, Interaction, InteractionCreateRequest } from "@/types";

export const leadsApi = {
  list: async (params?: { status?: string; course_id?: string }): Promise<Lead[]> => {
    const res = await api.get<Lead[]>("/leads", { params });
    return res.data;
  },

  getById: async (id: string): Promise<Lead> => {
    const res = await api.get<Lead>(`/leads/${id}`);
    return res.data;
  },

  create: async (data: LeadCreateRequest): Promise<Lead> => {
    const res = await api.post<Lead>("/leads", data);
    return res.data;
  },

  update: async (id: string, data: LeadUpdateRequest): Promise<Lead> => {
    const res = await api.patch<Lead>(`/leads/${id}`, data);
    return res.data;
  },

  move: async (id: string, status: string): Promise<Lead> => {
    const res = await api.patch<Lead>(`/leads/${id}/move`, { status });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
  },

  getInteractions: async (leadId: string): Promise<Interaction[]> => {
    const res = await api.get<Interaction[]>(`/leads/${leadId}/interactions`);
    return res.data;
  },

  addInteraction: async (leadId: string, data: InteractionCreateRequest): Promise<Interaction> => {
    const res = await api.post<Interaction>(`/leads/${leadId}/interactions`, data);
    return res.data;
  },
};
