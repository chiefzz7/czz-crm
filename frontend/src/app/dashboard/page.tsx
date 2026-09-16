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
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[13px] text-[var(--color-muted)] font-medium">{title}</p>
          <p className="text-[26px] font-bold text-[var(--color-text)] mt-1 tracking-tight">{value}</p>
          <p
            className={`text-xs mt-1 flex items-center gap-0.5 ${
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-[var(--color-muted)]"
            }`}
          >
            {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
            {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
            {sub}
          </p>
        </div>
        <div className="rounded-[10px] p-2.5" style={{ background: color }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function RecentLeadRow({ lead }: { lead: Lead }) {
  const initials = lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <tr
      className="border-b border-[var(--color-border)] transition-colors duration-100 hover:bg-[var(--color-primary-light)]"
    >
      <td className="px-4 py-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center text-xs font-bold shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-[13px] font-medium text-[var(--color-text)]">{lead.name}</p>
          <p className="text-xs text-[var(--color-muted)]">{lead.email}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-[13px] text-[var(--color-muted)]">{lead.source ?? "—"}</td>
      <td className="px-4 py-3">
        <span className={`badge badge-${lead.status}`}>{STATUS_LABELS[lead.status]}</span>
      </td>
      <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
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
    <div className="px-8 pt-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">
            Visão geral das suas vendas de cursos
          </p>
        </div>
        <button className="btn-secondary" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {/* KPI Cards */}
      {metricsLoading ? (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 h-[110px]">
              <div className="animate-pulse-soft bg-[var(--color-border)] rounded-md h-3.5 w-3/5 mb-2" />
              <div className="animate-pulse-soft bg-[var(--color-border)] rounded-md h-7 w-2/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <MetricCard title="Total de Leads" value={String(metrics?.total_leads ?? 0)} sub={`+${metrics?.leads_this_month ?? 0} este mês`} icon={Users} trend="up" color="#2563eb" />
          <MetricCard title="Taxa de Conversão" value={`${metrics?.conversion_rate ?? 0}%`} sub="Leads matriculados" icon={TrendingUp} trend="up" color="#6366f1" />
          <MetricCard title="Receita Total" value={formatBRL(metrics?.total_revenue ?? 0)} sub={`${formatBRL(metrics?.revenue_this_month ?? 0)} este mês`} icon={DollarSign} trend="up" color="#10b981" />
          <MetricCard title="Negócios Ativos" value={String(metrics?.active_deals ?? 0)} sub="Em contato e proposta" icon={Briefcase} color="#f59e0b" />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-[2fr_1fr] gap-4 mb-6">
        {/* Area Chart */}
        <div className="card p-6">
          <h2 className="text-[15px] font-semibold text-[var(--color-text)] mb-5">Receita Mensal</h2>
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
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatBRL(Number(v))} contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13 }} />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#blueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-6">
          <h2 className="text-[15px] font-semibold text-[var(--color-text)] mb-5">Pipeline</h2>
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
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
          <h2 className="text-[15px] font-semibold text-[var(--color-text)]">Leads Recentes</h2>
          <a href="/leads" className="text-[13px] text-[var(--color-primary)] font-medium no-underline hover:underline">Ver todos →</a>
        </div>
        {leadsLoading ? (
          <div className="py-10 text-center text-[var(--color-muted)] text-[13px]">Carregando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  {["Lead", "Origem", "Status", "Data"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-[0.05em]">{h}</th>
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
