import { useState, useEffect } from "react";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { SmartAlertsCard } from "@/components/dashboard/SmartAlertsCard";
import { AnimatedHeroHeader } from "@/components/dashboard/AnimatedHeroHeader";
import { QuickActionsGrid } from "@/components/dashboard/QuickActionsGrid";
import { FarmStatsCard } from "@/components/dashboard/FarmStatsCard";
import { TodaysTasksCard } from "@/components/dashboard/TodaysTasksCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface FarmInfo {
  name: string;
  area: number | null;
  areaUnit: string | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [userName, setUserName] = useState("കർഷകൻ");
  const [farmInfo, setFarmInfo] = useState<FarmInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name.split(" ")[0]);
      }

      // Fetch farm
      const { data: farm } = await supabase
        .from("farms")
        .select("name, total_area, area_unit")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (farm) {
        setFarmInfo({
          name: farm.name,
          area: farm.total_area,
          areaUnit: farm.area_unit
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { en: "Good Morning", ml: "സുപ്രഭാതം" };
    if (hour < 17) return { en: "Good Afternoon", ml: "നല്ല ഉച്ചനേരം" };
    return { en: "Good Evening", ml: "ശുഭ സന്ധ്യ" };
  };

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Hero Header with Video-like Effect */}
      <AnimatedHeroHeader 
        greeting={greeting}
        userName={userName}
        farmInfo={farmInfo}
      />

      {/* Main Content */}
      <div className="px-4 pb-24 space-y-5 -mt-2">
        {/* Farm Stats Overview */}
        <div className="animate-slide-up">
          <FarmStatsCard />
        </div>

        {/* Weather Widget */}
        <div className="animate-slide-up" style={{ animationDelay: "50ms" }}>
          <WeatherWidget />
        </div>

        {/* Quick Actions Grid */}
        <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <QuickActionsGrid />
        </div>

        {/* Smart Alerts Section */}
        <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
          <SmartAlertsCard />
        </div>

        {/* Today's Tasks */}
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <TodaysTasksCard />
        </div>
      </div>
    </div>
  );
}
