import { useState, useEffect } from "react";
import { AlertTriangle, Info, CheckCircle, X, Bell, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  message: string;
  time: string;
}

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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const generateAlerts = async () => {
      const generatedAlerts: Alert[] = [];

      // Check for crops with poor health
      const { data: poorCrops } = await supabase
        .from('crops')
        .select('id, name, health_status, updated_at')
        .eq('user_id', user.id)
        .eq('health_status', 'poor');

      if (poorCrops) {
        poorCrops.forEach(crop => {
          generatedAlerts.push({
            id: `crop-health-${crop.id}`,
            type: "warning",
            title: `${crop.name} Needs Attention`,
            message: "This crop has poor health status. Consider checking for pests or diseases.",
            time: crop.updated_at ? formatDistanceToNow(new Date(crop.updated_at), { addSuffix: true }) : "recently",
          });
        });
      }

      // Check for upcoming harvests (within 7 days)
      const { data: upcomingHarvests } = await supabase
        .from('crops')
        .select('id, name, expected_harvest_date')
        .eq('user_id', user.id)
        .not('expected_harvest_date', 'is', null)
        .gte('expected_harvest_date', new Date().toISOString().split('T')[0])
        .lte('expected_harvest_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (upcomingHarvests) {
        upcomingHarvests.forEach(crop => {
          generatedAlerts.push({
            id: `harvest-${crop.id}`,
            type: "info",
            title: "Harvest Coming Soon",
            message: `${crop.name} is ready for harvest soon. Prepare your equipment.`,
            time: "upcoming",
          });
        });
      }

      // Check recent completed activities
      const { data: recentActivities } = await supabase
        .from('activities')
        .select('id, title, activity_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentActivities) {
        recentActivities.forEach(activity => {
          generatedAlerts.push({
            id: `activity-${activity.id}`,
            type: "success",
            title: `${activity.activity_type} Complete`,
            message: activity.title,
            time: activity.created_at ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }) : "recently",
          });
        });
      }

      // Check for incomplete high-priority tasks
      const { data: urgentTasks } = await supabase
        .from('tasks')
        .select('id, title')
        .eq('user_id', user.id)
        .eq('priority', 'high')
        .eq('completed', false)
        .limit(2);

      if (urgentTasks) {
        urgentTasks.forEach(task => {
          generatedAlerts.push({
            id: `task-${task.id}`,
            type: "warning",
            title: "High Priority Task",
            message: task.title,
            time: "pending",
          });
        });
      }

      // If no alerts generated, add a welcome message
      if (generatedAlerts.length === 0) {
        generatedAlerts.push({
          id: "welcome",
          type: "info",
          title: "Welcome to Krishi Connect!",
          message: "Add your farm and crops to get personalized alerts.",
          time: "now",
        });
      }

      setAlerts(generatedAlerts.slice(0, 4));
      setLoading(false);
    };

    generateAlerts();
  }, [user]);

  const dismissAlert = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  const visibleAlerts = alerts.filter(a => !dismissedIds.includes(a.id));

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

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
        {visibleAlerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No alerts at this time</p>
          </div>
        ) : (
          visibleAlerts.map((alert) => {
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
                      <button 
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
