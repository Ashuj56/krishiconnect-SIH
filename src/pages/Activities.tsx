import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, Droplets, Leaf, Bug, Scissors, Sun, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ActivityType = "irrigation" | "fertilizer" | "pesticide" | "harvest" | "sowing";

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  crop_id: string | null;
  activity_date: string;
  quantity: number | null;
  quantity_unit: string | null;
  cost: number | null;
}

interface Crop {
  id: string;
  name: string;
}

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  irrigation: Droplets,
  fertilizer: Leaf,
  pesticide: Bug,
  harvest: Scissors,
  sowing: Sun,
};

const activityColors: Record<string, string> = {
  irrigation: "bg-water text-primary-foreground",
  fertilizer: "bg-crop-green text-primary-foreground",
  pesticide: "bg-destructive text-destructive-foreground",
  harvest: "bg-harvest-gold text-foreground",
  sowing: "bg-secondary text-secondary-foreground",
};

const activityLabels: Record<string, string> = {
  irrigation: "Irrigation",
  fertilizer: "Fertilizer",
  pesticide: "Pesticide",
  harvest: "Harvest",
  sowing: "Sowing",
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Activities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    crop_id: "",
    quantity: "",
    quantity_unit: "",
    cost: "",
  });

  useEffect(() => {
    if (user) {
      fetchActivities();
      fetchCrops();
    }
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("activity_date", { ascending: false });

      if (data) {
        setActivities(data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrops = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("crops")
      .select("id, name")
      .eq("user_id", user.id);

    if (data) {
      setCrops(data);
    }
  };

  const handleAddActivity = async () => {
    if (!user || !selectedType || !newActivity.title) {
      toast({ title: "Please fill in the required fields", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("activities")
        .insert({
          user_id: user.id,
          activity_type: selectedType,
          title: newActivity.title,
          description: newActivity.description || null,
          crop_id: newActivity.crop_id || null,
          activity_date: selectedDate.toISOString().split("T")[0],
          quantity: newActivity.quantity ? parseFloat(newActivity.quantity) : null,
          quantity_unit: newActivity.quantity_unit || null,
          cost: newActivity.cost ? parseFloat(newActivity.cost) : null,
        })
        .select()
        .single();

      if (error) throw error;

      setActivities([data, ...activities]);
      setShowAddDialog(false);
      setSelectedType(null);
      setNewActivity({ title: "", description: "", crop_id: "", quantity: "", quantity_unit: "", cost: "" });
      toast({ title: "Activity added successfully" });
    } catch (error) {
      toast({ title: "Error adding activity", variant: "destructive" });
    }
  };

  const openAddDialog = (type?: ActivityType) => {
    if (type) {
      setSelectedType(type);
      setNewActivity({ ...newActivity, title: `${activityLabels[type]} activity` });
    }
    setShowAddDialog(true);
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const hasActivity = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return activities.some((a) => a.activity_date === dateStr);
  };

  const getActivitiesForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return activities.filter((a) => a.activity_date === dateStr);
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const selectedActivities = getActivitiesForDate(selectedDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">Activities</h1>
            <p className="text-xs text-muted-foreground">Track your farm activities</p>
          </div>
          <Button size="icon" onClick={() => openAddDialog()}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-base">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getMonthDays().map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && setSelectedDate(date)}
                  disabled={!date}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all",
                    date && isSelected(date) && "bg-primary text-primary-foreground",
                    date && isToday(date) && !isSelected(date) && "bg-primary/10 text-primary font-semibold",
                    date && !isSelected(date) && !isToday(date) && "hover:bg-muted",
                    !date && "invisible"
                  )}
                >
                  {date && (
                    <>
                      <span>{date.getDate()}</span>
                      {hasActivity(date) && (
                        <span className={cn(
                          "w-1 h-1 rounded-full mt-0.5",
                          isSelected(date) ? "bg-primary-foreground" : "bg-primary"
                        )} />
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activities for Selected Date */}
        <div>
          <h3 className="font-semibold mb-3">
            {selectedDate.toDateString() === new Date().toDateString()
              ? "Today's Activities"
              : selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </h3>

          {selectedActivities.length > 0 ? (
            <div className="space-y-3">
              {selectedActivities.map((activity) => {
                const Icon = activityIcons[activity.activity_type] || Leaf;
                const colorClass = activityColors[activity.activity_type] || "bg-muted";
                const crop = crops.find((c) => c.id === activity.crop_id);
                
                return (
                  <Card key={activity.id} className="border-2 hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {crop?.name || "General"}
                            {activity.quantity && ` • ${activity.quantity} ${activity.quantity_unit || ""}`}
                            {activity.cost && ` • ₹${activity.cost}`}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded-lg">
                          {activity.activity_type}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-2 p-8 text-center">
              <p className="text-muted-foreground">No activities recorded for this day</p>
              <Button variant="outline" className="mt-3" onClick={() => openAddDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </Card>
          )}
        </div>

        {/* Quick Add */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Quick Add</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activityIcons).map(([type, Icon]) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => openAddDialog(type as ActivityType)}
                >
                  <div className={cn("w-5 h-5 rounded flex items-center justify-center", activityColors[type])}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="capitalize">{type}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Activity Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Activity Type</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(activityIcons).map(([type, Icon]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type as ActivityType)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all",
                      selectedType === type ? "border-primary bg-primary/10" : "border-muted hover:border-primary/50"
                    )}
                  >
                    <div className={cn("w-6 h-6 rounded flex items-center justify-center", activityColors[type])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Activity title"
              value={newActivity.title}
              onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-transparent focus:border-primary/50 outline-none"
            />

            <textarea
              placeholder="Description (optional)"
              value={newActivity.description}
              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              className="w-full h-20 px-4 py-3 rounded-xl bg-muted border-2 border-transparent focus:border-primary/50 outline-none resize-none"
            />

            {crops.length > 0 && (
              <select
                value={newActivity.crop_id}
                onChange={(e) => setNewActivity({ ...newActivity, crop_id: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-transparent focus:border-primary/50 outline-none"
              >
                <option value="">Select crop (optional)</option>
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>{crop.name}</option>
                ))}
              </select>
            )}

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Quantity"
                value={newActivity.quantity}
                onChange={(e) => setNewActivity({ ...newActivity, quantity: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-transparent focus:border-primary/50 outline-none"
              />
              <input
                type="text"
                placeholder="Unit (kg, L, etc.)"
                value={newActivity.quantity_unit}
                onChange={(e) => setNewActivity({ ...newActivity, quantity_unit: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-transparent focus:border-primary/50 outline-none"
              />
            </div>

            <input
              type="number"
              placeholder="Cost (₹)"
              value={newActivity.cost}
              onChange={(e) => setNewActivity({ ...newActivity, cost: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-transparent focus:border-primary/50 outline-none"
            />

            <Button className="w-full" onClick={handleAddActivity} disabled={!selectedType || !newActivity.title}>
              Add Activity
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
