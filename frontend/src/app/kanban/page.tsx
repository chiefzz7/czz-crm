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
            background: "white",
            borderRadius: 10,
            padding: "12px 14px",
            boxShadow: snapshot.isDragging ? "var(--shadow-lg)" : "var(--shadow-sm)",
            border: "1px solid var(--color-border)",
            transition: "box-shadow 0.15s ease",
            cursor: "grab",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span {...provided.dragHandleProps} style={{ color: "var(--color-subtle)", marginTop: 2, flexShrink: 0 }}>
              <GripVertical className="w-3.5 h-3.5" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {initials}
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.name}</p>
              </div>

              {course && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                  <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color: "var(--color-muted)" }} />
                  <span style={{ fontSize: 12, color: "var(--color-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.name}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>
                  {course ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(course.price) : "—"}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--color-subtle)" }}>
                  <Clock className="w-3 h-3" />
                  <span style={{ fontSize: 11 }}>{daysAgo === 0 ? "hoje" : `${daysAgo}d`}</span>
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
    <div style={{ padding: "32px", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Pipeline de Vendas</h1>
          <p style={{ fontSize: 14, color: "var(--color-muted)", marginTop: 2 }}>Arraste os cards para mover leads entre etapas</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-muted)" }} />
            <input className="input-base pl-9" placeholder="Pesquisar lead..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
          </div>
          <a href="/leads" className="btn-primary"><Plus className="w-4 h-4" /> Novo Lead</a>
        </div>
      </div>

      {/* Board */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--color-muted)" }}>Carregando pipeline...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: "flex", gap: 12, flex: 1, overflowX: "auto", paddingBottom: 8 }}>
            {COLUMNS.map(status => {
              const colLeads = byStatus[status] ?? [];
              const total = colLeads.reduce((s, l) => {
                const c = courses.find(c => c.id === l.course_id);
                return s + (c?.price ?? 0);
              }, 0);
              return (
                <div key={status} style={{ minWidth: 220, maxWidth: 260, flex: "1 0 220px", display: "flex", flexDirection: "column" }}>
                  {/* Column Header */}
                  <div style={{ background: COL_BG[status], borderRadius: "10px 10px 0 0", padding: "10px 14px", border: `1px solid ${COL_COLORS[status]}22`, borderBottom: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: COL_COLORS[status] }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: COL_COLORS[status] }}>{STATUS_LABELS[status]}</span>
                      </div>
                      <span style={{ background: COL_COLORS[status], color: "white", borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 600 }}>
                        {colLeads.length}
                      </span>
                    </div>
                    {total > 0 && (
                      <p style={{ fontSize: 11, color: "var(--color-muted)" }}>
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
                        style={{
                          flex: 1,
                          background: snapshot.isDraggingOver ? COL_BG[status] : "#f8fafc",
                          border: `1px solid ${snapshot.isDraggingOver ? COL_COLORS[status] : "var(--color-border)"}`,
                          borderRadius: "0 0 10px 10px",
                          padding: "10px 8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          minHeight: 120,
                          transition: "background 0.15s ease, border-color 0.15s ease",
                          overflowY: "auto",
                          maxHeight: "calc(100vh - 240px)",
                        }}
                      >
                        {colLeads.map((lead, i) => (
                          <LeadCard key={lead.id} lead={lead} courses={courses} index={i} />
                        ))}
                        {provided.placeholder}
                        {colLeads.length === 0 && (
                          <p style={{ fontSize: 12, color: "var(--color-subtle)", textAlign: "center", padding: "20px 0" }}>Nenhum lead aqui</p>
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
