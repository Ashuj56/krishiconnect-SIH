import { Home, MessageCircle, Calendar, Scan } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { MobileMenu } from "./MobileMenu";

export function BottomNav() {
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, labelKey: "home", path: "/" },
    { icon: MessageCircle, labelKey: "chat", path: "/chat" },
    { icon: Scan, labelKey: "scan", path: "/scanner" },
    { icon: Calendar, labelKey: "activities", path: "/activities" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-xl border-t border-border/50 safe-bottom md:hidden shadow-lg">
      <div className="flex items-center justify-around h-[72px] px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-300",
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
                    "relative p-2 rounded-xl transition-all duration-300",
                    isActive && "bg-primary/10 scale-110"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/20 rounded-xl animate-pulse-soft" />
                  )}
                  <item.icon 
                    className={cn(
                      "w-6 h-6 relative z-10 transition-transform duration-300",
                      isActive && "animate-bounce-subtle"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-medium font-malayalam transition-all duration-200",
                  isActive && "font-semibold"
                )}>
                  {t(item.labelKey)}
                </span>
              </>
            )}
          </NavLink>
        ))}
        
        {/* Menu button for resources */}
        <MobileMenu />
      </div>
    </nav>
  );
}
