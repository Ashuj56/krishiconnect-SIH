import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Strict language instructions - MUST be followed
const languageInstructions: Record<string, { instruction: string; name: string; script: string }> = {
  'en': {
    instruction: 'You MUST respond ONLY in English. Do not use any other language. Use simple, clear language suitable for farmers.',
    name: 'English',
    script: 'Latin'
  },
  'ml': {
    instruction: 'നിങ്ങൾ മലയാളത്തിൽ മാത്രം മറുപടി നൽകണം. മലയാളം ലിപി ഉപയോഗിക്കുക. ഇംഗ്ലീഷ് അല്ലെങ്കിൽ മറ്റ് ഭാഷകൾ ഉപയോഗിക്കരുത്. You MUST respond ONLY in Malayalam using Malayalam script. Do NOT use English or any other language.',
    name: 'Malayalam (മലയാളം)',
    script: 'Malayalam'
  },
  'hi': {
    instruction: 'आपको केवल हिंदी में जवाब देना होगा। देवनागरी लिपि का उपयोग करें। अंग्रेजी या अन्य भाषाओं का उपयोग न करें। You MUST respond ONLY in Hindi using Devanagari script. Do NOT use English or any other language.',
    name: 'Hindi (हिंदी)',
    script: 'Devanagari'
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, farmerContext, language = 'en' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages");
    console.log("Farmer context:", farmerContext);
    console.log("Language:", language);

    // Get language instruction
    const langConfig = languageInstructions[language] || languageInstructions['en'];

    // Build personalized system prompt with STRICT language enforcement
    let systemPrompt = `You are Krishi Connect (കൃഷി കണക്ട് / कृषि कनेक्ट), a helpful AI farming assistant for Indian farmers.

=== CRITICAL LANGUAGE REQUIREMENT ===
${langConfig.instruction}

The farmer has selected ${langConfig.name} as their preferred language.
ALL your responses MUST be written ENTIRELY in ${langConfig.name} using the ${langConfig.script} script.
This is NON-NEGOTIABLE. Even technical terms should be translated or transliterated.
=== END LANGUAGE REQUIREMENT ===

You provide advice on:
- Crop management and best practices
- Pest and disease identification and treatment
- Weather-based farming recommendations
- Irrigation and water management
- Soil health and fertilization
- Government schemes and subsidies for farmers
- Market prices and selling strategies

Be helpful, practical, and consider the Indian farming context.`;

    // Add personalized farmer context if available
    if (farmerContext) {
      systemPrompt += `\n\n--- FARMER'S PROFILE (Use this to personalize your advice) ---`;
      
      if (farmerContext.farmerName) {
        systemPrompt += `\nFarmer's Name: ${farmerContext.farmerName}`;
      }
      
      if (farmerContext.location) {
        systemPrompt += `\nLocation: ${farmerContext.location}`;
      }
      
      if (farmerContext.farm) {
        systemPrompt += `\n\nFarm Details:`;
        systemPrompt += `\n- Farm Name: ${farmerContext.farm.name || 'Not specified'}`;
        systemPrompt += `\n- Total Area: ${farmerContext.farm.total_area || 'Not specified'} ${farmerContext.farm.area_unit || 'acres'}`;
        systemPrompt += `\n- Soil Type: ${farmerContext.farm.soil_type || 'Not specified'}`;
        systemPrompt += `\n- Water Source: ${farmerContext.farm.water_source || 'Not specified'}`;
      }
      
      if (farmerContext.crops && farmerContext.crops.length > 0) {
        systemPrompt += `\n\nCurrent Crops:`;
        farmerContext.crops.forEach((crop: any, index: number) => {
          systemPrompt += `\n${index + 1}. ${crop.name}${crop.variety ? ` (${crop.variety})` : ''}`;
          if (crop.area) systemPrompt += ` - Area: ${crop.area} ${crop.area_unit || 'acres'}`;
          if (crop.current_stage) systemPrompt += ` - Stage: ${crop.current_stage}`;
          if (crop.health_status) systemPrompt += ` - Health: ${crop.health_status}`;
          if (crop.planting_date) systemPrompt += ` - Planted: ${crop.planting_date}`;
        });
      }
      
      if (farmerContext.recentActivities && farmerContext.recentActivities.length > 0) {
        systemPrompt += `\n\nRecent Activities (last 7 days):`;
        farmerContext.recentActivities.forEach((activity: any) => {
          systemPrompt += `\n- ${activity.activity_date}: ${activity.title} (${activity.activity_type})`;
          if (activity.description) systemPrompt += ` - ${activity.description}`;
        });
      }
      
      systemPrompt += `\n\n--- END OF FARMER PROFILE ---`;
      systemPrompt += `\n\nUse the above information to provide personalized advice. Address the farmer by name when appropriate. Consider their specific crops, location, and recent activities when giving recommendations.`;
    }
    
    // Final language reminder
    systemPrompt += `\n\n=== REMINDER: Respond ONLY in ${langConfig.name} (${langConfig.script} script). This is mandatory. ===`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
