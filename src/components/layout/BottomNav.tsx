import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, Bot, ScanLine, CalendarCheck, Lightbulb, IndianRupee, ScrollText, GraduationCap, Wheat, CircleUser, SlidersHorizontal, TrendingUp } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const navItems = [
    { icon: LayoutDashboard, labelKey: "home", path: "/", color: "text-emerald-500" },
    { icon: Bot, labelKey: "chat", path: "/chat", color: "text-violet-500" },
    { icon: ScanLine, labelKey: "scan", path: "/scanner", color: "text-cyan-500" },
    { icon: CalendarCheck, labelKey: "activities", path: "/activities", color: "text-orange-500" },
    { icon: Lightbulb, labelKey: "advisory", path: "/advisory", color: "text-amber-500" },
    { icon: IndianRupee, labelKey: "marketPrices", path: "/market", color: "text-green-600" },
    { icon: TrendingUp, labelKey: "smartSale", path: "/smart-sale", color: "text-teal-500" },
    { icon: ScrollText, labelKey: "schemes", path: "/schemes", color: "text-blue-500" },
    { icon: GraduationCap, labelKey: "knowledge", path: "/knowledge", color: "text-purple-500" },
    { icon: Wheat, labelKey: "farm", path: "/farm", color: "text-yellow-600" },
    { icon: CircleUser, labelKey: "profile", path: "/profile", color: "text-pink-500" },
    { icon: SlidersHorizontal, labelKey: "settings", path: "/settings", color: "text-slate-500" },
  ];

  // Auto-scroll to active item
  useEffect(() => {
    const activeIndex = navItems.findIndex(item => item.path === location.pathname);
    if (activeIndex !== -1 && scrollRef.current) {
      const container = scrollRef.current;
      const items = container.children;
      if (items[activeIndex]) {
        const item = items[activeIndex] as HTMLElement;
        const containerWidth = container.offsetWidth;
        const itemLeft = item.offsetLeft;
        const itemWidth = item.offsetWidth;
        const scrollPosition = itemLeft - (containerWidth / 2) + (itemWidth / 2);
        
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }
    }
  }, [location.pathname]);

  // Handle scroll position for fade indicators
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftFade(scrollLeft > 10);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 safe-bottom md:hidden shadow-2xl">
      <div className="relative">
        {/* Left gradient fade */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card/95 to-transparent pointer-events-none z-10 transition-opacity duration-300",
          showLeftFade ? "opacity-100" : "opacity-0"
        )} />
        
        <div 
          ref={scrollRef}
          className="flex items-center h-[68px] px-2 gap-0.5 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 min-w-[58px] h-full transition-all duration-300 px-1.5",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center animate-fade-in">
                  <div
                    className={cn(
                      "relative p-1.5 rounded-xl transition-all duration-300",
                      isActive && "bg-primary/15 scale-110 shadow-sm"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/20 rounded-xl animate-pulse-soft" />
                    )}
                    <item.icon 
                      className={cn(
                        "w-5 h-5 relative z-10 transition-all duration-300",
                        isActive ? "text-primary scale-110" : item.color
                      )} 
                      strokeWidth={isActive ? 2.5 : 1.8}
                    />
                  </div>
                  <span className={cn(
                    "text-[9px] font-medium font-malayalam transition-all duration-200 whitespace-nowrap",
                    isActive && "font-semibold text-primary"
                  )}>
                    {t(item.labelKey)}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
        
        {/* Right gradient fade */}
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card/95 to-transparent pointer-events-none z-10 transition-opacity duration-300",
          showRightFade ? "opacity-100" : "opacity-0"
        )} />
      </div>
    </nav>
  );
}
