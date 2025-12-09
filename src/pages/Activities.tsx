import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, Droplets, Leaf, Bug, Scissors, Sun, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  area_covered: number | null;
  area_covered_unit: string | null;
}

interface Crop {
  id: string;
  name: string;
}

interface Farm {
  id: string;
  total_area: number | null;
  area_unit: string | null;
}

const quantityUnits = ["kg", "L", "mL", "g", "units", "bags", "packets", "bottles", "drums"];

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
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    crop_id: "",
    quantity: "",
    quantity_unit: "",
    area_covered: "",
    area_covered_unit: "acres",
  });

  useEffect(() => {
    if (user) {
      fetchActivities();
      fetchCrops();
      fetchFarm();
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

  const fetchFarm = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("farms")
      .select("id, total_area, area_unit")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (data) {
      setFarm(data);
    }
  };

  const calculateRemainingArea = () => {
    if (!farm?.total_area || !newActivity.area_covered) return null;
    
    const areaCovered = parseFloat(newActivity.area_covered);
    if (isNaN(areaCovered)) return null;
    
    // Convert farm area to activity unit if different
    const farmUnit = farm.area_unit || "acres";
    const activityUnit = newActivity.area_covered_unit;
    
    let farmAreaInActivityUnit = farm.total_area;
    
    // Simple conversion (approximate)
    const conversionFactors: Record<string, number> = {
      "acres": 1,
      "hectares": 0.404686,
      "cents": 100,
      "sq.m": 4046.86,
    };
    
    if (farmUnit !== activityUnit) {
      const farmInAcres = farm.total_area / (conversionFactors[farmUnit] || 1);
      farmAreaInActivityUnit = farmInAcres * (conversionFactors[activityUnit] || 1);
    }
    
    const remaining = farmAreaInActivityUnit - areaCovered;
    return remaining >= 0 ? remaining.toFixed(2) : null;
  };

  const handleAddActivity = async () => {
    if (!user || !selectedType || !newActivity.title) {
      toast({ title: "Please fill in the required fields", variant: "destructive" });
      return;
    }

    try {
      const activityData = {
        user_id: user.id,
        activity_type: selectedType,
        title: newActivity.title,
        description: newActivity.description || null,
        crop_id: newActivity.crop_id || null,
        activity_date: selectedDate.toISOString().split("T")[0],
        quantity: newActivity.quantity ? parseFloat(newActivity.quantity) : null,
        quantity_unit: newActivity.quantity_unit || null,
        area_covered: newActivity.area_covered ? parseFloat(newActivity.area_covered) : null,
        area_covered_unit: newActivity.area_covered_unit || "acres",
      };

      if (editingActivity) {
        const { data, error } = await supabase
          .from("activities")
          .update(activityData)
          .eq("id", editingActivity.id)
          .select()
          .single();

        if (error) throw error;

        setActivities(activities.map(a => a.id === editingActivity.id ? data : a));
        toast({ title: "Activity updated successfully" });
      } else {
        const { data, error } = await supabase
          .from("activities")
          .insert(activityData)
          .select()
          .single();

        if (error) throw error;

        setActivities([data, ...activities]);
        toast({ title: "Activity added successfully" });
      }

      closeDialog();
    } catch (error) {
      toast({ title: editingActivity ? "Error updating activity" : "Error adding activity", variant: "destructive" });
    }
  };

  const handleDeleteActivity = async () => {
    if (!deletingActivityId) return;

    try {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", deletingActivityId);

      if (error) throw error;

      setActivities(activities.filter(a => a.id !== deletingActivityId));
      toast({ title: "Activity deleted successfully" });
    } catch (error) {
      toast({ title: "Error deleting activity", variant: "destructive" });
    } finally {
      setShowDeleteDialog(false);
      setDeletingActivityId(null);
    }
  };

  const openEditDialog = (activity: Activity) => {
    setEditingActivity(activity);
    setSelectedType(activity.activity_type as ActivityType);
    setNewActivity({
      title: activity.title,
      description: activity.description || "",
      crop_id: activity.crop_id || "",
      quantity: activity.quantity?.toString() || "",
      quantity_unit: activity.quantity_unit || "",
      area_covered: activity.area_covered?.toString() || "",
      area_covered_unit: activity.area_covered_unit || "acres",
    });
    setShowAddDialog(true);
  };

  const openDeleteDialog = (activityId: string) => {
    setDeletingActivityId(activityId);
    setShowDeleteDialog(true);
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    setEditingActivity(null);
    setSelectedType(null);
    setNewActivity({ title: "", description: "", crop_id: "", quantity: "", quantity_unit: "", area_covered: "", area_covered_unit: "acres" });
  };

  const openAddDialog = (type?: ActivityType) => {
    setEditingActivity(null);
    if (type) {
      setSelectedType(type);
      setNewActivity({ ...newActivity, title: `${activityLabels[type]} activity` });
    } else {
      setNewActivity({ title: "", description: "", crop_id: "", quantity: "", quantity_unit: "", area_covered: "", area_covered_unit: "acres" });
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
        {/* Calendar - Compact */}
        <Card>
          <CardHeader className="py-2 px-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-sm">
                {currentDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                  {day.charAt(0)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {getMonthDays().map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && setSelectedDate(date)}
                  disabled={!date}
                  className={cn(
                    "aspect-square rounded-md flex flex-col items-center justify-center text-xs transition-all",
                    date && isSelected(date) && "bg-primary text-primary-foreground",
                    date && isToday(date) && !isSelected(date) && "bg-primary/10 text-primary font-semibold",
                    date && !isSelected(date) && !isToday(date) && "hover:bg-muted",
                    !date && "invisible"
                  )}
                >
                  {date && (
                    <>
                      <span className="text-[11px]">{date.getDate()}</span>
                      {hasActivity(date) && (
                        <span className={cn(
                          "w-1 h-1 rounded-full",
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
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {crop?.name || "General"}
                            {activity.quantity && ` • ${activity.quantity} ${activity.quantity_unit || ""}`}
                            {activity.area_covered && ` • ${activity.area_covered} ${activity.area_covered_unit || "acres"}`}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(activity)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog(activity.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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

      {/* Add/Edit Activity Dialog */}
      <Dialog open={showAddDialog} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingActivity ? "Edit Activity" : "Add Activity"}</DialogTitle>
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
              <select
                value={newActivity.quantity_unit}
                onChange={(e) => setNewActivity({ ...newActivity, quantity_unit: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-transparent focus:border-primary/50 outline-none"
              >
                <option value="">Select unit</option>
                {quantityUnits.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Area covered"
                value={newActivity.area_covered}
                onChange={(e) => setNewActivity({ ...newActivity, area_covered: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-transparent focus:border-primary/50 outline-none"
              />
              <select
                value={newActivity.area_covered_unit}
                onChange={(e) => setNewActivity({ ...newActivity, area_covered_unit: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-transparent focus:border-primary/50 outline-none"
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="cents">Cents</option>
                <option value="sq.m">Sq. Meters</option>
              </select>
            </div>

            {newActivity.area_covered && farm?.total_area && calculateRemainingArea() !== null && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Remaining Area:</span>
                  <span className="font-semibold text-primary">
                    {calculateRemainingArea()} {newActivity.area_covered_unit}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total farm: {farm.total_area} {farm.area_unit || "acres"}
                </div>
              </div>
            )}

            <Button className="w-full" onClick={handleAddActivity} disabled={!selectedType || !newActivity.title}>
              {editingActivity ? "Update Activity" : "Add Activity"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteActivity} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
