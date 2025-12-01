import { CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  time?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  crop?: string;
}

const mockTasks: Task[] = [
  { id: "1", title: "Irrigate paddy field", time: "6:00 AM", priority: "high", completed: false, crop: "Rice" },
  { id: "2", title: "Apply fertilizer to banana plants", time: "8:00 AM", priority: "medium", completed: false, crop: "Banana" },
  { id: "3", title: "Check pest traps", priority: "low", completed: true, crop: "Vegetables" },
  { id: "4", title: "Harvest coconuts - Section B", time: "4:00 PM", priority: "medium", completed: false, crop: "Coconut" },
];

const priorityStyles = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
};

export function TaskCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Today's Tasks
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl border transition-all duration-200",
              task.completed ? "bg-muted/50 opacity-60" : "bg-card hover:shadow-card"
            )}
          >
            <button className="mt-0.5 touch-target flex items-center justify-center">
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium", task.completed && "line-through")}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {task.time && (
                  <span className="text-xs text-muted-foreground">{task.time}</span>
                )}
                {task.crop && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {task.crop}
                  </span>
                )}
              </div>
            </div>
            <span className={cn("text-xs px-2 py-1 rounded-lg font-medium", priorityStyles[task.priority])}>
              {task.priority === "high" && <AlertTriangle className="w-3 h-3 inline mr-1" />}
              {task.priority}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
