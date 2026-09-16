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
      className="flex flex-col h-screen sticky top-0 shrink-0 z-50 transition-[width] duration-[250ms] ease-in-out bg-[var(--color-sidebar-bg)] text-[var(--color-sidebar-text)]"
      style={{ width: collapsed ? 64 : 220 }}
    >
      {/* Logo */}
      <div
        className={`border-b border-white/10 flex items-center gap-2.5 ${
          collapsed ? "justify-center px-0 py-5" : "justify-start px-4 py-5"
        }`}
      >
        <div className="bg-white/15 rounded-[10px] p-1.5 flex shrink-0">
          <BookMarked className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-base text-white tracking-tight">CZZ CRM</span>
            <p className="text-[10px] text-white/50 mt-px">Vendas de Cursos</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-2.5 rounded-lg no-underline text-sm transition-colors duration-150
                ${collapsed ? "justify-center px-0 py-2.5" : "justify-start px-3 py-[9px]"}
                ${active
                  ? "font-semibold text-white bg-white/15 border-l-[3px] border-blue-300"
                  : "font-normal text-[var(--color-sidebar-text)] bg-transparent border-l-[3px] border-transparent hover:bg-[var(--color-sidebar-hover)]"
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/10 flex flex-col gap-1">
        <button
          onClick={handleLogout}
          title={collapsed ? "Sair" : undefined}
          className={`flex items-center gap-2.5 rounded-lg bg-transparent border-none text-sm text-white/60 cursor-pointer w-full transition-colors duration-150
            hover:bg-red-500/20 hover:text-red-300
            ${collapsed ? "justify-center px-0 py-2.5" : "justify-start px-3 py-[9px]"}
          `}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center p-2 rounded-lg bg-white/[0.08] border-none text-white/50 cursor-pointer transition-colors duration-150 hover:bg-white/15"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
