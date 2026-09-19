import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[#f4faf5] dark:bg-[#06100b]">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1 p-4 lg:p-6">
          <Topbar title={title} subtitle={subtitle} />
          <main className="mt-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
