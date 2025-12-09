import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Kerala district soil data (matching the GeoJSON data)
const keralaSoilData = [
  {
    district: "Thiruvananthapuram",
    bounds: { minLat: 8.17, maxLat: 8.89, minLng: 76.65, maxLng: 77.17 },
    soil_type: "Fairly rich brown loam of laterite",
    soil_types: ["Fairly rich brown loam of laterite", "Sandy loam", "Rich dark brown loam (granite origin)"]
  },
  {
    district: "Kollam",
    bounds: { minLat: 8.76, maxLat: 9.26, minLng: 76.48, maxLng: 77.16 },
    soil_type: "Sandy loam",
    soil_types: ["Sandy loam", "Laterite soil"]
  },
  {
    district: "Pathanamthitta",
    bounds: { minLat: 9.11, maxLat: 9.56, minLng: 76.69, maxLng: 77.28 },
    soil_type: "Clay soil",
    soil_types: ["Clay soil", "Laterite soil"]
  },
  {
    district: "Alappuzha",
    bounds: { minLat: 9.10, maxLat: 9.73, minLng: 76.26, maxLng: 76.78 },
    soil_type: "Sandy loam",
    soil_types: ["Sandy loam", "Sandy soil", "Clay loam with high acidity"]
  },
  {
    district: "Kottayam",
    bounds: { minLat: 9.40, maxLat: 9.94, minLng: 76.37, maxLng: 77.01 },
    soil_type: "Laterite soil",
    soil_types: ["Laterite soil", "Laterite soil (upper regions)", "Alluvial soil"]
  },
  {
    district: "Idukki",
    bounds: { minLat: 9.58, maxLat: 10.21, minLng: 76.77, maxLng: 77.45 },
    soil_type: "Laterite soil",
    soil_types: ["Laterite soil", "Alluvial soil"]
  },
  {
    district: "Ernakulam",
    bounds: { minLat: 9.82, maxLat: 10.31, minLng: 76.18, maxLng: 76.78 },
    soil_type: "Laterite soil",
    soil_types: ["Laterite soil", "Sandy loam", "Alluvial soil"]
  },
  {
    district: "Thrissur",
    bounds: { minLat: 10.14, maxLat: 10.68, minLng: 75.92, maxLng: 76.59 },
    soil_type: "Sandy loam",
    soil_types: ["Sandy loam", "Laterite soil", "Clayey soil"]
  },
  {
    district: "Palakkad",
    bounds: { minLat: 10.44, maxLat: 11.14, minLng: 76.07, maxLng: 76.93 },
    soil_type: "Alluvial soil",
    soil_types: ["Alluvial soil", "Laterite soil", "Black soil"]
  },
  {
    district: "Malappuram",
    bounds: { minLat: 10.73, maxLat: 11.28, minLng: 75.83, maxLng: 76.58 },
    soil_type: "Laterite soil",
    soil_types: ["Laterite soil", "Sandy soil"]
  },
  {
    district: "Kozhikode",
    bounds: { minLat: 11.08, maxLat: 11.60, minLng: 75.77, maxLng: 76.19 },
    soil_type: "Sandy soil",
    soil_types: ["Sandy soil", "Laterite soil"]
  },
  {
    district: "Wayanad",
    bounds: { minLat: 11.44, maxLat: 12.01, minLng: 75.78, maxLng: 76.45 },
    soil_type: "Sandy soil",
    soil_types: ["Sandy soil", "Laterite soil", "Loamy soil"]
  },
  {
    district: "Kannur",
    bounds: { minLat: 11.56, maxLat: 12.21, minLng: 75.28, maxLng: 76.01 },
    soil_type: "Laterite soil",
    soil_types: ["Laterite soil", "Sandy soil"]
  },
  {
    district: "Kasaragod",
    bounds: { minLat: 12.03, maxLat: 12.78, minLng: 74.86, maxLng: 75.56 },
    soil_type: "Laterite soil",
    soil_types: ["Laterite soil", "Sandy soil"]
  }
];

// Point in bounding box check
function isPointInBounds(lat: number, lng: number, bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }): boolean {
  return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
}

// Find soil type for given coordinates
function findSoilType(lat: number, lng: number): { district: string; soil_type: string; soil_types: string[] } | null {
  // Check Kerala bounds first (approximate)
  if (lat < 8.0 || lat > 13.0 || lng < 74.5 || lng > 78.0) {
    console.log(`Coordinates outside Kerala: lat=${lat}, lng=${lng}`);
    return null;
  }

  // Find the district containing this point
  for (const district of keralaSoilData) {
    if (isPointInBounds(lat, lng, district.bounds)) {
      console.log(`Found district: ${district.district} for lat=${lat}, lng=${lng}`);
      return {
        district: district.district,
        soil_type: district.soil_type,
        soil_types: district.soil_types
      };
    }
  }

  // If not found in exact bounds, find nearest district
  let nearestDistrict = null;
  let minDistance = Infinity;

  for (const district of keralaSoilData) {
    const centerLat = (district.bounds.minLat + district.bounds.maxLat) / 2;
    const centerLng = (district.bounds.minLng + district.bounds.maxLng) / 2;
    const distance = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2));
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestDistrict = district;
    }
  }

  if (nearestDistrict && minDistance < 0.5) {
    console.log(`Using nearest district: ${nearestDistrict.district} (distance: ${minDistance})`);
    return {
      district: nearestDistrict.district,
      soil_type: nearestDistrict.soil_type,
      soil_types: nearestDistrict.soil_types
    };
  }

  return null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();

    console.log(`Received coordinates: lat=${latitude}, lng=${longitude}`);

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return new Response(
        JSON.stringify({ error: "Invalid coordinates. Please provide latitude and longitude as numbers." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = findSoilType(latitude, longitude);

    if (!result) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Location not within Kerala boundaries",
          message: "Soil type not found for this location. Please recheck."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        district: result.district,
        soil_type: result.soil_type,
        soil_types: result.soil_types,
        location: {
          latitude,
          longitude
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in get-soil-type:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Failed to process request", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
