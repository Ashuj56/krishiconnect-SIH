import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default coordinates for Indian states as fallback
const stateFallbacks: { [key: string]: { lat: number; lon: number; name: string } } = {
  'kerala': { lat: 10.8505, lon: 76.2711, name: 'Kerala' },
  'tamil nadu': { lat: 11.1271, lon: 78.6569, name: 'Tamil Nadu' },
  'karnataka': { lat: 15.3173, lon: 75.7139, name: 'Karnataka' },
  'andhra pradesh': { lat: 15.9129, lon: 79.7400, name: 'Andhra Pradesh' },
  'telangana': { lat: 18.1124, lon: 79.0193, name: 'Telangana' },
  'maharashtra': { lat: 19.7515, lon: 75.7139, name: 'Maharashtra' },
  'gujarat': { lat: 22.2587, lon: 71.1924, name: 'Gujarat' },
  'rajasthan': { lat: 27.0238, lon: 74.2179, name: 'Rajasthan' },
  'madhya pradesh': { lat: 22.9734, lon: 78.6569, name: 'Madhya Pradesh' },
  'uttar pradesh': { lat: 26.8467, lon: 80.9462, name: 'Uttar Pradesh' },
  'bihar': { lat: 25.0961, lon: 85.3131, name: 'Bihar' },
  'west bengal': { lat: 22.9868, lon: 87.8550, name: 'West Bengal' },
  'odisha': { lat: 20.9517, lon: 85.0985, name: 'Odisha' },
  'punjab': { lat: 31.1471, lon: 75.3412, name: 'Punjab' },
  'haryana': { lat: 29.0588, lon: 76.0856, name: 'Haryana' },
  'delhi': { lat: 28.6139, lon: 77.2090, name: 'Delhi' },
  'assam': { lat: 26.2006, lon: 92.9376, name: 'Assam' },
  'jharkhand': { lat: 23.6102, lon: 85.2799, name: 'Jharkhand' },
  'chhattisgarh': { lat: 21.2787, lon: 81.8661, name: 'Chhattisgarh' },
  'goa': { lat: 15.2993, lon: 74.1240, name: 'Goa' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    
    if (!location) {
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

    const cleanLocation = location.trim();
    console.log(`Fetching weather for location: "${cleanLocation}"`);

    let lat: number, lon: number, locationName: string, stateName: string = '';

    // Parse location - could be "Village", "Village, State" or "Village, State, Country"
    const locationParts = cleanLocation.split(',').map((p: string) => p.trim());
    const village = locationParts[0] || '';
    const state = locationParts[1] || '';
    const country = locationParts[2] || 'India';

    // Build search queries in order of specificity
    const searchQueries = [
      // Most specific: village, state, country
      state ? `${village},${state},IN` : `${village},IN`,
      // Try with just the village and India
      `${village},India`,
      // Try the state capital/major city if village not found
      state ? `${state},IN` : null,
    ].filter(Boolean);

    let geoResult = null;

    // Try each search query until we get a result
    for (const query of searchQueries) {
      try {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query as string)}&limit=5&appid=${apiKey}`;
        console.log(`Trying geocoding query: "${query}"`);
        
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();
        
        console.log(`Geocoding response:`, JSON.stringify(geoData));

        if (geoData && Array.isArray(geoData) && geoData.length > 0) {
          // Find best match - prefer Indian results
          const indianResult = geoData.find((r: { country: string }) => r.country === 'IN') || geoData[0];
          geoResult = indianResult;
          console.log(`Found location: ${geoResult.name}, ${geoResult.state || ''}, ${geoResult.country}`);
          break;
        }
      } catch (geoError) {
        console.error(`Geocoding error for query "${query}":`, geoError);
      }
    }

    if (geoResult) {
      lat = geoResult.lat;
      lon = geoResult.lon;
      locationName = geoResult.name;
      stateName = geoResult.state || '';
    } else {
      // Try state-level fallback
      const lowerState = (state || village).toLowerCase();
      const fallback = stateFallbacks[lowerState] || 
                      Object.entries(stateFallbacks).find(([key]) => lowerState.includes(key))?.[1];
      
      if (fallback) {
        lat = fallback.lat;
        lon = fallback.lon;
        locationName = village || fallback.name;
        stateName = fallback.name;
        console.log(`Using state fallback: ${locationName}, ${stateName}`);
      } else {
        // Default to central India
        lat = 20.5937;
        lon = 78.9629;
        locationName = village || 'India';
        stateName = state || '';
        console.log(`Using default India coordinates for: ${locationName}`);
      }
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

    // Process forecast
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

    // Weather alerts
    const alerts: { type: string; message: string }[] = [];
    
    if (weatherData.weather?.[0]?.id >= 502 && weatherData.weather[0].id <= 531) {
      alerts.push({ type: 'warning', message: 'Heavy rainfall expected. Protect your crops and delay irrigation.' });
    }
    
    if (weatherData.main?.temp > 40) {
      alerts.push({ type: 'alert', message: 'Extreme heat alert! Increase irrigation and provide shade for sensitive crops.' });
    }
    
    if (weatherData.main?.humidity < 30) {
      alerts.push({ type: 'info', message: 'Low humidity. Consider increasing irrigation frequency.' });
    }
    
    if (weatherData.wind?.speed > 10) {
      alerts.push({ type: 'warning', message: 'Strong winds expected. Secure loose structures and young plants.' });
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

    console.log("Weather fetched successfully for:", result.location);

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
