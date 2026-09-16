"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { leadsApi } from "@/services/leads.api";
import { coursesApi } from "@/services/courses.api";
import { STATUS_LABELS, STATUS_DOT, type Lead, type LeadStatus, type Course } from "@/types";
import { Plus, Clock, BookOpen, GripVertical, Search } from "lucide-react";

const COLUMNS: LeadStatus[] = ["novo", "contatado", "proposta", "matriculado", "perdido"];
const COL_COLORS: Record<LeadStatus, string> = {
  novo: "#2563eb",
  contatado: "#6366f1",
  proposta: "#f59e0b",
  matriculado: "#10b981",
  perdido: "#ef4444",
};
const COL_BG: Record<LeadStatus, string> = {
  novo: "#eff6ff",
  contatado: "#eef2ff",
  proposta: "#fffbeb",
  matriculado: "#f0fdf4",
  perdido: "#fef2f2",
};

function LeadCard({ lead, courses, index }: { lead: Lead; courses: Course[]; index: number }) {
  const course = courses.find(c => c.id === lead.course_id);
  const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const daysAgo = Math.floor((Date.now() - new Date(lead.updated_at).getTime()) / 86400000);

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            boxShadow: snapshot.isDragging ? "var(--shadow-lg)" : "var(--shadow-sm)",
          }}
          className="bg-white rounded-[10px] px-3.5 py-3 border border-[var(--color-border)] transition-shadow duration-150 cursor-grab"
        >
          <div className="flex items-start gap-2">
            <span
              {...provided.dragHandleProps}
              className="text-[var(--color-subtle)] mt-0.5 shrink-0"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center text-[11px] font-bold shrink-0">
                  {initials}
                </div>
                <p className="text-[13px] font-semibold text-[var(--color-text)] truncate">{lead.name}</p>
              </div>

              {course && (
                <div className="flex items-center gap-1 mb-1.5">
                  <BookOpen className="w-3 h-3 shrink-0 text-[var(--color-muted)]" />
                  <span className="text-xs text-[var(--color-muted)] truncate">{course.name}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-[var(--color-primary)]">
                  {course ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(course.price) : "—"}
                </span>
                <div className="flex items-center gap-1 text-[var(--color-subtle)]">
                  <Clock className="w-3 h-3" />
                  <span className="text-[11px]">{daysAgo === 0 ? "hoje" : `${daysAgo}d`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function KanbanPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: () => leadsApi.list(),
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: coursesApi.list,
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => leadsApi.move(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const byStatus = COLUMNS.reduce((acc, status) => {
    acc[status] = filtered.filter(l => l.status === status);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const leadId = result.draggableId;
    const newStatus = result.destination.droppableId as LeadStatus;
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.status === newStatus) return;
    moveMutation.mutate({ id: leadId, status: newStatus });
  }

  return (
    <div className="p-8 h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-bold">Pipeline de Vendas</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">Arraste os cards para mover leads entre etapas</p>
        </div>
        <div className="flex gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
            <input
              className="input-base pl-9 w-[220px]"
              placeholder="Pesquisar lead..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <a href="/leads" className="btn-primary"><Plus className="w-4 h-4" /> Novo Lead</a>
        </div>
      </div>

      {/* Board */}
      {isLoading ? (
        <div className="text-center py-[60px] text-[var(--color-muted)]">Carregando pipeline...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-3 flex-1 overflow-x-auto pb-2">
            {COLUMNS.map(status => {
              const colLeads = byStatus[status] ?? [];
              const total = colLeads.reduce((s, l) => {
                const c = courses.find(c => c.id === l.course_id);
                return s + (c?.price ?? 0);
              }, 0);
              return (
                <div
                  key={status}
                  className="min-w-[220px] max-w-[260px] flex-[1_0_220px] flex flex-col"
                >
                  {/* Column Header */}
                  <div
                    className="rounded-t-[10px] px-3.5 py-2.5 border-b-0"
                    style={{
                      background: COL_BG[status],
                      border: `1px solid ${COL_COLORS[status]}22`,
                      borderBottom: "none",
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: COL_COLORS[status] }}
                        />
                        <span
                          className="text-[13px] font-semibold"
                          style={{ color: COL_COLORS[status] }}
                        >
                          {STATUS_LABELS[status]}
                        </span>
                      </div>
                      <span
                        className="text-white text-[11px] font-semibold rounded-full px-2 py-px"
                        style={{ background: COL_COLORS[status] }}
                      >
                        {colLeads.length}
                      </span>
                    </div>
                    {total > 0 && (
                      <p className="text-[11px] text-[var(--color-muted)]">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}
                      </p>
                    )}
                  </div>

                  {/* Droppable */}
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 rounded-b-[10px] p-2 flex flex-col gap-2 min-h-[120px] overflow-y-auto transition-colors duration-150"
                        style={{
                          background: snapshot.isDraggingOver ? COL_BG[status] : "#f8fafc",
                          border: `1px solid ${snapshot.isDraggingOver ? COL_COLORS[status] : "var(--color-border)"}`,
                          borderTop: "none",
                          maxHeight: "calc(100vh - 240px)",
                        }}
                      >
                        {colLeads.map((lead, i) => (
                          <LeadCard key={lead.id} lead={lead} courses={courses} index={i} />
                        ))}
                        {provided.placeholder}
                        {colLeads.length === 0 && (
                          <p className="text-xs text-[var(--color-subtle)] text-center py-5">Nenhum lead aqui</p>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
