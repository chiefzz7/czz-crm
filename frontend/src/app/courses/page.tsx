"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/services/courses.api";
import type { Course, CourseCategory, CourseCreateRequest } from "@/types";
import { Plus, Clock, DollarSign, ToggleLeft, ToggleRight, Trash2, X, Loader2 } from "lucide-react";

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
    <div className="fixed inset-0 bg-slate-900/45 flex items-center justify-center z-[1000] p-4">
      <div className="card animate-fade-in w-full max-w-[480px] p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">Novo Curso</h2>
          <button className="btn-ghost" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>

        <div className="flex flex-col gap-3.5">
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">Nome do Curso *</label>
            <input className="input-base" placeholder="Ex: Marketing Digital Completo"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">Descrição</label>
            <textarea className="input-base resize-y" rows={3} placeholder="Descreva o conteúdo do curso..."
              value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">Categoria *</label>
              <select className="input-base" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as CourseCategory }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">Carga Horária *</label>
              <input type="number" className="input-base" placeholder="Ex: 40" min={1}
                value={form.duration_hours || ""} onChange={e => setForm(f => ({ ...f, duration_hours: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">Preço (R$) *</label>
            <input type="number" className="input-base" placeholder="Ex: 997" min={0} step={0.01}
              value={form.price || ""} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}>
              {form.is_active
                ? <ToggleRight className="w-6 h-6 text-[var(--color-primary)]" />
                : <ToggleLeft className="w-6 h-6 text-[var(--color-muted)]" />
              }
            </button>
            <span className="text-[13px] text-[var(--color-text)]">
              Curso {form.is_active ? "ativo" : "inativo"}
            </span>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg px-3 py-2.5 text-[13px]">{error}</div>
          )}

          {/* Action buttons — centralizados */}
          <div className="flex items-center justify-center gap-2">
            <button className="btn-secondary flex-1 justify-center" onClick={onClose}>Cancelar</button>
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
    <div className="card p-5 animate-fade-in flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="w-2 h-2 rounded-full shrink-0 inline-block"
              style={{ background: color }}
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.05em]"
              style={{ color }}
            >
              {course.category}
            </span>
          </div>
          <h3 className="text-[15px] font-semibold text-[var(--color-text)] line-clamp-2">
            {course.name}
          </h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ml-2 shrink-0 ${
            course.is_active
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {course.is_active ? "Ativo" : "Inativo"}
        </span>
      </div>

      {course.description && (
        <p className="text-[13px] text-[var(--color-muted)] line-clamp-2">
          {course.description}
        </p>
      )}

      <div className="flex gap-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[var(--color-muted)]" />
          <span className="text-xs text-[var(--color-muted)]">{course.duration_hours}h</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-[var(--color-primary)]" />
          <span className="text-[13px] font-bold text-[var(--color-primary)]">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(course.price)}
          </span>
        </div>
      </div>

      <button
        className="btn-ghost self-end text-red-500"
        onClick={() => { if (confirm("Excluir este curso?")) onDelete(); }}
      >
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
    <div className="px-8 pt-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cursos</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">
            {courses.length} cursos · {active} ativos
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Novo Curso
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          className={catFilter === "" ? "btn-primary" : "btn-secondary"}
          onClick={() => setCatFilter("")}
          style={{ fontSize: 12, padding: "6px 14px" }}
        >
          Todos ({courses.length})
        </button>
        {CATEGORIES.filter(cat => courses.some(c => c.category === cat)).map(cat => (
          <button
            key={cat}
            className={catFilter === cat ? "btn-primary" : "btn-secondary"}
            onClick={() => setCatFilter(cat)}
            style={{ fontSize: 12, padding: "6px 14px" }}
          >
            {cat} ({courses.filter(c => c.category === cat).length})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-[60px] text-[var(--color-muted)]">Carregando cursos...</div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {filtered.map(course => (
            <CourseCard key={course.id} course={course} onDelete={() => deleteMutation.mutate(course.id)} />
          ))}
        </div>
      )}

      {showModal && <CourseModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
