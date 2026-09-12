import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/features/auth/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CZZ CRM — Vendas de Cursos",
    template: "%s | CZZ CRM",
  },
  description: "CRM de Vendas de Cursos da Czz Tech. Gerencie leads, pipeline de vendas e cursos em um só lugar.",
  keywords: ["CRM", "vendas", "cursos", "leads", "pipeline", "czz tech"],
  robots: "noindex, nofollow", // remover em produção
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
