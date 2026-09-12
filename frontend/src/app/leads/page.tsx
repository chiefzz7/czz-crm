"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/services/leads.api";
import { coursesApi } from "@/services/courses.api";
import { STATUS_LABELS, STATUS_COLORS, type Lead, type Course, type LeadStatus, type LeadCreateRequest } from "@/types";
import { Plus, Search, Eye, Pencil, Trash2, X, Loader2, ChevronDown, Phone, Mail, BookOpen } from "lucide-react";
import type { Metadata } from "next";

// ── Lead Form Modal ───────────────────────────────────────────────────────────
function LeadModal({ onClose, courses }: { onClose: () => void; courses: Course[] }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<LeadCreateRequest>({ name: "", email: "", phone: "", notes: "", source: undefined, course_id: undefined });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leads"] }); onClose(); },
    onError: (e: any) => setError(e?.response?.data?.message ?? "Erro ao criar lead."),
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: 480, padding: 28, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Novo Lead</h2>
          <button className="btn-ghost" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Nome completo *", key: "name", type: "text", placeholder: "Ex: João Silva" },
            { label: "E-mail *", key: "email", type: "email", placeholder: "joao@email.com" },
            { label: "Telefone", key: "phone", type: "tel", placeholder: "(11) 99999-9999" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)", display: "block", marginBottom: 6 }}>{label}</label>
              <input type={type} className="input-base" placeholder={placeholder}
                value={(form as any)[key] ?? ""}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)", display: "block", marginBottom: 6 }}>Curso de Interesse</label>
            <select className="input-base" value={form.course_id ?? ""} onChange={e => setForm(f => ({ ...f, course_id: e.target.value || undefined }))}>
              <option value="">Selecione um curso</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)", display: "block", marginBottom: 6 }}>Origem</label>
            <select className="input-base" value={form.source ?? ""} onChange={e => setForm(f => ({ ...f, source: e.target.value as any || undefined }))}>
              <option value="">Selecione a origem</option>
              {["ads", "organic", "referral", "webinar", "indicacao", "outro"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)", display: "block", marginBottom: 6 }}>Observações</label>
            <textarea className="input-base" rows={3} placeholder="Anotações sobre o lead..."
              value={form.notes ?? ""}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ resize: "vertical" }}
            />
          </div>

          {error && <div style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: 8, padding: "10px 12px", fontSize: 13 }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
            <button className="btn-primary flex-1 justify-center" disabled={mutation.isPending}
              onClick={() => mutation.mutate(form)}>
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {mutation.isPending ? "Salvando..." : "Criar Lead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Lead Detail Drawer ────────────────────────────────────────────────────────
function LeadDrawer({ lead, courses, onClose }: { lead: Lead; courses: Course[]; onClose: () => void }) {
  const course = courses.find(c => c.id === lead.course_id);
  const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", display: "flex", justifyContent: "flex-end", zIndex: 1000 }}>
      <div className="animate-slide-in" style={{ width: 360, background: "var(--color-surface)", height: "100%", overflowY: "auto", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ padding: 24, borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Detalhes do Lead</h2>
          <button className="btn-ghost" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, margin: "0 auto 12px" }}>
              {initials}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>{lead.name}</h3>
            <span className={`badge badge-${lead.status}`} style={{ marginTop: 6 }}>{STATUS_LABELS[lead.status]}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: Mail, label: lead.email },
              { icon: Phone, label: lead.phone ?? "—" },
              { icon: BookOpen, label: course?.name ?? "Sem curso" },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--color-primary-light)", borderRadius: 8 }}>
                <Icon className="w-4 h-4" style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "var(--color-text)" }}>{label}</span>
              </div>
            ))}

            {lead.notes && (
              <div style={{ padding: "12px", background: "#fffbeb", borderRadius: 8, borderLeft: "3px solid #f59e0b" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#92400e", marginBottom: 4 }}>Anotações</p>
                <p style={{ fontSize: 13, color: "#78350f" }}>{lead.notes}</p>
              </div>
            )}

            <div style={{ fontSize: 12, color: "var(--color-muted)", paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
              <p>Criado em: {new Date(lead.created_at).toLocaleDateString("pt-BR")}</p>
              <p>Atualizado: {new Date(lead.updated_at).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [showModal, setShowModal] = useState(false);
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

  const filtered = leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? l.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const courseMap = Object.fromEntries(courses.map(c => [c.id, c.name]));

  return (
    <div style={{ padding: "32px 32px 48px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Leads</h1>
          <p style={{ fontSize: 14, color: "var(--color-muted)", marginTop: 2 }}>{leads.length} leads cadastrados</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Novo Lead
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-muted)" }} />
          <input className="input-base" style={{ paddingLeft: "2.25rem" }} placeholder="Pesquisar por nome ou e-mail..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-base" style={{ width: "auto", minWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
          <option value="">Todos os status</option>
          {(Object.keys(STATUS_LABELS) as LeadStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--color-muted)" }}>
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: "var(--color-primary)" }} />
            <p style={{ fontSize: 13 }}>Carregando leads...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--color-muted)" }}>
            <p style={{ fontSize: 15, marginBottom: 4 }}>Nenhum lead encontrado</p>
            <p style={{ fontSize: 13 }}>Tente ajustar os filtros ou crie um novo lead.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--color-border)" }}>
                  {["Lead", "E-mail", "Telefone", "Curso", "Status", "Data", "Ações"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => {
                  const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <tr key={lead.id} className="animate-fade-in"
                      style={{ borderBottom: "1px solid var(--color-border)", animationDelay: `${i * 0.03}s`, transition: "background 0.1s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--color-primary-light)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {initials}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)", whiteSpace: "nowrap" }}>{lead.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-muted)" }}>{lead.email}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-muted)" }}>{lead.phone ?? "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-text)", whiteSpace: "nowrap" }}>{courseMap[lead.course_id ?? ""] ?? "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className={`badge badge-${lead.status}`}>{STATUS_LABELS[lead.status]}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="btn-ghost" title="Ver detalhes" onClick={() => setSelectedLead(lead)}><Eye className="w-3.5 h-3.5" /></button>
                          <button className="btn-ghost" title="Excluir" onClick={() => { if (confirm("Excluir este lead?")) deleteMutation.mutate(lead.id); }}>
                            <Trash2 className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
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

      {showModal && <LeadModal onClose={() => setShowModal(false)} courses={courses} />}
      {selectedLead && <LeadDrawer lead={selectedLead} courses={courses} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}
