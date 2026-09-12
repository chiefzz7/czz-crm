"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Kanban, BookOpen,
  Settings, LogOut, ChevronLeft, ChevronRight, BookMarked
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads",     label: "Leads",     icon: Users },
  { href: "/kanban",    label: "Pipeline",  icon: Kanban },
  { href: "/courses",   label: "Cursos",    icon: BookOpen },
  { href: "/settings",  label: "Config.",   icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    const refreshToken = localStorage.getItem("czz_refresh_token");
    if (refreshToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(() => {});
    }
    localStorage.removeItem("czz_access_token");
    localStorage.removeItem("czz_refresh_token");
    router.push("/login");
  }

  return (
    <aside
      style={{
        width: collapsed ? 64 : 220,
        background: "var(--color-sidebar-bg)",
        color: "var(--color-sidebar-text)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        transition: "width 0.25s ease",
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ padding: collapsed ? "20px 0" : "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: 6, display: "flex", flexShrink: 0 }}>
          <BookMarked className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: "-0.01em" }}>CZZ CRM</span>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>Vendas de Cursos</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "10px 0" : "9px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                color: active ? "#fff" : "var(--color-sidebar-text)",
                background: active ? "rgba(255,255,255,0.15)" : "transparent",
                borderLeft: active && !collapsed ? "3px solid #93c5fd" : "3px solid transparent",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "var(--color-sidebar-hover)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 4 }}>
        <button
          onClick={handleLogout}
          title={collapsed ? "Sair" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "10px 0" : "9px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: 8,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            fontSize: 14,
            cursor: "pointer",
            width: "100%",
            transition: "background 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.2)"; (e.currentTarget as HTMLElement).style.color = "#fca5a5"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 8,
            borderRadius: 8,
            background: "rgba(255,255,255,0.08)",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
