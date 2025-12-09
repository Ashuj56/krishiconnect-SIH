import { useState, useEffect } from "react";
import { MapPin, Bell, Mic, FileText, Calendar, MessageCircle, Sprout, AlertTriangle, TrendingUp, CloudRain, Bug, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { SmartAlertsCard } from "@/components/dashboard/SmartAlertsCard";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FarmInfo {
  name: string;
  area: number | null;
  areaUnit: string | null;
}

const quickActions = [
  { 
    icon: Mic, 
    label: "വോയ്സ്", 
    labelEn: "Voice", 
    path: "/chat", 
    color: "bg-primary",
    gradient: "from-primary to-primary/80"
  },
  { 
    icon: FlaskConical, 
    label: "മണ്ണ്", 
    labelEn: "Soil", 
    path: "/soil-analysis", 
    color: "bg-secondary",
    gradient: "from-secondary to-secondary/80"
  },
  { 
    icon: Calendar, 
    label: "കലണ്ടർ", 
    labelEn: "Calendar", 
    path: "/activities", 
    color: "bg-sky",
    gradient: "from-sky to-sky/80"
  },
  { 
    icon: MessageCircle, 
    label: "ചാറ്റ്", 
    labelEn: "Chat", 
    path: "/chat", 
    color: "bg-harvest-gold",
    gradient: "from-harvest-gold to-harvest-gold/80"
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background kerala-pattern">
      {/* Header Banner */}
      <header className="sticky top-0 z-40 gradient-kerala text-primary-foreground safe-top">
        <div className="px-4 py-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-primary-foreground/80 font-malayalam">
                {greeting.ml}
              </p>
              <h1 className="text-lg font-bold flex items-center gap-1.5 mt-0.5">
                Hello, {userName}! 
                <span className="animate-wave inline-block text-base">👋</span>
              </h1>
              {farmInfo && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-primary-foreground/90">
                  <Sprout className="w-3 h-3" />
                  <span>
                    {farmInfo.name} • {farmInfo.area} {farmInfo.areaUnit}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 pb-24 space-y-5 mt-4">
        {/* Weather Widget */}
        <div className="animate-slide-up">
          <WeatherWidget />
        </div>

        {/* Quick Actions */}
        <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={action.labelEn}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card shadow-card border border-border/30 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm",
                  action.gradient
                )}>
                  <action.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xs font-medium font-malayalam text-foreground">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Smart Alerts Section */}
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <SmartAlertsCard />
        </div>

        {/* Today's Tasks Preview */}
        <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold">Today's Tasks</h2>
                  <p className="text-xs text-muted-foreground font-malayalam">
                    ഇന്നത്തെ ജോലികൾ
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/activities")}
                  className="text-primary"
                >
                  View All
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm flex-1">Apply organic fertilizer to paddy</span>
                  <span className="text-xs text-muted-foreground">8:00 AM</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-sm flex-1">Check banana plants for diseases</span>
                  <span className="text-xs text-muted-foreground">10:00 AM</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-harvest-gold" />
                  <span className="text-sm flex-1">Water coconut seedlings</span>
                  <span className="text-xs text-muted-foreground">4:00 PM</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
