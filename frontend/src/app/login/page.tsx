"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { authApi } from "@/services/auth.api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@czztech.com");
  const [password, setPassword] = useState("admin123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem("czz_access_token", data.access_token);
      localStorage.setItem("czz_refresh_token", data.refresh_token);
      router.push("/dashboard");
    } catch {
      setError("E-mail ou senha inválidos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #e0e7ff 100%)" }}
    >
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "var(--color-primary)", boxShadow: "var(--shadow-blue)" }}
          >
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">CZZ CRM</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">Vendas de Cursos — Czz Tech</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-6 text-[var(--color-text)]">Entrar na sua conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--color-text)]">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                <input
                  type="email"
                  className="input-base pl-9"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--color-text)]">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                <input
                  type={showPass ? "text" : "password"}
                  className="input-base pl-9 pr-9"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass
                    ? <EyeOff className="w-4 h-4 text-[var(--color-muted)]" />
                    : <Eye className="w-4 h-4 text-[var(--color-muted)]" />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg p-3 text-sm bg-red-100 text-red-700">
                {error}
              </div>
            )}

            {/* Demo hint */}
            <div className="rounded-lg p-3 text-sm bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <strong>Demo:</strong> admin@czztech.com / admin123
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-[var(--color-muted)]">
          © {new Date().getFullYear()} Czz Tech. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}
