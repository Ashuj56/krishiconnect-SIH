import { Cloud, Droplets, Wind, Sun, CloudRain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WeatherData {
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
  humidity: number;
  windSpeed: number;
  location: string;
  forecast: { day: string; temp: number; condition: string }[];
}

const mockWeather: WeatherData = {
  temperature: 28,
  condition: "partly-cloudy",
  humidity: 75,
  windSpeed: 12,
  location: "Thrissur, Kerala",
  forecast: [
    { day: "Mon", temp: 29, condition: "sunny" },
    { day: "Tue", temp: 27, condition: "rainy" },
    { day: "Wed", temp: 28, condition: "cloudy" },
    { day: "Thu", temp: 30, condition: "sunny" },
  ],
};

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  "partly-cloudy": Cloud,
};

export function WeatherWidget() {
  const WeatherIcon = weatherIcons[mockWeather.condition];

  return (
    <Card className="overflow-hidden">
      <div className="gradient-weather p-5 text-accent-foreground">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-90">{mockWeather.location}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-bold">{mockWeather.temperature}°</span>
              <span className="text-lg opacity-80">C</span>
            </div>
            <p className="text-sm mt-1 capitalize opacity-90">
              {mockWeather.condition.replace("-", " ")}
            </p>
          </div>
          <WeatherIcon className="w-16 h-16 opacity-90 animate-float" />
        </div>

        <div className="flex gap-6 mt-4 pt-4 border-t border-accent-foreground/20">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 opacity-80" />
            <span className="text-sm">{mockWeather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 opacity-80" />
            <span className="text-sm">{mockWeather.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">4-Day Forecast</p>
        <div className="grid grid-cols-4 gap-2">
          {mockWeather.forecast.map((day) => {
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
