// CZZ CRM — TypeScript Global Types

export type LeadStatus = "novo" | "contatado" | "proposta" | "matriculado" | "perdido";
export type LeadSource = "ads" | "organic" | "referral" | "webinar" | "indicacao" | "outro";
export type InteractionType = "note" | "call" | "email" | "whatsapp";
export type CourseCategory = "Marketing" | "Tecnologia" | "Vendas" | "Design" | "Gestão" | "Finanças" | "Saúde" | "Outros";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface Course {
  id: string;
  name: string;
  description: string | null;
  category: CourseCategory;
  price: number;
  duration_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  course_id: string | null;
  status: LeadStatus;
  source: LeadSource | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  lead_id: string;
  note: string;
  type: InteractionType;
  created_at: string;
}

export interface PipelineStageStats {
  status: LeadStatus;
  count: number;
  total_value: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface DashboardMetrics {
  total_leads: number;
  leads_this_month: number;
  conversion_rate: number;
  total_revenue: number;
  revenue_this_month: number;
  active_deals: number;
  pipeline_stages: PipelineStageStats[];
  monthly_revenue: MonthlyRevenue[];
}

// ── API request types ─────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CourseCreateRequest {
  name: string;
  description?: string;
  category: CourseCategory;
  price: number;
  duration_hours: number;
  is_active?: boolean;
}

export interface LeadCreateRequest {
  name: string;         // obrigatório
  course_id: string;    // obrigatório (validado no frontend)
  source: LeadSource;   // obrigatório (validado no frontend)
  email?: string;
  phone?: string;
  notes?: string;
}

export interface LeadUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  course_id?: string;
  source?: LeadSource;
  status?: LeadStatus;
  notes?: string;
}

export interface InteractionCreateRequest {
  note: string;
  type: InteractionType;
}

// ── UI helpers ────────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  proposta: "Proposta Enviada",
  matriculado: "Matriculado",
  perdido: "Perdido",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: "bg-blue-100 text-blue-700 border-blue-200",
  contatado: "bg-indigo-100 text-indigo-700 border-indigo-200",
  proposta: "bg-amber-100 text-amber-700 border-amber-200",
  matriculado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  perdido: "bg-red-100 text-red-700 border-red-200",
};

export const STATUS_DOT: Record<LeadStatus, string> = {
  novo: "bg-blue-500",
  contatado: "bg-indigo-500",
  proposta: "bg-amber-500",
  matriculado: "bg-emerald-500",
  perdido: "bg-red-400",
};

export const INTERACTION_ICONS: Record<InteractionType, string> = {
  note: "📝",
  call: "📞",
  email: "✉️",
  whatsapp: "💬",
};

export const INTERACTION_LABELS: Record<InteractionType, string> = {
  note: "Nota",
  call: "Ligação",
  email: "E-mail",
  whatsapp: "WhatsApp",
};
