import { Sidebar } from "@/components/ui/Sidebar";

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>{children}</main>
    </div>
  );
}
