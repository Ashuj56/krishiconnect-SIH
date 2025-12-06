import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="min-h-screen kerala-farm-bg">
      <Sidebar />
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen relative z-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
