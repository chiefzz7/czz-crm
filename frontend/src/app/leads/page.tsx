"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/services/leads.api";
import { coursesApi } from "@/services/courses.api";
import {
  STATUS_LABELS,
  type Lead,
  type Course,
  type LeadStatus,
  type LeadCreateRequest,
  type LeadUpdateRequest,
  type LeadSource,
} from "@/types";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
  Phone,
  Mail,
  BookOpen,
  Save,
} from "lucide-react";

const SOURCES: { value: LeadSource; label: string }[] = [
  { value: "ads", label: "Anúncios (Ads)" },
  { value: "organic", label: "Orgânico" },
  { value: "referral", label: "Referência" },
  { value: "webinar", label: "Webinar" },
  { value: "indicacao", label: "Indicação" },
  { value: "outro", label: "Outro" },
];

// ── Shared Form Fields ─────────────────────────────────────────────────────────
function LeadFormFields({
  form,
  setForm,
  courses,
  isEdit = false,
}: {
  form: LeadCreateRequest | LeadUpdateRequest;
  setForm: (fn: (prev: any) => any) => void;
  courses: Course[];
  isEdit?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      {/* Nome */}
      <div>
        <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">
          Nome completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="input-base"
          placeholder="Ex: João Silva"
          value={(form as any).name ?? ""}
          onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
        />
      </div>

      {/* Curso */}
      <div>
        <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">
          Curso / Pacote <span className="text-red-500">*</span>
        </label>
        <select
          className="input-base"
          value={(form as any).course_id ?? ""}
          onChange={(e) => setForm((f: any) => ({ ...f, course_id: e.target.value || undefined }))}
        >
          <option value="">Selecione um curso</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Origem */}
      <div>
        <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">
          Origem <span className="text-red-500">*</span>
        </label>
        <select
          className="input-base"
          value={(form as any).source ?? ""}
          onChange={(e) => setForm((f: any) => ({ ...f, source: (e.target.value as LeadSource) || undefined }))}
        >
          <option value="">Selecione a origem</option>
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* E-mail */}
      <div>
        <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">
          E-mail
        </label>
        <input
          type="email"
          className="input-base"
          placeholder="joao@email.com"
          value={(form as any).email ?? ""}
          onChange={(e) => setForm((f: any) => ({ ...f, email: e.target.value || undefined }))}
        />
      </div>

      {/* Telefone */}
      <div>
        <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">
          Telefone
        </label>
        <input
          type="tel"
          className="input-base"
          placeholder="(11) 99999-9999"
          value={(form as any).phone ?? ""}
          onChange={(e) => setForm((f: any) => ({ ...f, phone: e.target.value || undefined }))}
        />
      </div>

      {/* Status (somente edição) */}
      {isEdit && (
        <div>
          <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">
            Status
          </label>
          <select
            className="input-base"
            value={(form as any).status ?? ""}
            onChange={(e) => setForm((f: any) => ({ ...f, status: e.target.value || undefined }))}
          >
            <option value="">Sem alteração</option>
            {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Observações */}
      <div>
        <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">
          Observações
        </label>
        <textarea
          className="input-base resize-y"
          rows={3}
          placeholder="Anotações sobre o lead..."
          value={(form as any).notes ?? ""}
          onChange={(e) => setForm((f: any) => ({ ...f, notes: e.target.value || undefined }))}
        />
      </div>
    </div>
  );
}

