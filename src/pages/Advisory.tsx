import { useState, useEffect } from "react";
import { Sun, CloudRain, Bug, Leaf, Calendar, AlertTriangle, Loader2, MapPin, TrendingUp, Droplets, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Advisory {
  id: string;
  title: string;
  description: string;
  category: "weather" | "crop" | "pest" | "soil" | "market" | "general";
  priority: "high" | "medium" | "low";
  actionItems: string[];
  relatedCrop?: string;
  validUntil?: string;
}

interface AdvisoryMeta {
  season: string;
  state: string;
  generatedAt: string;
  cropCount: number;
}

const advisoryIcons = {
  weather: Sun,
  pest: Bug,
  crop: Leaf,
  soil: Droplets,
  market: TrendingUp,
  general: AlertTriangle,
};

const priorityStyles = {
  high: "border-destructive/30 bg-destructive/5",
  medium: "border-warning/30 bg-warning/5",
  low: "border-primary/30 bg-primary/5",
};

const categoryLabels: Record<string, string> = {
  weather: "Weather",
  crop: "Crop Care",
  pest: "Pest/Disease",
  soil: "Soil Health",
  market: "Market",
  general: "General",
};

export default function Advisory() {
  const { user } = useAuth();
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [meta, setMeta] = useState<AdvisoryMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedAdvisory, setExpandedAdvisory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAdvisories();
    }
  }, [user]);

  const fetchAdvisories = async () => {
    try {
      setLoading(true);

      // Fetch farmer context
      const [profileResult, farmResult, cropsResult, activitiesResult] = await Promise.all([
        supabase.from("profiles").select("full_name, location").eq("id", user?.id).maybeSingle(),
        supabase.from("farms").select("total_area, soil_type, water_source, location").eq("user_id", user?.id).maybeSingle(),
        supabase.from("crops").select("name, variety, current_stage, health_status, area").eq("user_id", user?.id),
        supabase.from("activities").select("activity_type, title, activity_date").eq("user_id", user?.id).order("activity_date", { ascending: false }).limit(10),
      ]);

      const farmerContext = {
        name: profileResult.data?.full_name || "",
        location: profileResult.data?.location || farmResult.data?.location || "",
        landArea: farmResult.data?.total_area || 0,
        soilType: farmResult.data?.soil_type || "",
        waterSource: farmResult.data?.water_source || "",
        crops: cropsResult.data?.map(c => ({
          name: c.name,
          variety: c.variety || undefined,
          stage: c.current_stage || undefined,
          health: c.health_status || undefined,
          area: c.area || undefined,
        })) || [],
        recentActivities: activitiesResult.data?.map(a => ({
          type: a.activity_type,
          title: a.title,
          date: a.activity_date,
        })) || [],
      };

      const { data, error } = await supabase.functions.invoke("farm-advisory", {
        body: { farmerContext },
      });

      if (error) throw error;

      setAdvisories(data.advisories || []);
      setMeta(data.meta || null);
    } catch (error) {
      console.error("Error fetching advisories:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(advisories.map(a => a.category)));
  const filteredAdvisories = selectedCategory
    ? advisories.filter(a => a.category === selectedCategory)
    : advisories;

  const highPriorityCount = advisories.filter(a => a.priority === "high").length;

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
            <h1 className="text-xl font-bold">Farm Advisory</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{meta?.state || "Loading..."}</span>
              <span className="mx-1">•</span>
              <span>{meta?.season} Season</span>
            </div>
          </div>
          {highPriorityCount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full font-medium">
              {highPriorityCount} Urgent
            </span>
          )}
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in pb-24">
        {/* Season Summary */}
        <Card className="overflow-hidden">
          <div className="gradient-weather p-5 text-accent-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Current Season</p>
                <h3 className="text-lg font-bold mt-1">{meta?.season || "Loading..."}</h3>
                <p className="text-sm mt-1 opacity-90">
                  {meta?.cropCount || 0} crops being monitored
                </p>
              </div>
              <CloudRain className="w-16 h-16 opacity-80" />
            </div>
          </div>
        </Card>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="whitespace-nowrap"
          >
            All ({advisories.length})
          </Button>
          {categories.map((category) => {
            const count = advisories.filter(a => a.category === category).length;
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {categoryLabels[category]} ({count})
              </Button>
            );
          })}
        </div>

        {/* Advisories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Active Advisories ({filteredAdvisories.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredAdvisories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No advisories for the selected category
              </p>
            ) : (
              filteredAdvisories.map((advisory) => {
                const Icon = advisoryIcons[advisory.category] || AlertTriangle;
                const isExpanded = expandedAdvisory === advisory.id;
                
                return (
                  <div
                    key={advisory.id}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      priorityStyles[advisory.priority]
                    )}
                  >
                    <div 
                      className="flex items-start gap-3 cursor-pointer"
                      onClick={() => setExpandedAdvisory(isExpanded ? null : advisory.id)}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        advisory.priority === "high" ? "bg-destructive/20 text-destructive" :
                        advisory.priority === "medium" ? "bg-warning/20 text-warning" :
                        "bg-primary/20 text-primary"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold">{advisory.title}</h4>
                            {advisory.relatedCrop && (
                              <span className="text-xs text-muted-foreground">
                                Crop: {advisory.relatedCrop}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                              advisory.priority === "high" ? "bg-destructive/20 text-destructive" :
                              advisory.priority === "medium" ? "bg-warning/20 text-warning" :
                              "bg-primary/20 text-primary"
                            )}>
                              {advisory.priority}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {advisory.description}
                        </p>
                      </div>
                    </div>

                    {/* Expanded Action Items */}
                    {isExpanded && advisory.actionItems.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/50 animate-fade-in">
                        <h5 className="text-sm font-medium mb-2">Recommended Actions:</h5>
                        <ul className="space-y-2">
                          {advisory.actionItems.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-medium">
                                {index + 1}
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                        {advisory.validUntil && (
                          <p className="text-xs text-muted-foreground mt-3">
                            Valid until: {advisory.validUntil}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Seasonal Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meta?.season === "Rabi" && (
                <>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    🌾 Best time for wheat, mustard, and gram sowing
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    💧 Schedule irrigation every 20-25 days
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    🥶 Protect crops from frost in December-January
                  </div>
                </>
              )}
              {meta?.season === "Kharif" && (
                <>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    🌧️ Monitor drainage to prevent waterlogging
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    🐛 Watch for pest attacks in humid conditions
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    🌱 Apply nitrogen in split doses
                  </div>
                </>
              )}
              {meta?.season === "Zaid/Summer" && (
                <>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    ☀️ Use mulching to conserve soil moisture
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    💧 Irrigate early morning or late evening
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    🍉 Ideal for watermelon and cucumber cultivation
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
