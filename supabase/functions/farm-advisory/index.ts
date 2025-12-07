import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Advisory {
  id: string;
  type: "warning" | "danger" | "info";
  category: string;
  icon: string;
  title: string;
  titleMl: string;
  description: string;
  descriptionMl: string;
  priority: string;
  crop?: string;
  symptoms?: string;
  control?: string;
  daysSinceSowing?: number;
}

// Crop Calendar with growth stages
const cropCalendars: Record<string, { stages: Array<{ name: string; nameEn: string; dayStart: number; dayEnd: number; operations: string; operationsMl: string; priority: string }> }> = {
  'rice': {
    stages: [
      { name: 'മുളയ്ക്കൽ', nameEn: 'Germination', dayStart: 0, dayEnd: 10, operations: 'Maintain water level 2-3cm, ensure drainage', operationsMl: 'വെള്ളത്തിൻ്റെ അളവ് 2-3 സെ.മീ. നിലനിർത്തുക', priority: 'high' },
      { name: 'നാറ്റുപറിക്കൽ', nameEn: 'Transplanting', dayStart: 21, dayEnd: 30, operations: 'Transplant 2-3 seedlings per hill, apply basal fertilizer', operationsMl: 'ഓരോ കുഴിയിലും 2-3 തൈകൾ നടുക', priority: 'high' },
      { name: 'വളർച്ച ഘട്ടം', nameEn: 'Vegetative', dayStart: 31, dayEnd: 55, operations: 'Apply Urea 40kg/acre, maintain 5cm water', operationsMl: 'യൂറിയ 40കി.ഗ്രാം/ഏക്കർ നൽകുക', priority: 'medium' },
      { name: 'കതിർ വരൽ', nameEn: 'Flowering', dayStart: 56, dayEnd: 75, operations: 'Apply 2nd top dressing, watch for pests', operationsMl: 'രണ്ടാം മേൽവളം നൽകുക', priority: 'high' },
      { name: 'വിളവെടുപ്പ്', nameEn: 'Harvest', dayStart: 110, dayEnd: 130, operations: 'Harvest when 80% grains golden', operationsMl: '80% ധാന്യങ്ങൾ സ്വർണ്ണനിറമായാൽ വിളവെടുക്കുക', priority: 'high' },
    ]
  },
  'coconut': {
    stages: [
      { name: 'പുതിയ തൈ', nameEn: 'Seedling', dayStart: 0, dayEnd: 365, operations: 'Water daily, apply organic manure', operationsMl: 'ദിവസവും നനയ്ക്കുക, ജൈവവളം ചേർക്കുക', priority: 'medium' },
      { name: 'യുവ മരം', nameEn: 'Young Palm', dayStart: 366, dayEnd: 1095, operations: 'Apply NPK 3 times yearly', operationsMl: 'വർഷത്തിൽ 3 തവണ NPK വളം നൽകുക', priority: 'medium' },
      { name: 'ഫലം കായ്ക്കുന്നു', nameEn: 'Bearing', dayStart: 1096, dayEnd: 99999, operations: 'Harvest every 45 days', operationsMl: '45 ദിവസം കൂടുമ്പോൾ വിളവെടുപ്പ്', priority: 'low' },
    ]
  },
  'banana': {
    stages: [
      { name: 'മുളയ്ക്കൽ', nameEn: 'Sprouting', dayStart: 0, dayEnd: 30, operations: 'Ensure drainage, light irrigation', operationsMl: 'നല്ല നീർവാർച്ച ഉറപ്പാക്കുക', priority: 'medium' },
      { name: 'വളർച്ച ഘട്ടം', nameEn: 'Vegetative', dayStart: 31, dayEnd: 150, operations: 'Apply Urea 100g + Potash 200g monthly', operationsMl: 'പ്രതിമാസം യൂറിയ + പൊട്ടാഷ് ചേർക്കുക', priority: 'high' },
      { name: 'കുല വരൽ', nameEn: 'Flowering', dayStart: 151, dayEnd: 180, operations: 'Support with bamboo, remove male bud', operationsMl: 'മുള കൊണ്ട് താങ്ങുക', priority: 'high' },
      { name: 'വിളവെടുപ്പ്', nameEn: 'Harvest', dayStart: 270, dayEnd: 330, operations: 'Harvest when fingers full but green', operationsMl: 'വിരലുകൾ നിറഞ്ഞാൽ വിളവെടുക്കുക', priority: 'high' },
    ]
  },
  'pepper': {
    stages: [
      { name: 'വേരുപിടിക്കൽ', nameEn: 'Establishment', dayStart: 0, dayEnd: 90, operations: 'Regular watering, 50% shade', operationsMl: 'പതിവായി നനയ്ക്കുക, 50% തണൽ', priority: 'high' },
      { name: 'വളർച്ച', nameEn: 'Growth', dayStart: 91, dayEnd: 730, operations: 'Train on support, apply manure yearly', operationsMl: 'താങ്ങിൽ പടർത്തുക', priority: 'medium' },
      { name: 'പൂവിടൽ', nameEn: 'Flowering', dayStart: 1095, dayEnd: 99999, operations: 'Apply NPK, spray Bordeaux mixture', operationsMl: 'NPK ചേർക്കുക, ബോർഡോ തളിക്കുക', priority: 'high' },
    ]
  },
};

