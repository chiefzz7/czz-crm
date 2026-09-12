import { Sidebar } from "@/components/ui/Sidebar";

export default function KanbanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>{children}</main>
    </div>
  );
}
