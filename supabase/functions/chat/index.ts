import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  keralaCropCalendars,
  keralaPestManagement,
  keralaFertilizerRecommendations,
  keralaDistrictSoilData,
  keralaWeatherAdvisories,
  getCropCalendar,
  calculateCropStage,
  getPestManagement,
  getDistrictSoilData,
  getFertilizerRecommendation,
  getWeatherAdvisories
} from "./kerala-agriculture-data.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const languageInstructions: Record<string, { instruction: string; name: string; script: string }> = {
  'en': {
    instruction: 'You MUST respond ONLY in English. Do not use any other language. Use simple, clear language suitable for farmers.',
    name: 'English',
    script: 'Latin'
  },
  'ml': {
    instruction: 'നിങ്ങൾ മലയാളത്തിൽ മാത്രം മറുപടി നൽകണം. മലയാളം ലിപി ഉപയോഗിക്കുക. ഇംഗ്ലീഷ് അല്ലെങ്കിൽ മറ്റ് ഭാഷകൾ ഉപയോഗിക്കരുത്.',
    name: 'Malayalam (മലയാളം)',
    script: 'Malayalam'
  },
  'hi': {
    instruction: 'आपको केवल हिंदी में जवाब देना होगा। देवनागरी लिपि का उपयोग करें। अंग्रेजी या अन्य भाषाओं का उपयोग न करें।',
    name: 'Hindi (हिंदी)',
    script: 'Devanagari'
  },
};

// Extract district from location string
function extractDistrict(location: string): string | null {
  const keralaDistricts = [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
    "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
    "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
  ];
  
  const locationLower = location.toLowerCase();
  for (const district of keralaDistricts) {
    if (locationLower.includes(district.toLowerCase())) {
      return district;
    }
  }
  return null;
}

