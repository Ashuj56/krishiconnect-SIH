import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  time: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

const tasks: Task[] = [
  { id: "1", title: "Apply organic fertilizer to paddy", time: "8:00 AM", priority: "high", completed: false },
  { id: "2", title: "Check banana plants for diseases", time: "10:00 AM", priority: "medium", completed: false },
  { id: "3", title: "Water coconut seedlings", time: "4:00 PM", priority: "low", completed: false },
];

const priorityColors = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-primary"
};

export function TodaysTasksCard() {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Today's Tasks</h2>
              <p className="text-xs text-muted-foreground font-malayalam">
                ഇന്നത്തെ ജോലികൾ
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/activities")}
              className="text-primary hover:text-primary hover:bg-primary/10 gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="p-4 pt-2 space-y-2">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl",
                "bg-muted/50 hover:bg-muted/80",
                "transition-all duration-300 hover:scale-[1.01]",
                "cursor-pointer group"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <button className="relative">
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </button>
              
              <div className={cn(
                "w-2 h-2 rounded-full",
                priorityColors[task.priority]
              )} />
              
              <span className={cn(
                "text-sm flex-1 transition-colors",
                task.completed ? "line-through text-muted-foreground" : "text-foreground"
              )}>
                {task.title}
              </span>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {task.time}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>0 of 3 completed</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: "0%" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
