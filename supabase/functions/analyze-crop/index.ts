import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, scanType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing crop analysis request, scan type:", scanType);

    const scanPrompts: Record<string, string> = {
      pest: "Analyze this crop image for pest infestation. Identify any visible pests, assess the severity of damage, and provide treatment recommendations suitable for Indian farming conditions.",
      disease: "Analyze this crop image for diseases. Identify any fungal, bacterial, or viral infections visible, assess severity, and recommend treatments available in India.",
      nutrient: "Analyze this crop image for nutrient deficiencies. Look for signs of nitrogen, phosphorus, potassium, or micronutrient deficiencies and recommend appropriate fertilizers.",
      health: "Provide a comprehensive health assessment of this crop. Evaluate overall plant vigor, identify any issues, and provide general care recommendations."
    };

    const prompt = scanPrompts[scanType] || scanPrompts.health;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert agricultural scientist specializing in crop health analysis for Indian farmers. Analyze crop images and provide detailed, actionable advice. Always structure your response as JSON with the following format:
{
  "confidence": <number between 0 and 100>,
  "issue": "<main issue identified or 'Healthy' if no issues>",
  "severity": "<low/medium/high or 'none' if healthy>",
  "description": "<detailed description of findings>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}
Ensure recommendations are practical for Indian farmers and mention locally available treatments.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
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
      
      return new Response(JSON.stringify({ error: "Analysis service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI response received:", content?.substring(0, 100));

    // Parse the JSON from the response
    let analysisResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Provide a fallback response
      analysisResult = {
        confidence: 70,
        issue: "Analysis completed",
        severity: "medium",
        description: content || "Unable to process image analysis",
        recommendations: ["Please try uploading a clearer image", "Consult with local agricultural officer"]
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analyze crop function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
