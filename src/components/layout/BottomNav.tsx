import { LayoutDashboard, Bot, ScanLine, CalendarCheck, Lightbulb, IndianRupee, ScrollText, GraduationCap, Wheat, CircleUser, SlidersHorizontal } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomNav() {
  const { t } = useLanguage();

  const navItems = [
    { icon: LayoutDashboard, labelKey: "home", path: "/", color: "text-emerald-500" },
    { icon: Bot, labelKey: "chat", path: "/chat", color: "text-violet-500" },
    { icon: ScanLine, labelKey: "scan", path: "/scanner", color: "text-cyan-500" },
    { icon: CalendarCheck, labelKey: "activities", path: "/activities", color: "text-orange-500" },
    { icon: Lightbulb, labelKey: "advisory", path: "/advisory", color: "text-amber-500" },
    { icon: IndianRupee, labelKey: "marketPrices", path: "/market", color: "text-green-600" },
    { icon: ScrollText, labelKey: "schemes", path: "/schemes", color: "text-blue-500" },
    { icon: GraduationCap, labelKey: "knowledge", path: "/knowledge", color: "text-purple-500" },
    { icon: Wheat, labelKey: "farm", path: "/farm", color: "text-yellow-600" },
    { icon: CircleUser, labelKey: "profile", path: "/profile", color: "text-pink-500" },
    { icon: SlidersHorizontal, labelKey: "settings", path: "/settings", color: "text-slate-500" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-xl border-t border-border/50 safe-bottom md:hidden shadow-lg">
      <div className="relative">
        <div className="flex items-center h-[72px] px-2 gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-all duration-300 px-2",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "relative p-1.5 rounded-xl transition-all duration-300",
                      isActive && "bg-primary/10 scale-110"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/20 rounded-xl animate-pulse-soft" />
                    )}
                    <item.icon 
                      className={cn(
                        "w-5 h-5 relative z-10 transition-transform duration-300",
                        isActive ? "text-primary" : item.color
                      )} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <span className={cn(
                    "text-[9px] font-medium font-malayalam transition-all duration-200 whitespace-nowrap",
                    isActive && "font-semibold"
                  )}>
                    {t(item.labelKey)}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
        {/* Gradient fade indicator on the right */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card/98 to-transparent pointer-events-none" />
      </div>
    </nav>
  );
}
