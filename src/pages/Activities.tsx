import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Droplets, Leaf, Bug, Scissors, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ActivityType = "irrigation" | "fertilizer" | "pesticide" | "harvest" | "sowing";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  crop: string;
  date: Date;
  notes?: string;
}

const activityIcons = {
  irrigation: Droplets,
  fertilizer: Leaf,
  pesticide: Bug,
  harvest: Scissors,
  sowing: Sun,
};

const activityColors = {
  irrigation: "bg-water text-primary-foreground",
  fertilizer: "bg-crop-green text-primary-foreground",
  pesticide: "bg-destructive text-destructive-foreground",
  harvest: "bg-harvest-gold text-foreground",
  sowing: "bg-secondary text-secondary-foreground",
};

const mockActivities: Activity[] = [
  { id: "1", type: "irrigation", title: "Irrigated paddy field", crop: "Rice", date: new Date() },
  { id: "2", type: "fertilizer", title: "Applied NPK fertilizer", crop: "Banana", date: new Date() },
  { id: "3", type: "harvest", title: "Harvested coconuts", crop: "Coconut", date: new Date(Date.now() - 86400000) },
  { id: "4", type: "pesticide", title: "Sprayed neem oil", crop: "Vegetables", date: new Date(Date.now() - 86400000) },
  { id: "5", type: "sowing", title: "Planted tomato seedlings", crop: "Vegetables", date: new Date(Date.now() - 172800000) },
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Activities() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const hasActivity = (date: Date) => {
    return mockActivities.some(
      (a) => a.date.toDateString() === date.toDateString()
    );
  };

  const getActivitiesForDate = (date: Date) => {
    return mockActivities.filter(
      (a) => a.date.toDateString() === date.toDateString()
    );
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const selectedActivities = getActivitiesForDate(selectedDate);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">Activities</h1>
            <p className="text-xs text-muted-foreground">Track your farm activities</p>
          </div>
          <Button size="icon">
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
            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
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
                const Icon = activityIcons[activity.type];
                return (
                  <Card key={activity.id} className="border-2 hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", activityColors[activity.type])}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">{activity.crop}</p>
                        </div>
                        <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded-lg">
                          {activity.type}
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
              <Button variant="outline" className="mt-3">
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </Card>
          )}
        </div>

        {/* Activity Types Legend */}
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
                >
                  <div className={cn("w-5 h-5 rounded flex items-center justify-center", activityColors[type as ActivityType])}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="capitalize">{type}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
