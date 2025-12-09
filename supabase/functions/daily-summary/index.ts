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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { farmer_id } = await req.json();
    
    console.log('Generating daily summary for farmer:', farmer_id);
    
    // Fetch farmer profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, location')
      .eq('id', farmer_id)
      .single();
    
    // Fetch farm info
    const { data: farms } = await supabase
      .from('farms')
      .select('location')
      .eq('user_id', farmer_id)
      .limit(1);
    
    const location = farms?.[0]?.location || profile?.location || 'Kerala';
    
    // Fetch weather
    let weatherSummary = 'Weather data unavailable';
    try {
      const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)},Kerala,IN&limit=1&appid=${openWeatherApiKey}`;
      const geoResponse = await fetch(geocodeUrl);
      const geoData = await geoResponse.json();
      
      if (geoData && geoData.length > 0) {
        const { lat, lon } = geoData[0];
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        
        weatherSummary = `${weatherData.main?.temp?.toFixed(1)}°C, ${weatherData.weather?.[0]?.description || 'Clear'}`;
      }
    } catch (e) {
      console.error('Weather error:', e);
    }
    
    // Fetch today's tasks
    const today = new Date().toISOString().split('T')[0];
    const { data: tasks } = await supabase
      .from('tasks')
      .select('title, priority')
      .eq('user_id', farmer_id)
      .eq('scheduled_date', today)
      .eq('completed', false);
    
    const taskCount = tasks?.length || 0;
    const highPriorityTasks = tasks?.filter(t => t.priority === 'high').length || 0;
    
    // Fetch crop reminders
    const { data: crops } = await supabase
      .from('crops')
      .select('name, planting_date, expected_harvest_date')
      .eq('user_id', farmer_id);
    
    let cropReminder = '';
    if (crops && crops.length > 0) {
      const harvestingSoon = crops.filter(c => {
        if (!c.expected_harvest_date) return false;
        const harvestDate = new Date(c.expected_harvest_date);
        const daysToHarvest = Math.ceil((harvestDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysToHarvest > 0 && daysToHarvest <= 7;
      });
      
      if (harvestingSoon.length > 0) {
        cropReminder = `${harvestingSoon.map(c => c.name).join(', ')} ready for harvest soon`;
      }
    }
    
    // Fetch upcoming scheme deadlines
    const { data: schemes } = await supabase
      .from('scheme_deadlines')
      .select('title, deadline_date')
      .gte('deadline_date', today)
      .order('deadline_date', { ascending: true })
      .limit(2);
    
    let schemeReminder = '';
    if (schemes && schemes.length > 0) {
      const nearDeadlines = schemes.filter(s => {
        const deadline = new Date(s.deadline_date);
        const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 7;
      });
      
      if (nearDeadlines.length > 0) {
        schemeReminder = nearDeadlines.map(s => s.title).join(', ') + ' deadline approaching';
      }
    }
    
    // Build summary message
    const summaryParts = [
      `Good morning! Here's your daily summary:`,
      `Weather: ${weatherSummary}`,
    ];
    
    if (taskCount > 0) {
      summaryParts.push(`Tasks today: ${taskCount} (${highPriorityTasks} high priority)`);
    }
    
    if (cropReminder) {
      summaryParts.push(cropReminder);
    }
    
    if (schemeReminder) {
      summaryParts.push(schemeReminder);
    }
    
    const summaryMessage = summaryParts.join('\n');
    
    // Insert daily summary notification
    await supabase.from('notifications').insert({
      user_id: farmer_id,
      title: 'Daily Summary',
      message: summaryMessage,
      type: 'info',
      category: 'general',
      read: false
    });
    
    console.log('Daily summary generated successfully');
    
    return new Response(JSON.stringify({ 
      success: true,
      summary: summaryMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    console.error('Daily summary error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
