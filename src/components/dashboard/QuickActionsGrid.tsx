import { useNavigate } from "react-router-dom";
import { Mic, FlaskConical, MessageCircle, Store, TrendingUp, Leaf, FileText, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

const quickActions = [
  { 
    icon: Mic, 
    label: "വോയ്സ്", 
    labelEn: "Voice", 
    path: "/chat", 
    gradient: "from-primary to-emerald-600",
    bgColor: "bg-primary/10"
  },
  { 
    icon: FlaskConical, 
    label: "മണ്ണ്", 
    labelEn: "Soil", 
    path: "/soil-analysis", 
    gradient: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10"
  },
  { 
    icon: MessageCircle, 
    label: "ചാറ്റ്", 
    labelEn: "Chat", 
    path: "/chat", 
    gradient: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10"
  },
  { 
    icon: TrendingUp, 
    label: "വില", 
    labelEn: "Market", 
    path: "/market", 
    gradient: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-500/10"
  },
  { 
    icon: Store, 
    label: "വിൽപ്പന", 
    labelEn: "Smart Sale", 
    path: "/smart-sale", 
    gradient: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-500/10"
  },
  { 
    icon: Leaf, 
    label: "ഉപദേശം", 
    labelEn: "Advisory", 
    path: "/advisory", 
    gradient: "from-lime-500 to-green-500",
    bgColor: "bg-lime-500/10"
  },
  { 
    icon: FileText, 
    label: "പദ്ധതികൾ", 
    labelEn: "Schemes", 
    path: "/schemes", 
    gradient: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-500/10"
  },
  { 
    icon: Banknote, 
    label: "വായ്പ", 
    labelEn: "Finance", 
    path: "/microfinance", 
    gradient: "from-sky-500 to-blue-500",
    bgColor: "bg-sky-500/10"
  },
];

export function QuickActionsGrid() {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <span className="text-xs text-muted-foreground font-malayalam">ദ്രുത പ്രവർത്തനങ്ങൾ</span>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <button
            key={action.labelEn}
            onClick={() => navigate(action.path)}
            className={cn(
              "group flex flex-col items-center gap-2 p-3 rounded-2xl",
              "bg-card shadow-sm border border-border/40",
              "transition-all duration-300",
              "hover:shadow-lg hover:scale-105 hover:border-primary/30",
              "active:scale-95"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br shadow-sm",
              "transition-transform duration-300 group-hover:scale-110",
              action.gradient
            )}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-medium text-foreground block">
                {action.labelEn}
              </span>
              <span className="text-[9px] text-muted-foreground font-malayalam">
                {action.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
