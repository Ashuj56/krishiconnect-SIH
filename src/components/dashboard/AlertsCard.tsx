import { AlertTriangle, Info, CheckCircle, X, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  message: string;
  time: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "warning",
    title: "Heavy Rain Expected",
    message: "Delay fertilizer application for next 2 days",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "info",
    title: "Best Time to Harvest",
    message: "Coconuts in Section B are ready for harvest",
    time: "5 hours ago",
  },
  {
    id: "3",
    type: "success",
    title: "Irrigation Complete",
    message: "Automated irrigation for paddy field completed",
    time: "Today, 6:00 AM",
  },
];

const alertStyles = {
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/20",
    icon: AlertTriangle,
    iconColor: "text-warning",
  },
  info: {
    bg: "bg-accent/10",
    border: "border-accent/20",
    icon: Info,
    iconColor: "text-accent",
  },
  success: {
    bg: "bg-success/10",
    border: "border-success/20",
    icon: CheckCircle,
    iconColor: "text-success",
  },
};

export function AlertsCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Recent Alerts
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockAlerts.map((alert) => {
          const style = alertStyles[alert.type];
          const Icon = style.icon;

          return (
            <div
              key={alert.id}
              className={cn(
                "p-3 rounded-xl border transition-all duration-200",
                style.bg,
                style.border
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5", style.iconColor)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
