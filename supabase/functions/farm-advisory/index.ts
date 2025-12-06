import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FarmerContext {
  name?: string;
  location?: string;
  landArea?: number;
  soilType?: string;
  waterSource?: string;
  crops?: Array<{
    name: string;
    variety?: string;
    stage?: string;
    health?: string;
    area?: number;
  }>;
  recentActivities?: Array<{
    type: string;
    title: string;
    date: string;
  }>;
}

interface Advisory {
  id: string;
  title: string;
  description: string;
  category: "weather" | "crop" | "pest" | "soil" | "market" | "general";
  priority: "high" | "medium" | "low";
  actionItems: string[];
  relatedCrop?: string;
  validUntil?: string;
}

// Seasonal data for India
function getCurrentSeason(month: number): { season: string; rabi: boolean; kharif: boolean; zaid: boolean } {
  if (month >= 10 || month <= 2) {
    return { season: "Rabi", rabi: true, kharif: false, zaid: false };
  } else if (month >= 6 && month <= 9) {
    return { season: "Kharif", rabi: false, kharif: true, zaid: false };
  } else {
    return { season: "Zaid/Summer", rabi: false, kharif: false, zaid: true };
  }
}

function getStateFromLocation(location: string): string {
  const locationLower = location.toLowerCase();
  const stateMapping: Record<string, string> = {
    kerala: "Kerala",
    karnataka: "Karnataka",
    tamilnadu: "Tamil Nadu",
    maharashtra: "Maharashtra",
    punjab: "Punjab",
    haryana: "Haryana",
    uttarpradesh: "Uttar Pradesh",
    madhyapradesh: "Madhya Pradesh",
    rajasthan: "Rajasthan",
    gujarat: "Gujarat",
    andhra: "Andhra Pradesh",
    telangana: "Telangana",
    westbengal: "West Bengal",
    odisha: "Odisha",
    bihar: "Bihar",
    assam: "Assam",
    jharkhand: "Jharkhand",
    chhattisgarh: "Chhattisgarh",
  };

  for (const [key, value] of Object.entries(stateMapping)) {
    if (locationLower.includes(key) || locationLower.includes(value.toLowerCase())) {
      return value;
    }
  }
  
  // Try to detect from city names
  const cityToState: Record<string, string> = {
    mumbai: "Maharashtra", pune: "Maharashtra", nagpur: "Maharashtra",
    bangalore: "Karnataka", bengaluru: "Karnataka", mysore: "Karnataka",
    chennai: "Tamil Nadu", coimbatore: "Tamil Nadu", madurai: "Tamil Nadu",
    kochi: "Kerala", trivandrum: "Kerala", thrissur: "Kerala", theissur: "Kerala",
    hyderabad: "Telangana", secunderabad: "Telangana",
    delhi: "Delhi", noida: "Uttar Pradesh", lucknow: "Uttar Pradesh",
    jaipur: "Rajasthan", udaipur: "Rajasthan",
    ahmedabad: "Gujarat", surat: "Gujarat",
    kolkata: "West Bengal",
    bhopal: "Madhya Pradesh", indore: "Madhya Pradesh",
    chandigarh: "Punjab", ludhiana: "Punjab", amritsar: "Punjab",
  };

  for (const [city, state] of Object.entries(cityToState)) {
    if (locationLower.includes(city)) {
      return state;
    }
  }

  return "India";
}

