import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Droplets, Sun, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  labelMl: string;
  value: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

const stats: StatItem[] = [
  {
    label: "Crops",
    labelMl: "വിളകൾ",
    value: "4",
    icon: Leaf,
    color: "text-primary bg-primary/10",
    trend: "+1"
  },
  {
    label: "Tasks",
    labelMl: "ടാസ്ക്കുകൾ",
    value: "7",
    icon: Sun,
    color: "text-amber-500 bg-amber-500/10",
    trend: "2 due"
  },
  {
    label: "Alerts",
    labelMl: "അലർട്ടുകൾ",
    value: "3",
    icon: Droplets,
    color: "text-sky-500 bg-sky-500/10"
  },
  {
    label: "Yield",
    labelMl: "വിളവ്",
    value: "85%",
    icon: TrendingUp,
    color: "text-emerald-500 bg-emerald-500/10",
    trend: "↑12%"
  }
];

export function FarmStatsCard() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, []);

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Farm Overview</h3>
            <p className="text-xs text-muted-foreground font-malayalam">ഫാം സംഗ്രഹം</p>
          </div>
          <div className="text-xs text-muted-foreground">Today</div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col items-center p-3 rounded-xl transition-all duration-500",
                "hover:scale-105",
                animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-2",
                stat.color
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-foreground">{stat.value}</span>
              <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              {stat.trend && (
                <span className="text-[9px] text-primary font-medium mt-0.5">
                  {stat.trend}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
