"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/services/courses.api";
import type { Course, CourseCategory, CourseCreateRequest } from "@/types";
import { Plus, BookOpen, Clock, DollarSign, Tag, ToggleLeft, ToggleRight, Trash2, X, Loader2 } from "lucide-react";

const CATEGORIES: CourseCategory[] = ["Marketing", "Tecnologia", "Vendas", "Design", "Gestão", "Finanças", "Saúde", "Outros"];
const CAT_COLORS: Record<string, string> = {
  Marketing: "#f59e0b", Tecnologia: "#3b82f6", Vendas: "#10b981",
  Design: "#8b5cf6", Gestão: "#6366f1", Finanças: "#0ea5e9",
  Saúde: "#ec4899", Outros: "#94a3b8",
};

function CourseModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<CourseCreateRequest>({
    name: "", description: "", category: "Marketing", price: 0, duration_hours: 0, is_active: true
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["courses"] }); onClose(); },
    onError: (e: any) => setError(e?.response?.data?.message ?? "Erro ao criar curso."),
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: 480, padding: 28, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Novo Curso</h2>
          <button className="btn-ghost" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Nome do Curso *</label>
            <input className="input-base" placeholder="Ex: Marketing Digital Completo"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Descrição</label>
            <textarea className="input-base" rows={3} placeholder="Descreva o conteúdo do curso..."
              value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Categoria *</label>
              <select className="input-base" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as CourseCategory }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Carga Horária *</label>
              <input type="number" className="input-base" placeholder="Ex: 40" min={1}
                value={form.duration_hours || ""} onChange={e => setForm(f => ({ ...f, duration_hours: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Preço (R$) *</label>
            <input type="number" className="input-base" placeholder="Ex: 997" min={0} step={0.01}
              value={form.price || ""} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}>
              {form.is_active
                ? <ToggleRight className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
                : <ToggleLeft className="w-6 h-6" style={{ color: "var(--color-muted)" }} />
              }
            </button>
            <span style={{ fontSize: 13, color: "var(--color-text)" }}>
              Curso {form.is_active ? "ativo" : "inativo"}
            </span>
          </div>

          {error && <div style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: 8, padding: "10px 12px", fontSize: 13 }}>{error}</div>}

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
            <button className="btn-primary flex-1 justify-center" disabled={mutation.isPending} onClick={() => mutation.mutate(form)}>
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {mutation.isPending ? "Salvando..." : "Criar Curso"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, onDelete }: { course: Course; onDelete: () => void }) {
  const color = CAT_COLORS[course.category] ?? "#94a3b8";
  return (
    <div className="card p-5 animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{course.category}</span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {course.name}
          </h3>
        </div>
        <span style={{ padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: course.is_active ? "#d1fae5" : "#f1f5f9", color: course.is_active ? "#065f46" : "#94a3b8", marginLeft: 8, flexShrink: 0 }}>
          {course.is_active ? "Ativo" : "Inativo"}
        </span>
      </div>

      {course.description && (
        <p style={{ fontSize: 13, color: "var(--color-muted)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {course.description}
        </p>
      )}

      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Clock className="w-3.5 h-3.5" style={{ color: "var(--color-muted)" }} />
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{course.duration_hours}h</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <DollarSign className="w-3.5 h-3.5" style={{ color: "var(--color-primary)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(course.price)}
          </span>
        </div>
      </div>

      <button className="btn-ghost" style={{ alignSelf: "flex-end", color: "#ef4444" }}
        onClick={() => { if (confirm("Excluir este curso?")) onDelete(); }}>
        <Trash2 className="w-3.5 h-3.5" /> Excluir
      </button>
    </div>
  );
}

export default function CoursesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [catFilter, setCatFilter] = useState<string>("");

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: coursesApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: coursesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });

  const filtered = catFilter ? courses.filter(c => c.category === catFilter) : courses;
  const active = courses.filter(c => c.is_active).length;

  return (
    <div style={{ padding: "32px 32px 48px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Cursos</h1>
          <p style={{ fontSize: 14, color: "var(--color-muted)", marginTop: 2 }}>
            {courses.length} cursos · {active} ativos
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Novo Curso
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <button className={catFilter === "" ? "btn-primary" : "btn-secondary"} onClick={() => setCatFilter("")} style={{ fontSize: 12, padding: "6px 14px" }}>
          Todos ({courses.length})
        </button>
        {CATEGORIES.filter(cat => courses.some(c => c.category === cat)).map(cat => (
          <button key={cat} className={catFilter === cat ? "btn-primary" : "btn-secondary"} onClick={() => setCatFilter(cat)} style={{ fontSize: 12, padding: "6px 14px" }}>
            {cat} ({courses.filter(c => c.category === cat).length})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--color-muted)" }}>Carregando cursos...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(course => (
            <CourseCard key={course.id} course={course} onDelete={() => deleteMutation.mutate(course.id)} />
          ))}
        </div>
      )}

      {showModal && <CourseModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
