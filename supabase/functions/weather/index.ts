import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    
    if (!location) {
      console.log("No location provided, using default");
      return new Response(
        JSON.stringify({ error: "Location is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');
    if (!apiKey) {
      console.error("OpenWeatherMap API key not configured");
      return new Response(
        JSON.stringify({ error: "Weather service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching weather for location: ${location}`);

    // Get coordinates from location name
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)},IN&limit=1&appid=${apiKey}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData || geoData.length === 0) {
      console.log("Location not found, using default coordinates for India");
      // Default to a central India location if not found
      return new Response(
        JSON.stringify({ error: "Location not found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lat, lon, name, state } = geoData[0];
    console.log(`Found coordinates: ${lat}, ${lon} for ${name}, ${state}`);

    // Get current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    // Get 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    // Map weather conditions
    const mapCondition = (weatherId: number): string => {
      if (weatherId >= 200 && weatherId < 300) return 'rainy'; // Thunderstorm
      if (weatherId >= 300 && weatherId < 400) return 'rainy'; // Drizzle
      if (weatherId >= 500 && weatherId < 600) return 'rainy'; // Rain
      if (weatherId >= 600 && weatherId < 700) return 'cloudy'; // Snow
      if (weatherId >= 700 && weatherId < 800) return 'cloudy'; // Atmosphere (fog, etc.)
      if (weatherId === 800) return 'sunny'; // Clear
      if (weatherId > 800) return 'partly-cloudy'; // Clouds
      return 'partly-cloudy';
    };

    // Process forecast - get daily highs
    const dailyForecasts: { [key: string]: { temps: number[], condition: number } } = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    forecastData.list?.forEach((item: { dt: number; main: { temp: number }; weather: { id: number }[] }) => {
      const date = new Date(item.dt * 1000);
      const dayName = days[date.getDay()];
      
      if (!dailyForecasts[dayName]) {
        dailyForecasts[dayName] = { temps: [], condition: item.weather[0].id };
      }
      dailyForecasts[dayName].temps.push(item.main.temp);
    });

    const forecast = Object.entries(dailyForecasts)
      .slice(0, 4)
      .map(([day, data]) => ({
        day,
        temp: Math.round(Math.max(...data.temps)),
        condition: mapCondition(data.condition)
      }));

    // Check for weather alerts
    const alerts: { type: string; message: string }[] = [];
    
    // Heavy rain warning
    if (weatherData.weather[0].id >= 502 && weatherData.weather[0].id <= 531) {
      alerts.push({
        type: 'warning',
        message: 'Heavy rainfall expected. Protect your crops and delay irrigation.'
      });
    }
    
    // Extreme heat warning
    if (weatherData.main.temp > 40) {
      alerts.push({
        type: 'alert',
        message: 'Extreme heat alert! Increase irrigation and provide shade for sensitive crops.'
      });
    }
    
    // High winds
    if (weatherData.wind.speed > 10) {
      alerts.push({
        type: 'warning',
        message: 'Strong winds expected. Secure loose structures and young plants.'
      });
    }

    // Low humidity warning for agriculture
    if (weatherData.main.humidity < 30) {
      alerts.push({
        type: 'info',
        message: 'Low humidity. Consider increasing irrigation frequency.'
      });
    }

    const result = {
      temperature: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      condition: mapCondition(weatherData.weather[0].id),
      description: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
      location: `${name}${state ? `, ${state}` : ''}`,
      sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      forecast,
      alerts,
      lastUpdated: new Date().toISOString()
    };

    console.log("Weather data fetched successfully:", result.location);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error fetching weather:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch weather data" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