function generateAdvisories(context: FarmerContext): Advisory[] {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const seasonInfo = getCurrentSeason(month);
  const state = getStateFromLocation(context.location || "");
  const advisories: Advisory[] = [];

  // Seasonal advisories
  if (seasonInfo.rabi) {
    advisories.push({
      id: "seasonal-rabi",
      title: "Rabi Season Active",
      description: `This is the Rabi cropping season (October-March). Ideal time for wheat, barley, mustard, peas, and gram cultivation in ${state}.`,
      category: "general",
      priority: "medium",
      actionItems: [
        "Prepare fields for Rabi crops if not already done",
        "Ensure proper irrigation facilities are in place",
        "Apply basal dose of fertilizers before sowing",
        "Check seed availability for planned crops"
      ],
      validUntil: "March 2025"
    });
  } else if (seasonInfo.kharif) {
    advisories.push({
      id: "seasonal-kharif",
      title: "Kharif Season Active",
      description: "Monsoon season is optimal for rice, maize, cotton, sugarcane, and soybean cultivation.",
      category: "general",
      priority: "medium",
      actionItems: [
        "Monitor monsoon patterns for irrigation planning",
        "Apply nitrogen fertilizers in split doses",
        "Ensure proper drainage to prevent waterlogging",
        "Watch for fungal diseases due to humidity"
      ],
      validUntil: "September 2025"
    });
  } else {
    advisories.push({
      id: "seasonal-zaid",
      title: "Zaid/Summer Cropping Season",
      description: "Summer season is suitable for vegetables, watermelon, muskmelon, cucumber, and fodder crops.",
      category: "general",
      priority: "medium",
      actionItems: [
        "Ensure adequate irrigation as summer approaches",
        "Use mulching to retain soil moisture",
        "Plant heat-tolerant crop varieties",
        "Consider drip irrigation for water efficiency"
      ],
      validUntil: "May 2025"
    });
  }

  // December specific advisories
  if (month === 12) {
    advisories.push({
      id: "dec-frost-alert",
      title: "Frost Protection Advisory",
      description: "December-January can bring frost in North India. Take precautions to protect sensitive crops.",
      category: "weather",
      priority: "high",
      actionItems: [
        "Cover sensitive crops during night if frost expected",
        "Apply light irrigation in evening to raise soil temperature",
        "Use smoke screens in orchards if severe frost predicted",
        "Avoid nitrogen application during frost period"
      ],
      validUntil: "February 2025"
    });
  }

  // Crop-specific advisories
  const crops = context.crops || [];
  for (const crop of crops) {
    const cropLower = crop.name.toLowerCase();
    
    if (cropLower.includes("rice") || cropLower.includes("paddy")) {
      if (crop.stage?.toLowerCase() === "growing" || crop.stage?.toLowerCase() === "vegetative") {
        advisories.push({
          id: `rice-growing-${crop.name}`,
          title: `Rice Care: ${crop.name}`,
          description: "Your rice crop is in growing stage. Focus on proper water management and nutrient application.",
          category: "crop",
          priority: "high",
          relatedCrop: crop.name,
          actionItems: [
            "Maintain 5-7 cm standing water in the field",
            "Apply second dose of nitrogen fertilizer",
            "Monitor for stem borer and leaf folder",
            "Check for brown plant hopper during humid weather",
            "Remove weeds to prevent competition"
          ]
        });
      }

      if (crop.health?.toLowerCase() === "poor") {
        advisories.push({
          id: `rice-health-${crop.name}`,
          title: `⚠️ Health Alert: ${crop.name}`,
          description: "Your rice crop health is poor. Immediate attention required.",
          category: "pest",
          priority: "high",
          relatedCrop: crop.name,
          actionItems: [
            "Inspect crop for pest or disease symptoms",
            "Take photos and consult with local agriculture officer",
            "Check for nutrient deficiency symptoms",
            "Consider soil testing if problem persists"
          ]
        });
      }
    }

    if (cropLower.includes("wheat")) {
      advisories.push({
        id: `wheat-care-${crop.name}`,
        title: `Wheat Management: ${crop.name}`,
        description: "Wheat requires careful management during Rabi season for optimal yield.",
        category: "crop",
        priority: "medium",
        relatedCrop: crop.name,
        actionItems: [
          "First irrigation (crown root initiation): 20-25 days after sowing",
          "Second irrigation: at tillering stage (40-45 days)",
          "Watch for yellow rust disease in humid conditions",
          "Apply Zinc Sulphate if deficiency symptoms appear"
        ]
      });
    }

    if (cropLower.includes("vegetables") || cropLower.includes("tomato") || cropLower.includes("onion") || cropLower.includes("potato")) {
      advisories.push({
        id: `veg-care-${crop.name}`,
        title: `Vegetable Care: ${crop.name}`,
        description: "Vegetables need regular attention for pest management and nutrient supply.",
        category: "crop",
        priority: "medium",
        relatedCrop: crop.name,
        actionItems: [
          "Apply organic mulch to conserve moisture",
          "Use neem-based pesticides for aphid control",
          "Harvest at right maturity for better market price",
          "Maintain proper plant spacing for air circulation"
        ]
      });
    }
  }

  // Soil-based advisories
  const soilType = context.soilType?.toLowerCase() || "";
  if (soilType.includes("clay") || soilType.includes("black")) {
    advisories.push({
      id: "soil-clay",
      title: "Clay Soil Management",
      description: "Black/clay soils have good water retention but need proper management.",
      category: "soil",
      priority: "low",
      actionItems: [
        "Avoid working on wet soil to prevent compaction",
        "Add organic matter to improve structure",
        "Use gypsum application for better drainage",
        "Deep ploughing during summer helps crack the soil"
      ]
    });
  } else if (soilType.includes("sandy") || soilType.includes("red")) {
    advisories.push({
      id: "soil-sandy",
      title: "Sandy/Red Soil Management",
      description: "Sandy soils drain quickly and need more frequent irrigation and fertilization.",
      category: "soil",
      priority: "low",
      actionItems: [
        "Apply fertilizers in split doses to reduce leaching",
        "Use mulching to retain moisture",
        "Add organic matter regularly",
        "Consider drip irrigation for efficiency"
      ]
    });
  }

  // Water source advisories
  const waterSource = context.waterSource?.toLowerCase() || "";
  if (waterSource.includes("rain") || waterSource.includes("rainfed")) {
    advisories.push({
      id: "water-rainfed",
      title: "Rainfed Farming Advisory",
      description: "For rainfed agriculture, water conservation is crucial.",
      category: "general",
      priority: "medium",
      actionItems: [
        "Construct farm ponds for rainwater harvesting",
        "Use drought-tolerant crop varieties",
        "Practice mulching to reduce evaporation",
        "Consider PMKSY scheme for micro-irrigation subsidy"
      ]
    });
  }

  // Market advisory
  if (crops.length > 0) {
    advisories.push({
      id: "market-timing",
      title: "Market Price Monitoring",
      description: "Track APMC prices to sell your produce at the best time.",
      category: "market",
      priority: "medium",
      actionItems: [
        "Check daily mandi prices on eNAM portal",
        "Compare prices across nearby APMCs",
        "Consider storage if prices are low currently",
        "Explore direct marketing to consumers/restaurants"
      ]
    });
  }

  // Recent activity-based advisories
  const recentActivities = context.recentActivities || [];
  const lastIrrigation = recentActivities.find(a => a.type === "irrigation");
  const lastFertilizer = recentActivities.find(a => a.type === "fertilizer");

  if (lastFertilizer) {
    const fertDate = new Date(lastFertilizer.date);
    const daysSinceFert = Math.floor((now.getTime() - fertDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceFert > 30) {
      advisories.push({
        id: "fertilizer-reminder",
        title: "Fertilizer Application Due",
        description: `It's been ${daysSinceFert} days since your last fertilizer application.`,
        category: "crop",
        priority: "medium",
        actionItems: [
          "Check crop stage for appropriate fertilizer dose",
          "Consider soil test-based fertilizer application",
          "Apply fertilizers early morning or late evening",
          "Ensure soil moisture before fertilizer application"
        ]
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  advisories.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return advisories;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { farmerContext } = await req.json() as { farmerContext: FarmerContext };
    
    console.log("Generating advisories for:", farmerContext.name, "in", farmerContext.location);
    
    const advisories = generateAdvisories(farmerContext);
    
    const now = new Date();
    const seasonInfo = getCurrentSeason(now.getMonth() + 1);
    const state = getStateFromLocation(farmerContext.location || "");
    
    console.log(`Generated ${advisories.length} advisories for ${state} in ${seasonInfo.season} season`);
    
    return new Response(
      JSON.stringify({
        advisories,
        meta: {
          season: seasonInfo.season,
          state,
          generatedAt: now.toISOString(),
          cropCount: farmerContext.crops?.length || 0,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating advisories:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
