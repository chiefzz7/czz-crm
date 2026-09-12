"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services/courses.api";
import { leadsApi } from "@/services/leads.api";
import {
  Users, TrendingUp, DollarSign, Briefcase,
  ArrowUpRight, ArrowDownRight, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import type { DashboardMetrics, Lead } from "@/types";
import { STATUS_LABELS } from "@/types";

const PIE_COLORS = ["#3b82f6", "#6366f1", "#f59e0b", "#10b981", "#ef4444"];

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function MetricCard({ title, value, sub, icon: Icon, trend, color }: {
  title: string; value: string; sub: string; icon: React.ElementType;
  trend?: "up" | "down"; color: string;
}) {
  return (
    <div className="card p-5 animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 500 }}>{title}</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: "var(--color-text)", marginTop: 4, letterSpacing: "-0.02em" }}>{value}</p>
          <p style={{ fontSize: 12, color: trend === "up" ? "#16a34a" : trend === "down" ? "#dc2626" : "var(--color-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 2 }}>
            {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
            {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
            {sub}
          </p>
        </div>
        <div style={{ background: color, borderRadius: 10, padding: 10 }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function RecentLeadRow({ lead }: { lead: Lead }) {
  const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <tr style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.1s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--color-primary-light)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}>{lead.name}</p>
          <p style={{ fontSize: 12, color: "var(--color-muted)" }}>{lead.email}</p>
        </div>
      </td>
      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-muted)" }}>{lead.source ?? "—"}</td>
      <td style={{ padding: "12px 16px" }}>
        <span className={`badge badge-${lead.status}`}>{STATUS_LABELS[lead.status]}</span>
      </td>
      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--color-muted)" }}>
        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading, refetch } = useQuery<DashboardMetrics>({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.getMetrics,
  });

  const { data: leads, isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: () => leadsApi.list(),
  });

  const recentLeads = leads?.slice(0, 5) ?? [];
  const pieData = metrics?.pipeline_stages.map(s => ({
    name: STATUS_LABELS[s.status],
    value: s.count,
  })) ?? [];

  return (
    <div style={{ padding: "32px 32px 48px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--color-text)" }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: "var(--color-muted)", marginTop: 2 }}>
            Visão geral das suas vendas de cursos
          </p>
        </div>
        <button className="btn-secondary" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {/* KPI Cards */}
      {metricsLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5" style={{ height: 110 }}>
              <div className="animate-pulse-soft" style={{ background: "var(--color-border)", borderRadius: 6, height: 14, width: "60%", marginBottom: 8 }} />
              <div className="animate-pulse-soft" style={{ background: "var(--color-border)", borderRadius: 6, height: 28, width: "40%" }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          <MetricCard title="Total de Leads" value={String(metrics?.total_leads ?? 0)} sub={`+${metrics?.leads_this_month ?? 0} este mês`} icon={Users} trend="up" color="#2563eb" />
          <MetricCard title="Taxa de Conversão" value={`${metrics?.conversion_rate ?? 0}%`} sub="Leads matriculados" icon={TrendingUp} trend="up" color="#6366f1" />
          <MetricCard title="Receita Total" value={formatBRL(metrics?.total_revenue ?? 0)} sub={`${formatBRL(metrics?.revenue_this_month ?? 0)} este mês`} icon={DollarSign} trend="up" color="#10b981" />
          <MetricCard title="Negócios Ativos" value={String(metrics?.active_deals ?? 0)} sub="Em contato e proposta" icon={Briefcase} color="#f59e0b" />
        </div>
      )}

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Area Chart */}
        <div className="card p-6">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)", marginBottom: 20 }}>Receita Mensal</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics?.monthly_revenue ?? []}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13 }} />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#blueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-6">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)", marginBottom: 20 }}>Pipeline</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>Leads Recentes</h2>
          <a href="/leads" style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 500, textDecoration: "none" }}>Ver todos →</a>
        </div>
        {leadsLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-muted)", fontSize: 13 }}>Carregando...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Lead", "Origem", "Status", "Data"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLeads.map(lead => <RecentLeadRow key={lead.id} lead={lead} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
