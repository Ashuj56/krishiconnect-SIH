import { 
  Home, 
  MessageCircle, 
  Calendar, 
  Scan, 
  User, 
  TrendingUp, 
  BookOpen, 
  FileText,
  Settings,
  Sun,
  Store,
  Banknote
} from "lucide-react";
import krishiConnectLogo from "@/assets/krishi-connect-logo.jpg";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

import { Sprout } from "lucide-react";

const mainNavItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: MessageCircle, label: "AI Assistant", path: "/chat" },
  { icon: Scan, label: "Scanner", path: "/scanner" },
  { icon: Calendar, label: "Activities", path: "/activities" },
  { icon: Sprout, label: "Farm Profile", path: "/farm" },
];

const secondaryNavItems = [
  { icon: Sun, label: "Advisory", path: "/advisory" },
  { icon: TrendingUp, label: "Market Prices", path: "/market" },
  { icon: Store, label: "Agri Distributors", path: "/pesticides" },
  { icon: Banknote, label: "Microfinance", path: "/microfinance" },
  { icon: TrendingUp, label: "Smart Sale", path: "/smart-sale" },
  { icon: FileText, label: "Schemes", path: "/schemes" },
  { icon: BookOpen, label: "Knowledge Base", path: "/knowledge" },
];

const bottomNavItems = [
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
            <img 
              src={krishiConnectLogo} 
              alt="Krishi Connect Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-bold text-lg">Krishi Connect</h1>
            <p className="text-xs text-muted-foreground">AI Farming Assistant</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="pt-6 pb-2">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Resources
          </p>
        </div>

        <div className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-border space-y-1">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
