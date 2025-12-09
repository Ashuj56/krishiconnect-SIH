import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openWeatherApiKey = Deno.env.get('OPENWEATHERMAP_API_KEY')!;

interface FarmerContext {
  id: string;
  location: string;
  district: string;
  crops: Array<{
    id: string;
    name: string;
    planting_date: string;
    expected_harvest_date: string;
  }>;
}

// Get current season based on Kerala agricultural calendar
function getCurrentSeason(): { name: string; alerts: string[] } {
  const month = new Date().getMonth() + 1;
  
  if (month >= 6 && month <= 10) {
    return {
      name: 'Kharif',
      alerts: [
        'Kharif season active - ideal for paddy transplanting',
        'Monitor for excess rainfall and waterlogging',
        'Prepare drainage systems for monsoon rains'
      ]
    };
  } else if (month >= 11 || month <= 3) {
    return {
      name: 'Rabi',
      alerts: [
        'Rabi season - suitable for vegetables and pulses',
        'Ensure adequate irrigation as rainfall decreases',
        'Watch for pest attacks in dry conditions'
      ]
    };
  } else {
    return {
      name: 'Summer',
      alerts: [
        'Summer season - focus on irrigation management',
        'Mulching recommended to conserve soil moisture',
        'Consider shade crops and heat-tolerant varieties'
      ]
    };
  }
}

