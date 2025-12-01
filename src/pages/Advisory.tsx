import { Sun, CloudRain, Bug, Leaf, Calendar, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Advisory {
  id: string;
  type: "weather" | "pest" | "crop" | "general";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action?: string;
}

const advisories: Advisory[] = [
  {
    id: "1",
    type: "weather",
    priority: "high",
    title: "Heavy Rainfall Expected",
    description: "IMD predicts heavy rainfall in your area over the next 48 hours. Take necessary precautions for your crops.",
    action: "View Details",
  },
  {
    id: "2",
    type: "pest",
    priority: "medium",
    title: "Brown Planthopper Alert",
    description: "Increased brown planthopper activity reported in nearby areas. Monitor your paddy fields closely.",
    action: "Prevention Tips",
  },
  {
    id: "3",
    type: "crop",
    priority: "low",
    title: "Optimal Fertilizer Window",
    description: "Next 3 days are ideal for applying fertilizer to your banana plants based on growth stage and weather.",
    action: "Learn More",
  },
];

const cropCalendar = [
  { crop: "Rice", activity: "Transplanting", timing: "Current", status: "active" },
  { crop: "Banana", activity: "Flowering", timing: "2 weeks", status: "upcoming" },
  { crop: "Vegetables", activity: "Harvest", timing: "5 days", status: "upcoming" },
];

const advisoryIcons = {
  weather: Sun,
  pest: Bug,
  crop: Leaf,
  general: AlertTriangle,
};

const priorityStyles = {
  high: "border-destructive/30 bg-destructive/5",
  medium: "border-warning/30 bg-warning/5",
  low: "border-primary/30 bg-primary/5",
};

export default function Advisory() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">Farm Advisory</h1>
            <p className="text-xs text-muted-foreground">Personalized recommendations</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Weather Summary */}
        <Card className="overflow-hidden">
          <div className="gradient-weather p-5 text-accent-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Weather Advisory</p>
                <h3 className="text-lg font-bold mt-1">Monsoon Active</h3>
                <p className="text-sm mt-1 opacity-90">
                  Expect intermittent showers this week
                </p>
              </div>
              <CloudRain className="w-16 h-16 opacity-80" />
            </div>
          </div>
        </Card>

        {/* Advisories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Active Advisories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {advisories.map((advisory) => {
              const Icon = advisoryIcons[advisory.type];
              return (
                <div
                  key={advisory.id}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    priorityStyles[advisory.priority]
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      advisory.priority === "high" ? "bg-destructive/20 text-destructive" :
                      advisory.priority === "medium" ? "bg-warning/20 text-warning" :
                      "bg-primary/20 text-primary"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold">{advisory.title}</h4>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                          advisory.priority === "high" ? "bg-destructive/20 text-destructive" :
                          advisory.priority === "medium" ? "bg-warning/20 text-warning" :
                          "bg-primary/20 text-primary"
                        )}>
                          {advisory.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {advisory.description}
                      </p>
                      {advisory.action && (
                        <Button variant="link" className="h-auto p-0 mt-2 text-primary">
                          {advisory.action} →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Crop Calendar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Crop Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cropCalendar.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-10 rounded-full",
                      item.status === "active" ? "bg-success" : "bg-muted"
                    )} />
                    <div>
                      <h4 className="font-medium">{item.crop}</h4>
                      <p className="text-sm text-muted-foreground">{item.activity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-sm font-medium",
                      item.status === "active" ? "text-success" : "text-muted-foreground"
                    )}>
                      {item.timing}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View Full Calendar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
