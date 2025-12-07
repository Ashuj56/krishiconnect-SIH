import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="min-h-screen relative">
      {/* Full-screen background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/kerala-bg-3.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/85 via-background/90 to-background/95" />
      
      <Sidebar />
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen relative z-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