// Pest Knowledge Base
const pestKnowledge = [
  { crop: 'rice', pest: 'Brown Plant Hopper', pestMl: 'ബ്രൗൺ പ്ലാൻ്റ് ഹോപ്പർ', humidity: 70, prevention: 'Avoid excess nitrogen', preventionMl: 'അമിത നൈട്രജൻ ഒഴിവാക്കുക', riskLevel: 'high' },
  { crop: 'rice', pest: 'Leaf Blast', pestMl: 'ഇല ബ്ലാസ്റ്റ്', humidity: 80, prevention: 'Balanced fertilization', preventionMl: 'സന്തുലിത വളപ്രയോഗം', riskLevel: 'high' },
  { crop: 'banana', pest: 'Sigatoka Leaf Spot', pestMl: 'സിഗടോക്ക ഇല പുള്ളി', humidity: 75, prevention: 'Remove infected leaves', preventionMl: 'രോഗബാധിത ഇലകൾ നീക്കുക', riskLevel: 'medium' },
  { crop: 'coconut', pest: 'Rhinoceros Beetle', pestMl: 'കാണ്ടാമൃഗ വണ്ട്', humidity: 70, prevention: 'Clean breeding sites', preventionMl: 'പ്രജനന സ്ഥലങ്ങൾ വൃത്തിയാക്കുക', riskLevel: 'high' },
  { crop: 'pepper', pest: 'Quick Wilt', pestMl: 'പെട്ടെന്നുള്ള വാട്ടം', humidity: 80, prevention: 'Improve drainage', preventionMl: 'നീർവാർച്ച മെച്ചപ്പെടുത്തുക', riskLevel: 'high' },
];

