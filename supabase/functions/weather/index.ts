import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default coordinates for major Indian cities as fallback
const fallbackLocations: { [key: string]: { lat: number; lon: number; name: string; state: string } } = {
  'kerala': { lat: 10.8505, lon: 76.2711, name: 'Kerala', state: 'Kerala' },
  'thrissur': { lat: 10.5276, lon: 76.2144, name: 'Thrissur', state: 'Kerala' },
  'munnar': { lat: 10.0889, lon: 77.0595, name: 'Munnar', state: 'Kerala' },
  'kochi': { lat: 9.9312, lon: 76.2673, name: 'Kochi', state: 'Kerala' },
  'delhi': { lat: 28.6139, lon: 77.2090, name: 'Delhi', state: 'Delhi' },
  'mumbai': { lat: 19.0760, lon: 72.8777, name: 'Mumbai', state: 'Maharashtra' },
  'bangalore': { lat: 12.9716, lon: 77.5946, name: 'Bangalore', state: 'Karnataka' },
  'chennai': { lat: 13.0827, lon: 80.2707, name: 'Chennai', state: 'Tamil Nadu' },
  'hyderabad': { lat: 17.3850, lon: 78.4867, name: 'Hyderabad', state: 'Telangana' },
  'default': { lat: 20.5937, lon: 78.9629, name: 'India', state: '' },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    
    if (!location) {
      console.log("No location provided");
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

    const cleanLocation = location.trim().toLowerCase();
    console.log(`Fetching weather for location: "${cleanLocation}"`);

    let lat: number, lon: number, locationName: string, stateName: string;

    // Try geocoding first
    try {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cleanLocation)},India&limit=5&appid=${apiKey}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();
      
      console.log(`Geocoding response for "${cleanLocation}":`, JSON.stringify(geoData));

      if (geoData && geoData.length > 0) {
        lat = geoData[0].lat;
        lon = geoData[0].lon;
        locationName = geoData[0].name;
        stateName = geoData[0].state || '';
        console.log(`Found coordinates: ${lat}, ${lon} for ${locationName}, ${stateName}`);
      } else {
        // Try fallback locations
        const fallback = fallbackLocations[cleanLocation] || 
                        Object.entries(fallbackLocations).find(([key]) => cleanLocation.includes(key))?.[1] ||
                        fallbackLocations['default'];
        
        lat = fallback.lat;
        lon = fallback.lon;
        locationName = fallback.name;
        stateName = fallback.state;
        console.log(`Using fallback coordinates: ${lat}, ${lon} for ${locationName}`);
      }
    } catch (geoError) {
      console.error("Geocoding error:", geoError);
      // Use default India coordinates
      const fallback = fallbackLocations['default'];
      lat = fallback.lat;
      lon = fallback.lon;
      locationName = fallback.name;
      stateName = fallback.state;
    }

    // Get current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    if (weatherData.cod && weatherData.cod !== 200) {
      console.error("Weather API error:", weatherData);
      throw new Error(weatherData.message || "Weather API error");
    }

    // Get 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    // Map weather conditions
    const mapCondition = (weatherId: number): string => {
      if (weatherId >= 200 && weatherId < 300) return 'rainy';
      if (weatherId >= 300 && weatherId < 400) return 'rainy';
      if (weatherId >= 500 && weatherId < 600) return 'rainy';
      if (weatherId >= 600 && weatherId < 700) return 'cloudy';
      if (weatherId >= 700 && weatherId < 800) return 'cloudy';
      if (weatherId === 800) return 'sunny';
      if (weatherId > 800) return 'partly-cloudy';
      return 'partly-cloudy';
    };

    // Process forecast - get daily highs
    const dailyForecasts: { [key: string]: { temps: number[], condition: number } } = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (forecastData.list) {
      forecastData.list.forEach((item: { dt: number; main: { temp: number }; weather: { id: number }[] }) => {
        const date = new Date(item.dt * 1000);
        const dayName = days[date.getDay()];
        
        if (!dailyForecasts[dayName]) {
          dailyForecasts[dayName] = { temps: [], condition: item.weather[0].id };
        }
        dailyForecasts[dayName].temps.push(item.main.temp);
      });
    }

    const forecast = Object.entries(dailyForecasts)
      .slice(0, 4)
      .map(([day, data]) => ({
        day,
        temp: Math.round(Math.max(...data.temps)),
        condition: mapCondition(data.condition)
      }));

    // Check for weather alerts
    const alerts: { type: string; message: string }[] = [];
    
    if (weatherData.weather && weatherData.weather[0]) {
      // Heavy rain warning
      if (weatherData.weather[0].id >= 502 && weatherData.weather[0].id <= 531) {
        alerts.push({
          type: 'warning',
          message: 'Heavy rainfall expected. Protect your crops and delay irrigation.'
        });
      }
    }
    
    if (weatherData.main) {
      // Extreme heat warning
      if (weatherData.main.temp > 40) {
        alerts.push({
          type: 'alert',
          message: 'Extreme heat alert! Increase irrigation and provide shade for sensitive crops.'
        });
      }
      
      // Low humidity warning
      if (weatherData.main.humidity < 30) {
        alerts.push({
          type: 'info',
          message: 'Low humidity. Consider increasing irrigation frequency.'
        });
      }
    }
    
    // High winds
    if (weatherData.wind && weatherData.wind.speed > 10) {
      alerts.push({
        type: 'warning',
        message: 'Strong winds expected. Secure loose structures and young plants.'
      });
    }

    const result = {
      temperature: Math.round(weatherData.main?.temp || 0),
      feelsLike: Math.round(weatherData.main?.feels_like || 0),
      condition: mapCondition(weatherData.weather?.[0]?.id || 800),
      description: weatherData.weather?.[0]?.description || 'Clear',
      humidity: weatherData.main?.humidity || 0,
      windSpeed: Math.round((weatherData.wind?.speed || 0) * 3.6),
      location: `${locationName}${stateName ? `, ${stateName}` : ''}`,
      sunrise: weatherData.sys?.sunrise 
        ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : '06:00',
      sunset: weatherData.sys?.sunset 
        ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : '18:00',
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
