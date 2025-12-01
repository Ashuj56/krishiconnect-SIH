import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  scheduled_time: string | null;
  priority: "low" | "medium" | "high";
  completed: boolean;
  crop_name?: string;
}

const priorityStyles = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
};

export function TaskCard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const loadTasks = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          scheduled_time,
          priority,
          completed,
          crops(name)
        `)
        .eq('user_id', user.id)
        .eq('scheduled_date', today)
        .order('scheduled_time', { ascending: true })
        .limit(5);

      if (data) {
        setTasks(data.map(task => ({
          id: task.id,
          title: task.title,
          scheduled_time: task.scheduled_time,
          priority: (task.priority as "low" | "medium" | "high") || "medium",
          completed: task.completed || false,
          crop_name: (task.crops as any)?.name,
        })));
      }
      setLoading(false);
    };

    loadTasks();
  }, [user]);

  const toggleTask = async (taskId: string, completed: boolean) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !completed } : t
    ));

    await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', taskId);
  };

  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

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
            <Clock className="w-5 h-5 text-primary" />
            Today's Tasks
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/activities')}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks for today</p>
            <Button variant="link" size="sm" className="mt-1" onClick={() => navigate('/activities')}>
              Add a task
            </Button>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border transition-all duration-200",
                task.completed ? "bg-muted/50 opacity-60" : "bg-card hover:shadow-card"
              )}
            >
              <button 
                className="mt-0.5 touch-target flex items-center justify-center"
                onClick={() => toggleTask(task.id, task.completed)}
              >
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
                  {task.scheduled_time && (
                    <span className="text-xs text-muted-foreground">{formatTime(task.scheduled_time)}</span>
                  )}
                  {task.crop_name && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {task.crop_name}
                    </span>
                  )}
                </div>
              </div>
              <span className={cn("text-xs px-2 py-1 rounded-lg font-medium", priorityStyles[task.priority])}>
                {task.priority === "high" && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                {task.priority}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
