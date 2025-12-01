import { Plus, MessageCircle, Camera, Calendar, Droplets, Bug, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const actions = [
  { icon: Plus, label: "Log Activity", color: "bg-primary", path: "/activities/new" },
  { icon: MessageCircle, label: "Ask AI", color: "bg-accent", path: "/chat" },
  { icon: Camera, label: "Scan Crop", color: "bg-success", path: "/scanner" },
  { icon: Calendar, label: "Schedule", color: "bg-secondary", path: "/activities" },
];

const quickLogs = [
  { icon: Droplets, label: "Irrigation", color: "text-water" },
  { icon: Leaf, label: "Fertilizer", color: "text-crop-green" },
  { icon: Bug, label: "Pesticide", color: "text-destructive" },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="glass"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate(action.path)}
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        <div className="pt-2">
          <p className="text-xs font-medium text-muted-foreground mb-3">Quick Log</p>
          <div className="flex gap-2">
            {quickLogs.map((log) => (
              <Button
                key={log.label}
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
              >
                <log.icon className={`w-4 h-4 ${log.color}`} />
                {log.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
