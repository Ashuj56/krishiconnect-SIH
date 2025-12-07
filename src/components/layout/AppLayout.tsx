import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate blur based on scroll (max 8px blur at 500px scroll)
  const blurAmount = Math.min(scrollY / 60, 8);
  
  // Hide FAB on chat page
  const showFab = location.pathname !== '/chat';

  return (
    <div className="min-h-screen relative">
      {/* Full-screen background image with parallax */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{ 
          backgroundImage: "url('/images/kerala-bg-3.jpg')",
          transform: `translateY(${scrollY * 0.3}px) scale(1.15)`,
          filter: `blur(${blurAmount}px)`,
          transition: 'filter 0.1s ease-out',
        }}
      />
      {/* Gradient overlay - reduced opacity to show background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background/90" />
      
      <Sidebar />
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen relative z-10">
        <Outlet />
      </main>
      <BottomNav />

      {/* Floating Action Button for AI Chat */}
      {showFab && (
        <button
          onClick={() => navigate('/chat')}
          className={cn(
            "fixed z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center",
            "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
            "hover:scale-110 hover:shadow-primary/40 hover:shadow-xl",
            "active:scale-95 transition-all duration-300",
            "bottom-24 right-4 md:bottom-6 md:right-6",
            "animate-fade-in"
          )}
          aria-label="Open AI Chat"
        >
          <Bot className="w-6 h-6" />
          {/* Pulse ring animation */}
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        </button>
      )}
    </div>
  );
}
