import { Home, MessageCircle, Calendar, Scan, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "ഹോം", labelEn: "Home", path: "/" },
  { icon: MessageCircle, label: "ചാറ്റ്", labelEn: "Chat", path: "/chat" },
  { icon: Scan, label: "സ്കാൻ", labelEn: "Scan", path: "/scanner" },
  { icon: Calendar, label: "ലോഗ്", labelEn: "Activity", path: "/activities" },
  { icon: User, label: "പ്രൊഫൈൽ", labelEn: "Profile", path: "/profile" },
];

export function BottomNav() {
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
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