// Calculate Days After Sowing
function calculateDAS(plantingDate: string): number {
  const planting = new Date(plantingDate);
  const today = new Date();
  const diffTime = today.getTime() - planting.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Get crop schedule operations for given DAS
function getScheduledOperations(schedule: Record<string, string[]>, das: number): string[] {
  const operations: string[] = [];
  
  for (const [range, ops] of Object.entries(schedule)) {
    const [start, end] = range.split('-').map(Number);
    if (das >= start && das <= end) {
      operations.push(...ops);
    }
  }
  
  return operations;
}

// Fetch weather data for a location
async function fetchWeather(location: string): Promise<any> {
  try {
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)},Kerala,IN&limit=1&appid=${openWeatherApiKey}`;
    const geoResponse = await fetch(geocodeUrl);
    const geoData = await geoResponse.json();
    
    if (!geoData || geoData.length === 0) {
      return null;
    }
    
    const { lat, lon } = geoData[0];
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();
    
    return { current: weatherData, forecast: forecastData };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}

// Generate weather-based alerts
function generateWeatherAlerts(weatherData: any): Array<{ title: string; message: string; category: string }> {
  const alerts: Array<{ title: string; message: string; category: string }> = [];
  
  if (!weatherData || !weatherData.current) return alerts;
  
  const { current, forecast } = weatherData;
  const temp = current.main?.temp;
  const weatherId = current.weather?.[0]?.id;
  const windSpeed = current.wind?.speed;
  const humidity = current.main?.humidity;
  
  // Temperature alerts
  if (temp > 38) {
    alerts.push({
      title: 'Extreme Heat Warning',
      message: `Temperature is ${temp}°C. Increase irrigation and provide shade for sensitive crops.`,
      category: 'weather'
    });
  } else if (temp > 35) {
    alerts.push({
      title: 'Heat Advisory',
      message: `High temperature of ${temp}°C expected. Consider evening irrigation.`,
      category: 'weather'
    });
  }
  
  // Rain alerts
  if (weatherId >= 200 && weatherId < 300) {
    alerts.push({
      title: 'Thunderstorm Alert',
      message: 'Thunderstorms expected. Avoid spraying pesticides and secure tall plants.',
      category: 'weather'
    });
  } else if (weatherId >= 500 && weatherId < 600) {
    if (weatherId >= 502) {
      alerts.push({
        title: 'Heavy Rainfall Warning',
        message: 'Heavy rain expected. Check drainage and avoid field operations.',
        category: 'weather'
      });
    } else {
      alerts.push({
        title: 'Rain Expected',
        message: 'Light to moderate rain expected. Postpone pesticide application.',
        category: 'weather'
      });
    }
  }
  
  // Wind alerts
  if (windSpeed > 15) {
    alerts.push({
      title: 'High Wind Alert',
      message: `Wind speed is ${windSpeed} m/s. Secure banana plants and tall crops.`,
      category: 'weather'
    });
  }
  
  // Humidity alerts
  if (humidity > 85) {
    alerts.push({
      title: 'High Humidity Warning',
      message: 'High humidity conditions. Watch for fungal diseases and leaf infections.',
      category: 'weather'
    });
  }
  
  // Check forecast for upcoming rain
  if (forecast?.list) {
    const next6Hours = forecast.list.slice(0, 2);
    const rainExpected = next6Hours.some((item: any) => 
      item.weather?.[0]?.id >= 500 && item.weather?.[0]?.id < 600
    );
    
    if (rainExpected && !alerts.some(a => a.title.includes('Rain'))) {
      alerts.push({
        title: 'Rain Expected Soon',
        message: 'Rain expected in the next few hours. Plan field activities accordingly.',
        category: 'weather'
      });
    }
  }
  
  return alerts;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { farmer_id, alert_type } = await req.json();
    
    console.log(`Processing ${alert_type || 'all'} alerts for farmer:`, farmer_id);
    
    const generatedAlerts: Array<{ title: string; message: string; category: string; action_url?: string }> = [];
    
    // Fetch farmer context
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, location')
      .eq('id', farmer_id)
      .single();
    
    const { data: farms } = await supabase
      .from('farms')
      .select('id, name, location, soil_type')
      .eq('user_id', farmer_id);
    
    const { data: crops } = await supabase
      .from('crops')
      .select('id, name, planting_date, expected_harvest_date, current_stage')
      .eq('user_id', farmer_id);
    
    const location = farms?.[0]?.location || profile?.location || 'Kerala';
    const district = location.split(',')[0] || 'Thrissur';
    
    // 1. Weather Alerts
    if (!alert_type || alert_type === 'weather') {
      const weatherData = await fetchWeather(location);
      const weatherAlerts = generateWeatherAlerts(weatherData);
      generatedAlerts.push(...weatherAlerts);
    }
    
    // 2. Crop Operation Reminders
    if (!alert_type || alert_type === 'crop') {
      const { data: schedules } = await supabase
        .from('crop_schedules')
        .select('crop_name, schedule');
      
      const scheduleMap = new Map(schedules?.map(s => [s.crop_name.toLowerCase(), s.schedule]) || []);
      
      if (crops) {
        for (const crop of crops) {
          if (!crop.planting_date) continue;
          
          const das = calculateDAS(crop.planting_date);
          const schedule = scheduleMap.get(crop.name.toLowerCase());
          
          if (schedule) {
            const operations = getScheduledOperations(schedule as Record<string, string[]>, das);
            
            if (operations.length > 0) {
              generatedAlerts.push({
                title: `${crop.name} - Day ${das}`,
                message: `Recommended: ${operations.join(', ')}`,
                category: 'crop',
                action_url: '/farm-profile'
              });
            }
          }
          
          // Harvest reminder
          if (crop.expected_harvest_date) {
            const harvestDate = new Date(crop.expected_harvest_date);
            const today = new Date();
            const daysToHarvest = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysToHarvest > 0 && daysToHarvest <= 7) {
              generatedAlerts.push({
                title: `${crop.name} Harvest Soon`,
                message: `Harvest expected in ${daysToHarvest} days. Prepare equipment and buyers.`,
                category: 'crop',
                action_url: '/smart-sale'
              });
            }
          }
        }
      }
    }
    
    // 3. Seasonal Alerts
    if (!alert_type || alert_type === 'season') {
      const season = getCurrentSeason();
      generatedAlerts.push({
        title: `${season.name} Season Active`,
        message: season.alerts[0],
        category: 'season'
      });
    }
    
    // 4. Scheme Deadline Alerts
    if (!alert_type || alert_type === 'scheme') {
      const { data: schemes } = await supabase
        .from('scheme_deadlines')
        .select('*')
        .gte('deadline_date', new Date().toISOString().split('T')[0])
        .order('deadline_date', { ascending: true })
        .limit(5);
      
      if (schemes) {
        for (const scheme of schemes) {
          const deadline = new Date(scheme.deadline_date);
          const today = new Date();
          const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysRemaining <= 7) {
            generatedAlerts.push({
              title: `${scheme.title} Deadline`,
              message: `${daysRemaining} days left to apply. ${scheme.description || ''}`,
              category: 'scheme',
              action_url: scheme.scheme_url || '/schemes'
            });
          }
        }
      }
    }
    
    // 5. Market Price Alerts
    if (!alert_type || alert_type === 'market') {
      const { data: priceHistory } = await supabase
        .from('market_price_history')
        .select('*')
        .eq('district', district)
        .order('recorded_date', { ascending: false })
        .limit(50);
      
      if (priceHistory && priceHistory.length > 0) {
        // Group by crop and check for significant changes
        const cropPrices = new Map<string, number[]>();
        priceHistory.forEach(p => {
          if (!cropPrices.has(p.crop)) {
            cropPrices.set(p.crop, []);
          }
          cropPrices.get(p.crop)!.push(p.price);
        });
        
        cropPrices.forEach((prices, crop) => {
          if (prices.length >= 2) {
            const change = ((prices[0] - prices[1]) / prices[1]) * 100;
            
            if (change > 10) {
              generatedAlerts.push({
                title: `${crop} Price Rising`,
                message: `Price up ${change.toFixed(1)}%. Consider selling now.`,
                category: 'market',
                action_url: '/market'
              });
            } else if (change < -10) {
              generatedAlerts.push({
                title: `${crop} Price Falling`,
                message: `Price down ${Math.abs(change).toFixed(1)}%. Consider waiting or value-added processing.`,
                category: 'market',
                action_url: '/smart-sale'
              });
            }
          }
        });
      }
    }
    
    // 6. Activity-Based Reminders
    if (!alert_type || alert_type === 'activity') {
      const { data: recentActivities } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', farmer_id)
        .order('activity_date', { ascending: false })
        .limit(10);
      
      if (recentActivities) {
        for (const activity of recentActivities) {
          const activityDate = new Date(activity.activity_date);
          const today = new Date();
          const daysSince = Math.ceil((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Fertilizer follow-up
          if (activity.activity_type?.toLowerCase().includes('fertiliz') && daysSince >= 21 && daysSince <= 25) {
            generatedAlerts.push({
              title: 'Fertilizer Follow-up',
              message: `It's been ${daysSince} days since last fertilizer application. Consider next application.`,
              category: 'activity',
              action_url: '/activities'
            });
          }
          
          // Irrigation follow-up
          if (activity.activity_type?.toLowerCase().includes('irrigat') && daysSince >= 3 && daysSince <= 5) {
            generatedAlerts.push({
              title: 'Irrigation Reminder',
              message: `Last irrigation was ${daysSince} days ago. Check soil moisture.`,
              category: 'activity',
              action_url: '/activities'
            });
          }
          
          // Pesticide follow-up
          if (activity.activity_type?.toLowerCase().includes('pesticid') && daysSince >= 14 && daysSince <= 18) {
            generatedAlerts.push({
              title: 'Pest Monitoring',
              message: `It's been ${daysSince} days since pesticide application. Inspect crops for pests.`,
              category: 'activity',
              action_url: '/scanner'
            });
          }
        }
      }
    }
    
    // Insert generated alerts into alerts table
    if (generatedAlerts.length > 0) {
      // Check for duplicate alerts in last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      for (const alert of generatedAlerts) {
        const { data: existing } = await supabase
          .from('alerts')
          .select('id')
          .eq('farmer_id', farmer_id)
          .eq('title', alert.title)
          .gte('created_at', yesterday)
          .limit(1);
        
        if (!existing || existing.length === 0) {
          await supabase.from('alerts').insert({
            farmer_id,
            title: alert.title,
            message: alert.message,
            category: alert.category,
            action_url: alert.action_url,
            is_read: false
          });
        }
      }
    }
    
    console.log(`Generated ${generatedAlerts.length} alerts`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      alerts_count: generatedAlerts.length,
      alerts: generatedAlerts
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    console.error('Smart alerts error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
