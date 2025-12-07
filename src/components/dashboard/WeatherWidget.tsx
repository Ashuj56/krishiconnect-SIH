import { useState, useEffect } from "react";
import { Cloud, Droplets, Wind, Sun, CloudRain, RefreshCw, ThermometerSun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
  description: string;
  humidity: number;
  windSpeed: number;
  location: string;
  sunrise: string;
  sunset: string;
  forecast: { day: string; temp: number; condition: string }[];
  alerts: { type: string; message: string }[];
  lastUpdated: string;
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  "partly-cloudy": Cloud,
};

const weatherEmoji: Record<string, string> = {
  sunny: "☀️",
  cloudy: "☁️",
  rainy: "🌧️",
  "partly-cloudy": "⛅",
};

export function WeatherWidget() {
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchWeather();
    }
  }, [user]);

  const fetchWeather = async () => {
    if (!user) return;
    
    try {
      setError(null);
      
      // Prioritize farm location for weather data
      const { data: farm } = await supabase
        .from('farms')
        .select('location')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      let village = farm?.location;
      
      // Fallback to profile location if no farm location
      if (!village) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('location')
          .eq('id', user.id)
          .single();
        village = profile?.location;
      }

      const location = village ? `${village}, Kerala, India` : null;
      if (!location) {
        setError("Please add your farm location in Farm Profile");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase.functions.invoke('weather', {
        body: { location }
      });

      if (fetchError) throw fetchError;
      
      if (data.error) {
        setError(data.error);
        return;
      }

      setWeather(data);
      
      if (data.alerts && data.alerts.length > 0) {
        data.alerts.forEach((alert: { type: string; message: string }) => {
          toast({
            title: alert.type === 'alert' ? "⚠️ Weather Alert" : "Weather Advisory",
            description: alert.message,
            variant: alert.type === 'alert' ? "destructive" : "default",
          });
        });
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError("Unable to fetch weather data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWeather();
  };

  if (loading) {
    return (
      <Card className="overflow-hidden rounded-2xl shadow-card">
        <div className="gradient-kerala p-5">
          <Skeleton className="h-6 w-32 bg-primary-foreground/20" />
          <Skeleton className="h-14 w-28 mt-3 bg-primary-foreground/20" />
          <Skeleton className="h-4 w-24 mt-2 bg-primary-foreground/20" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden rounded-2xl shadow-card">
        <div className="gradient-kerala p-5 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-malayalam">കാലാവസ്ഥ</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
            <Cloud className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </Card>
    );
  }

  if (!weather) return null;

  const WeatherIcon = weatherIcons[weather.condition] || Cloud;

  return (
    <Card className="overflow-hidden rounded-2xl shadow-card border-0">
      <div className="gradient-kerala p-3 text-primary-foreground relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute right-0 top-0 w-24 h-24 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="70" cy="30" r="25" fill="currentColor" />
            <circle cx="40" cy="60" r="20" fill="currentColor" />
          </svg>
        </div>

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs opacity-90">{weather.location}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
              </Button>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-bold">{weather.temperature}°</span>
            </div>
            <p className="text-sm mt-0.5 capitalize opacity-95 flex items-center gap-1.5">
              <span className="text-lg">{weatherEmoji[weather.condition] || "🌤️"}</span>
              {weather.description}
            </p>
            <p className="text-xs mt-0.5 opacity-75 flex items-center gap-1">
              <ThermometerSun className="w-3 h-3" />
              Feels like {weather.feelsLike}°C
            </p>
          </div>
          <WeatherIcon className="w-14 h-14 opacity-90 animate-float" />
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-3 pt-3 border-t border-primary-foreground/20">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-primary-foreground/10">
              <Droplets className="w-3.5 h-3.5 opacity-90" />
            </div>
            <div>
              <span className="text-xs font-semibold">{weather.humidity}%</span>
              <p className="text-[10px] opacity-70">Humidity</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-primary-foreground/10">
              <Wind className="w-3.5 h-3.5 opacity-90" />
            </div>
            <div>
              <span className="text-xs font-semibold">{weather.windSpeed} km/h</span>
              <p className="text-[10px] opacity-70">Wind</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <CardContent className="p-3 bg-card">
        <p className="text-[10px] font-medium text-muted-foreground mb-2 font-malayalam">
          4-ദിവസ പ്രവചനം • 4-Day Forecast
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {weather.forecast.map((day) => {
            const DayIcon = weatherIcons[day.condition as keyof typeof weatherIcons] || Cloud;
            return (
              <div key={day.day} className="text-center p-1.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <p className="text-[10px] text-muted-foreground font-medium">{day.day}</p>
                <DayIcon className="w-4 h-4 mx-auto my-1 text-primary" />
                <p className="text-xs font-semibold">{day.temp}°</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