function calculateCropStage(cropName: string, sowingDate: string): any {
  if (!cropName || !sowingDate) return null;
  
  const normalizedName = cropName.toLowerCase().trim();
  const matchedKey = Object.keys(cropCalendars).find(key => 
    normalizedName.includes(key) || key.includes(normalizedName)
  );
  
  if (!matchedKey) return null;
  const calendar = cropCalendars[matchedKey];
  
  const sowing = new Date(sowingDate);
  const today = new Date();
  const daysSinceSowing = Math.floor((today.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceSowing < 0) return null;
  
  for (const stage of calendar.stages) {
    if (daysSinceSowing >= stage.dayStart && daysSinceSowing <= stage.dayEnd) {
      return { ...stage, daysSinceSowing, cropName };
    }
  }
  
  const lastStage = calendar.stages[calendar.stages.length - 1];
  return { ...lastStage, daysSinceSowing, cropName };
}

function getPestRisks(crops: any[], humidity: number): any[] {
  if (!crops || crops.length === 0) return [];
  
  return pestKnowledge.filter(pest => {
    const cropMatch = crops.some(c => c?.name?.toLowerCase()?.includes(pest.crop));
    const humidityRisk = humidity >= pest.humidity;
    return cropMatch && humidityRisk;
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, language = 'en' } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        success: true, 
        advisories: [{
          id: 'welcome',
          type: 'info',
          category: 'general',
          icon: 'Lightbulb',
          title: 'Welcome to Smart Advisory',
          titleMl: 'സ്മാർട്ട് ഉപദേശത്തിലേക്ക് സ്വാഗതം',
          description: 'Sign in to get personalized recommendations.',
          descriptionMl: 'വ്യക്തിഗത ശുപാർശകൾക്കായി സൈൻ ഇൻ ചെയ്യുക.',
          priority: 'low',
        }]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const isMalayalam = language === 'ml';
    const advisories: Advisory[] = [];
    
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    // Fetch farm
    const { data: farm } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Fetch crops
    const { data: crops } = await supabase
      .from('crops')
      .select('*')
      .eq('user_id', userId);
    
    // Fetch recent activities
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', sevenDaysAgo)
      .order('activity_date', { ascending: false });
    
    // Default humidity for Kerala
    const humidity = 75;
    const temp = 28;
    
    // Generate crop stage advisories
    if (crops && crops.length > 0) {
      for (const crop of crops) {
        if (crop?.name && crop?.planting_date) {
          const stageInfo = calculateCropStage(crop.name, crop.planting_date);
          if (stageInfo) {
            advisories.push({
              id: `stage-${crop.id}`,
              type: stageInfo.priority === 'high' ? 'warning' : 'info',
              category: 'crop_stage',
              icon: 'Sprout',
              title: isMalayalam ? `${crop.name}: ${stageInfo.name}` : `${crop.name}: ${stageInfo.nameEn}`,
              titleMl: `${crop.name}: ${stageInfo.name}`,
              description: isMalayalam ? stageInfo.operationsMl : stageInfo.operations,
              descriptionMl: stageInfo.operationsMl,
              daysSinceSowing: stageInfo.daysSinceSowing,
              priority: stageInfo.priority,
              crop: crop.name,
            });
          }
        }
      }
      
      // Pest risk advisories
      const pestRisks = getPestRisks(crops, humidity);
      for (const risk of pestRisks.slice(0, 2)) {
        advisories.push({
          id: `pest-${risk.pest.replace(/\s/g, '-').toLowerCase()}`,
          type: 'danger',
          category: 'pest',
          icon: 'Bug',
          title: isMalayalam ? `${risk.pestMl} അപകട സാധ്യത` : `${risk.pest} Risk`,
          titleMl: `${risk.pestMl} അപകട സാധ്യത`,
          description: isMalayalam ? risk.preventionMl : risk.prevention,
          descriptionMl: risk.preventionMl,
          crop: risk.crop,
          priority: risk.riskLevel,
        });
      }
    }
    
    // Weather advisory (generic for Kerala)
    if (humidity > 70) {
      advisories.push({
        id: 'weather-humidity',
        type: 'warning',
        category: 'weather',
        icon: 'Droplets',
        title: isMalayalam ? 'ഉയർന്ന ഈർപ്പം' : 'High Humidity Alert',
        titleMl: 'ഉയർന്ന ഈർപ്പം',
        description: isMalayalam
          ? 'കുമിൾ രോഗ സാധ്യത, വായു സഞ്ചാരം ഉറപ്പാക്കുക'
          : 'Fungal disease risk, ensure good ventilation',
        descriptionMl: 'കുമിൾ രോഗ സാധ്യത, വായു സഞ്ചാരം ഉറപ്പാക്കുക',
        priority: 'medium',
      });
    }
    
    // Activity-based advisories
    if (activities && activities.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const recentIrrigation = activities.find(
        a => a?.activity_type === 'irrigation' && (a?.activity_date === today || a?.activity_date === yesterday)
      );
      
      if (recentIrrigation) {
        advisories.push({
          id: 'activity-irrigation',
          type: 'info',
          category: 'activity',
          icon: 'Droplet',
          title: isMalayalam ? 'അടുത്തിടെ ജലസേചനം' : 'Recent Irrigation',
          titleMl: 'അടുത്തിടെ ജലസേചനം',
          description: isMalayalam
            ? 'അടുത്ത ജലസേചനം ഒഴിവാക്കാം'
            : 'Skip next irrigation cycle',
          descriptionMl: 'അടുത്ത ജലസേചനം ഒഴിവാക്കാം',
          priority: 'low',
        });
      }
    }
    
    // Default advisory if none generated
    if (advisories.length === 0) {
      advisories.push({
        id: 'welcome',
        type: 'info',
        category: 'general',
        icon: 'Lightbulb',
        title: isMalayalam ? 'സ്മാർട്ട് ഉപദേശം' : 'Smart Advisory',
        titleMl: 'സ്മാർട്ട് ഉപദേശം',
        description: isMalayalam 
          ? 'വിളകൾ വിതയ്ക്കൽ തീയതികളോടെ ചേർത്ത് വ്യക്തിഗത ശുപാർശകൾ നേടുക'
          : 'Add crops with sowing dates to get personalized recommendations',
        descriptionMl: 'വിളകൾ വിതയ്ക്കൽ തീയതികളോടെ ചേർത്ത് വ്യക്തിഗത ശുപാർശകൾ നേടുക',
        priority: 'low',
      });
    }
    
    // Sort by priority
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    advisories.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));
    
    return new Response(JSON.stringify({
      success: true,
      advisories: advisories.slice(0, 6),
      farmerName: profile?.full_name,
      farmName: farm?.name,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    console.error('Farm advisory error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: message,
      advisories: [{
        id: 'error-fallback',
        type: 'info',
        category: 'general',
        icon: 'Lightbulb',
        title: 'Advisory Service',
        titleMl: 'ഉപദേശ സേവനം',
        description: 'Add crops to get personalized advice',
        descriptionMl: 'വ്യക്തിഗത ഉപദേശത്തിനായി വിളകൾ ചേർക്കുക',
        priority: 'low',
      }]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
