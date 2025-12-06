import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CropOverview } from "@/components/dashboard/CropOverview";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Farmer");

  useEffect(() => {
    if (user) {
      fetchUserName();
    }
  }, [user]);

  const fetchUserName = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (data?.full_name) {
      setUserName(data.full_name.split(" ")[0]); // First name only
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm text-muted-foreground">{getGreeting()}</p>
            <h1 className="text-xl font-bold">{userName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
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