// Build Kerala-specific context for the AI
function buildKeralaContext(farmerContext: any, weather?: any): string {
  let keralaContext = "";
  
  const district = farmerContext?.location ? extractDistrict(farmerContext.location) : null;
  
  // District soil information
  if (district) {
    const soilData = getDistrictSoilData(district);
    if (soilData) {
      keralaContext += `\n\n=== KERALA SOIL DATA (${district} District) ===
Predominant Soils: ${soilData.predominantSoils.join(", ")}
Typical pH: ${soilData.pH.typical} (Range: ${soilData.pH.min}-${soilData.pH.max})
Agro-Climatic Zone: ${soilData.agroClimaticZone}
Suitable Crops: ${soilData.suitableCrops.join(", ")}
Soil Limitations: ${soilData.limitations.join("; ")}
Recommendations: ${soilData.recommendations.join("; ")}
Source: Kerala Soil Atlas`;
    }
  }
  
  // Crop-specific KAU data
  if (farmerContext?.crops && farmerContext.crops.length > 0) {
    keralaContext += `\n\n=== KAU CROP CALENDARS & RECOMMENDATIONS ===`;
    
    farmerContext.crops.forEach((crop: any) => {
      const cropCalendar = getCropCalendar(crop.name, district || undefined);
      
      if (cropCalendar) {
        keralaContext += `\n\n--- ${crop.name.toUpperCase()} (KAU Package of Practices) ---`;
        keralaContext += `\nRecommended Varieties: ${cropCalendar.variety.join(", ")}`;
        keralaContext += `\nSowing Seasons: ${cropCalendar.sowingMonths.join("; ")}`;
        keralaContext += `\nCrop Duration: ${cropCalendar.duration} days`;
        
        // Calculate current stage if planting date available
        if (crop.planting_date) {
          const stageInfo = calculateCropStage(new Date(crop.planting_date), cropCalendar);
          if (stageInfo) {
            keralaContext += `\n\nCURRENT CROP STAGE: ${stageInfo.stage} (Day ${stageInfo.daysFromSowing})`;
            keralaContext += `\nRecommended Operations: ${stageInfo.operations.join("; ")}`;
            if (stageInfo.pestWatch && stageInfo.pestWatch.length > 0) {
              keralaContext += `\nPests/Diseases to Watch: ${stageInfo.pestWatch.join(", ")}`;
            }
          }
        }
        
        // Fertilizer recommendations
        const fertRec = getFertilizerRecommendation(crop.name, farmerContext?.farm?.soil_type);
        if (fertRec) {
          keralaContext += `\n\nFERTILIZER SCHEDULE (${fertRec.source}):`;
          keralaContext += `\nNPK Ratio: ${fertRec.npkRatio}`;
          fertRec.schedule.forEach(sched => {
            keralaContext += `\n- ${sched.stage}: N=${sched.nitrogen.dosage}, P=${sched.phosphorus.dosage}, K=${sched.potassium.dosage}`;
          });
          keralaContext += `\nOrganic Alternatives: ${fertRec.organicAlternatives.map(o => `${o.type} @ ${o.dosage}`).join("; ")}`;
        }
        
        // Pest management
        if (district) {
          const pests = getPestManagement(crop.name, district);
          if (pests.length > 0) {
            keralaContext += `\n\nCOMMON PESTS/DISEASES (ICAR/KAU Approved Management):`;
            pests.slice(0, 3).forEach(pest => {
              keralaContext += `\n\n${pest.pest} (${pest.malayalamName}):`;
              keralaContext += `\nSymptoms: ${pest.symptoms.slice(0, 2).join("; ")}`;
              keralaContext += `\nCultural Control: ${pest.management.cultural.slice(0, 2).join("; ")}`;
              if (pest.management.chemical.length > 0) {
                const chem = pest.management.chemical[0];
                keralaContext += `\nChemical Control: ${chem.pesticide} @ ${chem.dosage} (${chem.perAcre}) - PHI: ${chem.phi} days [Source: ${chem.source}]`;
              }
            });
          }
        }
      }
    });
  }
  
  // Weather-based advisories
  if (weather) {
    const month = new Date().getMonth() + 1;
    const advisories = getWeatherAdvisories(
      weather.temperature || 30,
      weather.humidity || 75,
      weather.rainfall || 0,
      weather.windSpeed || 10,
      month
    );
    
    if (advisories.length > 0) {
      keralaContext += `\n\n=== IMD KERALA WEATHER ADVISORIES ===`;
      advisories.forEach(adv => {
        keralaContext += `\n\nCondition: ${adv.condition}`;
        keralaContext += `\nAdvisory: ${adv.advisory.slice(0, 3).join("; ")}`;
        keralaContext += `\nDo NOT: ${adv.doNot.slice(0, 2).join("; ")}`;
      });
    }
  }
  
  return keralaContext;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, farmerContext, language = 'en', weather } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing Kerala-specific chat request");
    console.log("District:", farmerContext?.location ? extractDistrict(farmerContext.location) : "Unknown");

    const langConfig = languageInstructions[language] || languageInstructions['en'];
    
    // Build Kerala-specific context
    const keralaContext = buildKeralaContext(farmerContext, weather);

    let systemPrompt = `You are Krishi Connect (കൃഷി കണക്ട്), an AI farming assistant specialized in KERALA AGRICULTURE.

=== CRITICAL: KERALA-SPECIFIC GUIDANCE ONLY ===
You MUST provide advice based ONLY on:
- Kerala Agricultural University (KAU) Package of Practices
- ICAR-approved recommendations for Kerala
- Kerala Department of Agriculture guidelines
- CPCRI (Coconut), IISR (Spices), ICRI (Cardamom) research data
- IMD Kerala weather advisories

DO NOT provide generic national/international farming advice.
ALL dosages MUST be from official KAU/ICAR tables provided in context.
Consider the farmer's DISTRICT, SOIL TYPE, and CURRENT CROP STAGE.

=== LANGUAGE REQUIREMENT ===
${langConfig.instruction}
Respond ONLY in ${langConfig.name} using ${langConfig.script} script.

=== YOUR EXPERTISE ===
- Kerala crop calendars and seasonal operations
- District-wise soil characteristics and amendments
- Pest/disease management with ICAR-approved chemicals and dosages
- Weather-based farming advisories (IMD Kerala)
- Government schemes for Kerala farmers
- Organic and integrated farming practices

=== RESPONSE GUIDELINES ===
1. Calculate dosages based on farmer's land area
2. Consider recent activities (irrigation, pesticide use, fertilizer application)
3. Factor in current weather and forecast
4. Use crop stage to recommend timely operations
5. Warn if weather conditions are unfavorable for planned activities
6. Provide step-by-step practical guidance
7. Use Malayalam crop/pest names when helpful`;

    // Add farmer context
    if (farmerContext) {
      systemPrompt += `\n\n=== FARMER PROFILE ===`;
      if (farmerContext.farmerName) systemPrompt += `\nName: ${farmerContext.farmerName}`;
      if (farmerContext.location) systemPrompt += `\nLocation: ${farmerContext.location}`;
      
      if (farmerContext.farm) {
        systemPrompt += `\n\nFarm Details:`;
        systemPrompt += `\n- Name: ${farmerContext.farm.name || 'Not specified'}`;
        systemPrompt += `\n- Area: ${farmerContext.farm.total_area || 'Not specified'} ${farmerContext.farm.area_unit || 'acres'}`;
        systemPrompt += `\n- Soil Type: ${farmerContext.farm.soil_type || 'Not specified'}`;
        systemPrompt += `\n- Water Source: ${farmerContext.farm.water_source || 'Not specified'}`;
      }
      
      if (farmerContext.crops && farmerContext.crops.length > 0) {
        systemPrompt += `\n\nCurrent Crops:`;
        farmerContext.crops.forEach((crop: any, i: number) => {
          systemPrompt += `\n${i + 1}. ${crop.name}${crop.variety ? ` (${crop.variety})` : ''}`;
          if (crop.area) systemPrompt += ` - ${crop.area} ${crop.area_unit || 'acres'}`;
          if (crop.planting_date) systemPrompt += ` - Planted: ${crop.planting_date}`;
          if (crop.health_status) systemPrompt += ` - Health: ${crop.health_status}`;
        });
      }
      
      if (farmerContext.recentActivities && farmerContext.recentActivities.length > 0) {
        systemPrompt += `\n\nRecent Activities:`;
        farmerContext.recentActivities.forEach((activity: any) => {
          systemPrompt += `\n- ${activity.activity_date}: ${activity.title} (${activity.activity_type})`;
          if (activity.quantity) systemPrompt += ` - Qty: ${activity.quantity} ${activity.quantity_unit || ''}`;
          if (activity.area_covered) systemPrompt += ` - Area: ${activity.area_covered} ${activity.area_covered_unit || 'acres'}`;
        });
      }
      
      if (farmerContext.soilReport) {
        systemPrompt += `\n\nLatest Soil Test:`;
        systemPrompt += `\n- N: ${farmerContext.soilReport.nitrogen} kg/ha`;
        systemPrompt += `\n- P: ${farmerContext.soilReport.phosphorus} kg/ha`;
        systemPrompt += `\n- K: ${farmerContext.soilReport.potassium} kg/ha`;
        systemPrompt += `\n- pH: ${farmerContext.soilReport.ph}`;
      }
    }
    
    // Add Kerala-specific data
    systemPrompt += keralaContext;
    
    // Weather context
    if (weather) {
      systemPrompt += `\n\n=== CURRENT WEATHER ===`;
      systemPrompt += `\nTemperature: ${weather.temperature}°C`;
      systemPrompt += `\nHumidity: ${weather.humidity}%`;
      systemPrompt += `\nCondition: ${weather.condition}`;
      if (weather.rainfall) systemPrompt += `\nRainfall: ${weather.rainfall}mm`;
      if (weather.forecast) systemPrompt += `\nForecast: ${weather.forecast}`;
    }

    systemPrompt += `\n\n=== REMINDER ===
Respond in ${langConfig.name} ONLY. Use KAU/ICAR data. Be practical and Kerala-specific.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