// ── Lead Create Modal ──────────────────────────────────────────────────────────
function LeadCreateModal({ onClose, courses }: { onClose: () => void; courses: Course[] }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<LeadCreateRequest>({
    name: "",
    course_id: "" as any,
    source: "" as any,
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      onClose();
    },
    onError: (e: any) => setError(e?.response?.data?.detail ?? e?.response?.data?.message ?? "Erro ao criar lead."),
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return setError("O nome do lead é obrigatório.");
    if (!form.course_id) return setError("O curso/pacote é obrigatório.");
    if (!form.source) return setError("A origem é obrigatória.");
    setError("");
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/45 flex items-center justify-center z-[1000] p-4">
      <div className="card animate-fade-in w-full max-w-[480px] p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">Novo Lead</h2>
          <button className="btn-ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--color-muted)] mb-4">
          Campos com <span className="text-red-500">*</span> são obrigatórios.
        </p>

        <LeadFormFields form={form} setForm={setForm} courses={courses} />

        {error && (
          <div className="bg-red-100 text-red-700 rounded-lg px-3 py-2.5 text-[13px] mt-3.5">
            {error}
          </div>
        )}

        {/* Action buttons — centralizados */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <button className="btn-secondary flex-1 justify-center" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary flex-1 justify-center"
            disabled={mutation.isPending}
            onClick={handleSubmit}
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {mutation.isPending ? "Salvando..." : "Criar Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Lead Edit Modal ────────────────────────────────────────────────────────────
function LeadEditModal({ lead, onClose, courses }: { lead: Lead; onClose: () => void; courses: Course[] }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<LeadUpdateRequest>({
    name: lead.name,
    email: lead.email ?? undefined,
    phone: lead.phone ?? undefined,
    course_id: lead.course_id ?? undefined,
    source: lead.source ?? undefined,
    status: lead.status,
    notes: lead.notes ?? undefined,
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (data: LeadUpdateRequest) => leadsApi.update(lead.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      onClose();
    },
    onError: (e: any) => setError(e?.response?.data?.detail ?? e?.response?.data?.message ?? "Erro ao atualizar lead."),
  });

  const handleSubmit = () => {
    if (!form.name?.trim()) return setError("O nome do lead é obrigatório.");
    if (!form.course_id) return setError("O curso/pacote é obrigatório.");
    if (!form.source) return setError("A origem é obrigatória.");
    setError("");
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/45 flex items-center justify-center z-[1000] p-4">
      <div className="card animate-fade-in w-full max-w-[480px] p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-semibold">Editar Lead</h2>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">{lead.name}</p>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--color-muted)] mb-4">
          Campos com <span className="text-red-500">*</span> são obrigatórios.
        </p>

        <LeadFormFields form={form} setForm={setForm} courses={courses} isEdit />

        {error && (
          <div className="bg-red-100 text-red-700 rounded-lg px-3 py-2.5 text-[13px] mt-3.5">
            {error}
          </div>
        )}

        {/* Action buttons — centralizados */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <button className="btn-secondary flex-1 justify-center" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary flex-1 justify-center"
            disabled={mutation.isPending}
            onClick={handleSubmit}
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {mutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Lead Detail Drawer ─────────────────────────────────────────────────────────
function LeadDrawer({ lead, courses, onClose }: { lead: Lead; courses: Course[]; onClose: () => void }) {
  const course = courses.find((c) => c.id === lead.course_id);
  const initials = lead.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 bg-slate-900/30 flex justify-end z-[1000]">
      <div className="animate-slide-in w-[360px] bg-[var(--color-surface)] h-full overflow-y-auto shadow-[var(--shadow-lg)]">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[var(--color-border)] flex justify-between items-center">
          <h2 className="text-base font-semibold">Detalhes do Lead</h2>
          <button className="btn-ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Avatar + Name */}
          <div className="text-center mb-6">
            <div className="w-[72px] h-[72px] rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center text-2xl font-bold mx-auto mb-3">
              {initials}
            </div>
            <h3 className="text-lg font-semibold">{lead.name}</h3>
            <span className={`badge badge-${lead.status} mt-1.5`}>
              {STATUS_LABELS[lead.status]}
            </span>
          </div>

          {/* Info Cards */}
          <div className="flex flex-col gap-3">
            {[
              { icon: Mail, label: lead.email ?? "—" },
              { icon: Phone, label: lead.phone ?? "—" },
              { icon: BookOpen, label: course?.name ?? "Sem curso" },
            ].map(({ icon: Icon, label }, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-2.5 bg-[var(--color-primary-light)] rounded-lg"
              >
                <Icon className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                <span className="text-[13px] text-[var(--color-text)]">{label}</span>
              </div>
            ))}

            {lead.source && (
              <div className="px-3 py-2.5 bg-[var(--color-primary-light)] rounded-lg">
                <p className="text-xs font-semibold text-[var(--color-muted)] mb-0.5">Origem</p>
                <p className="text-[13px] text-[var(--color-text)]">
                  {SOURCES.find((s) => s.value === lead.source)?.label ?? lead.source}
                </p>
              </div>
            )}

            {lead.notes && (
              <div className="p-3 bg-amber-50 rounded-lg border-l-[3px] border-amber-400">
                <p className="text-xs font-semibold text-amber-800 mb-1">Anotações</p>
                <p className="text-[13px] text-amber-900">{lead.notes}</p>
              </div>
            )}

            <div className="text-xs text-[var(--color-muted)] pt-2 border-t border-[var(--color-border)]">
              <p>Criado em: {new Date(lead.created_at).toLocaleDateString("pt-BR")}</p>
              <p>Atualizado: {new Date(lead.updated_at).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: () => leadsApi.list(),
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: coursesApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: leadsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? l.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.name]));

  return (
    <div className="px-8 pt-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">{leads.length} leads cadastrados</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" /> Novo Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-[1_1_240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
          <input
            className="input-base pl-9"
            placeholder="Pesquisar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-base w-auto min-w-[160px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="">Todos os status</option>
          {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="py-[60px] text-center text-[var(--color-muted)]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--color-primary)]" />
            <p className="text-[13px]">Carregando leads...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-[60px] text-center text-[var(--color-muted)]">
            <p className="text-[15px] mb-1">Nenhum lead encontrado</p>
            <p className="text-[13px]">Tente ajustar os filtros ou crie um novo lead.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[var(--color-border)]">
                  {["Lead", "E-mail", "Telefone", "Curso", "Status", "Data", "Ações"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-[11px] text-left text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-[0.06em] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => {
                  const initials = lead.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <tr
                      key={lead.id}
                      className="animate-fade-in border-b border-[var(--color-border)] transition-colors duration-100 hover:bg-[var(--color-primary-light)]"
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <span className="text-[13px] font-medium text-[var(--color-text)] whitespace-nowrap">
                            {lead.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[var(--color-muted)]">{lead.email ?? "—"}</td>
                      <td className="px-4 py-3 text-[13px] text-[var(--color-muted)]">{lead.phone ?? "—"}</td>
                      <td className="px-4 py-3 text-[13px] text-[var(--color-text)] whitespace-nowrap">
                        {courseMap[lead.course_id ?? ""] ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge badge-${lead.status}`}>{STATUS_LABELS[lead.status]}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-muted)] whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      {/* Botões de ação — centralizados */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button className="btn-ghost" title="Ver detalhes" onClick={() => setSelectedLead(lead)}>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="btn-ghost"
                            title="Editar lead"
                            onClick={() => setEditingLead(lead)}
                          >
                            <Pencil className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                          </button>
                          <button
                            className="btn-ghost"
                            title="Excluir"
                            onClick={() => {
                              if (confirm("Excluir este lead?")) deleteMutation.mutate(lead.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && <LeadCreateModal onClose={() => setShowCreateModal(false)} courses={courses} />}
      {editingLead && <LeadEditModal lead={editingLead} onClose={() => setEditingLead(null)} courses={courses} />}
      {selectedLead && <LeadDrawer lead={selectedLead} courses={courses} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}
