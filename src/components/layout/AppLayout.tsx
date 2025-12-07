import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Full-screen background image with parallax */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-100 will-change-transform"
        style={{ 
          backgroundImage: "url('/images/kerala-bg-3.jpg')",
          transform: `translateY(${scrollY * 0.3}px) scale(1.1)`,
        }}
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
