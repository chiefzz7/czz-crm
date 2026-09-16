import { Sidebar } from "@/components/ui/Sidebar";

export default function KanbanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden min-w-0">{children}</main>
    </div>
  );
}
