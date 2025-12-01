import { User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CropOverview } from "@/components/dashboard/CropOverview";
import { AlertsCard } from "@/components/dashboard/AlertsCard";

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm text-muted-foreground">Good Morning</p>
            <h1 className="text-xl font-bold">Rajesh Kumar</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 space-y-4 animate-fade-in">
        {/* Weather Widget */}
        <WeatherWidget />

        {/* Quick Actions */}
        <QuickActions />

        {/* Tasks & Alerts Grid */}
        <div className="grid lg:grid-cols-2 gap-4">
          <TaskCard />
          <AlertsCard />
        </div>

        {/* Crop Overview */}
        <CropOverview />
      </div>
    </div>
  );
}
