import { useState, useEffect } from "react";
import { Cloud, Droplets, Wind, Sun, CloudRain, Sunrise, Sunset, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

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
      
      // Get user's location from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .single();

      // Get location from farm if not in profile
      let village = profile?.location;
      if (!village) {
        const { data: farm } = await supabase
          .from('farms')
          .select('location')
          .eq('user_id', user.id)
          .limit(1)
          .single();
        village = farm?.location;
      }

      // Format location as "Village, Kerala, India" for better geocoding
      const location = village ? `${village}, Kerala, India` : null;
      if (!location) {
        setError("Please add your location in profile settings");
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
      
      // Show weather alerts as toast notifications
      if (data.alerts && data.alerts.length > 0) {
        data.alerts.forEach((alert: { type: string; message: string }) => {
          toast({
            title: alert.type === 'alert' ? "Weather Alert" : "Weather Advisory",
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
      <Card className="overflow-hidden">
        <div className="gradient-weather p-5">
          <Skeleton className="h-6 w-32 bg-white/20" />
          <Skeleton className="h-12 w-24 mt-2 bg-white/20" />
          <Skeleton className="h-4 w-20 mt-2 bg-white/20" />
          <div className="flex gap-6 mt-4 pt-4 border-t border-white/20">
            <Skeleton className="h-4 w-16 bg-white/20" />
            <Skeleton className="h-4 w-16 bg-white/20" />
          </div>
        </div>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="text-center">
                <Skeleton className="h-4 w-8 mx-auto" />
                <Skeleton className="h-5 w-5 mx-auto my-1" />
                <Skeleton className="h-4 w-8 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden">
        <div className="gradient-weather p-5 text-accent-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Weather</p>
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
    <Card className="overflow-hidden">
      <div className="gradient-weather p-5 text-accent-foreground">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm opacity-90">{weather.location}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-accent-foreground/80 hover:text-accent-foreground hover:bg-accent-foreground/10"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-bold">{weather.temperature}°</span>
              <span className="text-lg opacity-80">C</span>
            </div>
            <p className="text-sm mt-1 capitalize opacity-90">
              {weather.description}
            </p>
            <p className="text-xs mt-1 opacity-70">
              Feels like {weather.feelsLike}°C
            </p>
          </div>
          <WeatherIcon className="w-16 h-16 opacity-90 animate-float" />
        </div>

        {weather.alerts && weather.alerts.length > 0 && (
          <div className="mt-3 p-2 rounded-lg bg-accent-foreground/10 border border-accent-foreground/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-medium">{weather.alerts[0].message}</span>
            </div>
          </div>
        )}

        <div className="flex gap-6 mt-4 pt-4 border-t border-accent-foreground/20">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 opacity-80" />
            <span className="text-sm">{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 opacity-80" />
            <span className="text-sm">{weather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <Sunrise className="w-4 h-4 opacity-80" />
            <span className="text-sm">{weather.sunrise}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sunset className="w-4 h-4 opacity-80" />
            <span className="text-sm">{weather.sunset}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">4-Day Forecast</p>
        <div className="grid grid-cols-4 gap-2">
          {weather.forecast.map((day) => {
            const DayIcon = weatherIcons[day.condition as keyof typeof weatherIcons] || Cloud;
            return (
              <div key={day.day} className="text-center">
                <p className="text-xs text-muted-foreground">{day.day}</p>
                <DayIcon className="w-5 h-5 mx-auto my-1 text-muted-foreground" />
                <p className="text-sm font-medium">{day.temp}°</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
