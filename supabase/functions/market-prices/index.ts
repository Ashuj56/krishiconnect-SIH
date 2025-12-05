import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Indian state coordinates for nearby market calculation
const stateCoordinates: Record<string, { lat: number; lng: number }> = {
  'kerala': { lat: 10.8505, lng: 76.2711 },
  'karnataka': { lat: 15.3173, lng: 75.7139 },
  'tamil nadu': { lat: 11.1271, lng: 78.6569 },
  'andhra pradesh': { lat: 15.9129, lng: 79.7400 },
  'telangana': { lat: 18.1124, lng: 79.0193 },
  'maharashtra': { lat: 19.7515, lng: 75.7139 },
  'gujarat': { lat: 22.2587, lng: 71.1924 },
  'madhya pradesh': { lat: 22.9734, lng: 78.6569 },
  'rajasthan': { lat: 27.0238, lng: 74.2179 },
  'uttar pradesh': { lat: 26.8467, lng: 80.9462 },
  'bihar': { lat: 25.0961, lng: 85.3131 },
  'west bengal': { lat: 22.9868, lng: 87.8550 },
  'punjab': { lat: 31.1471, lng: 75.3412 },
  'haryana': { lat: 29.0588, lng: 76.0856 },
  'odisha': { lat: 20.9517, lng: 85.0985 },
  'default': { lat: 20.5937, lng: 78.9629 }, // Center of India
};

// Major APMC markets by state
const marketsByState: Record<string, Array<{ name: string; lat: number; lng: number; crops: number }>> = {
  'kerala': [
    { name: 'Thrissur APMC', lat: 10.5276, lng: 76.2144, crops: 45 },
    { name: 'Ernakulam Market Yard', lat: 9.9816, lng: 76.2999, crops: 62 },
    { name: 'Palakkad Agricultural Market', lat: 10.7867, lng: 76.6548, crops: 38 },
    { name: 'Kozhikode APMC', lat: 11.2588, lng: 75.7804, crops: 41 },
    { name: 'Thiruvananthapuram Market', lat: 8.5241, lng: 76.9366, crops: 35 },
  ],
  'karnataka': [
    { name: 'Bangalore APMC Yeshwanthpur', lat: 13.0196, lng: 77.5399, crops: 85 },
    { name: 'Hubli-Dharwad Market', lat: 15.3647, lng: 75.1240, crops: 55 },
    { name: 'Mysore Agricultural Market', lat: 12.2958, lng: 76.6394, crops: 48 },
  ],
  'maharashtra': [
    { name: 'APMC Vashi Navi Mumbai', lat: 19.0760, lng: 72.9983, crops: 120 },
    { name: 'Pune Market Yard', lat: 18.5074, lng: 73.8077, crops: 95 },
    { name: 'Nashik APMC', lat: 19.9975, lng: 73.7898, crops: 65 },
  ],
  'tamil nadu': [
    { name: 'Koyambedu Wholesale Market Chennai', lat: 13.0694, lng: 80.1948, crops: 110 },
    { name: 'Coimbatore APMC', lat: 11.0168, lng: 76.9558, crops: 72 },
    { name: 'Madurai Mandi', lat: 9.9252, lng: 78.1198, crops: 58 },
  ],
  'default': [
    { name: 'Local Agricultural Market', lat: 20.5937, lng: 78.9629, crops: 40 },
    { name: 'Regional APMC', lat: 20.5937, lng: 78.9629, crops: 35 },
    { name: 'District Market Yard', lat: 20.5937, lng: 78.9629, crops: 30 },
  ],
};

// Base commodity prices (realistic Indian market prices)
const baseCommodityPrices: Record<string, { price: number; unit: string; category: string }> = {
  'Rice (Paddy)': { price: 2100, unit: 'quintal', category: 'cereals' },
  'Wheat': { price: 2275, unit: 'quintal', category: 'cereals' },
  'Maize': { price: 1850, unit: 'quintal', category: 'cereals' },
  'Jowar': { price: 2800, unit: 'quintal', category: 'cereals' },
  'Bajra': { price: 2350, unit: 'quintal', category: 'cereals' },
  'Banana (Nendran)': { price: 42, unit: 'kg', category: 'fruits' },
  'Banana (Robusta)': { price: 28, unit: 'kg', category: 'fruits' },
  'Coconut': { price: 30, unit: 'piece', category: 'plantation' },
  'Arecanut': { price: 45000, unit: 'quintal', category: 'plantation' },
  'Pepper (Black)': { price: 52000, unit: 'quintal', category: 'spices' },
  'Cardamom': { price: 95000, unit: 'quintal', category: 'spices' },
  'Turmeric': { price: 8500, unit: 'quintal', category: 'spices' },
  'Ginger': { price: 3200, unit: 'quintal', category: 'spices' },
  'Tomato': { price: 25, unit: 'kg', category: 'vegetables' },
  'Onion': { price: 22, unit: 'kg', category: 'vegetables' },
  'Potato': { price: 18, unit: 'kg', category: 'vegetables' },
  'Cabbage': { price: 15, unit: 'kg', category: 'vegetables' },
  'Cauliflower': { price: 28, unit: 'kg', category: 'vegetables' },
  'Brinjal': { price: 24, unit: 'kg', category: 'vegetables' },
  'Green Chilli': { price: 45, unit: 'kg', category: 'vegetables' },
  'Cotton': { price: 6200, unit: 'quintal', category: 'commercial' },
  'Groundnut': { price: 5500, unit: 'quintal', category: 'oilseeds' },
  'Soybean': { price: 4200, unit: 'quintal', category: 'oilseeds' },
  'Mustard': { price: 5100, unit: 'quintal', category: 'oilseeds' },
  'Sugarcane': { price: 315, unit: 'quintal', category: 'commercial' },
  'Tea': { price: 18500, unit: 'quintal', category: 'plantation' },
  'Coffee (Robusta)': { price: 22000, unit: 'quintal', category: 'plantation' },
  'Rubber': { price: 15500, unit: 'quintal', category: 'plantation' },
};

// Calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get state from location string
function getStateFromLocation(location: string): string {
  const locationLower = location.toLowerCase();
  for (const state of Object.keys(stateCoordinates)) {
    if (locationLower.includes(state)) {
      return state;
    }
  }
  return 'default';
}

// Generate realistic price with daily variation
function generateDailyPrice(basePrice: number): { price: number; change: number } {
  // Use date-based seed for consistent daily prices
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Generate pseudo-random variation (-10% to +10%)
  const variation = ((seed % 20) - 10) / 100;
  const price = Math.round(basePrice * (1 + variation));
  
  // Calculate change from yesterday (simulated)
  const yesterdaySeed = seed - 1;
  const yesterdayVariation = ((yesterdaySeed % 20) - 10) / 100;
  const yesterdayPrice = basePrice * (1 + yesterdayVariation);
  const change = ((price - yesterdayPrice) / yesterdayPrice) * 100;
  
  return { price, change: Math.round(change * 10) / 10 };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, userCrops } = await req.json();
    
    console.log("Fetching market prices for location:", location);
    console.log("User crops:", userCrops);

    // Determine state and coordinates
    const state = getStateFromLocation(location || '');
    const coordinates = stateCoordinates[state] || stateCoordinates['default'];
    
    // Get nearby markets
    const stateMarkets = marketsByState[state] || marketsByState['default'];
    const nearbyMarkets = stateMarkets.map(market => {
      const distance = calculateDistance(
        coordinates.lat, coordinates.lng,
        market.lat, market.lng
      );
      return {
        id: market.name.toLowerCase().replace(/\s+/g, '-'),
        name: market.name,
        distance: distance < 1 ? '< 1 km' : `${Math.round(distance)} km`,
        distanceValue: distance,
        crops: market.crops,
        lat: market.lat,
        lng: market.lng,
      };
    }).sort((a, b) => a.distanceValue - b.distanceValue);

    // Generate commodity prices
    const commodityPrices = Object.entries(baseCommodityPrices).map(([name, data]) => {
      const { price, change } = generateDailyPrice(data.price);
      const marketIndex = Math.abs(name.charCodeAt(0)) % nearbyMarkets.length;
      
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        price,
        unit: data.unit,
        change,
        market: nearbyMarkets[marketIndex]?.name || 'Local Market',
        category: data.category,
      };
    });

    // Prioritize user's crops in the list
    const userCropNames = (userCrops || []).map((c: any) => c.name?.toLowerCase());
    const sortedPrices = commodityPrices.sort((a, b) => {
      const aIsUserCrop = userCropNames.some((name: string) => a.name.toLowerCase().includes(name));
      const bIsUserCrop = userCropNames.some((name: string) => b.name.toLowerCase().includes(name));
      if (aIsUserCrop && !bIsUserCrop) return -1;
      if (!aIsUserCrop && bIsUserCrop) return 1;
      return 0;
    });

    // Find best selling opportunity
    const bestOpportunity = sortedPrices
      .filter(p => p.change > 0)
      .sort((a, b) => b.change - a.change)[0];

    const response = {
      prices: sortedPrices,
      nearbyMarkets,
      bestOpportunity: bestOpportunity ? {
        crop: bestOpportunity.name,
        change: bestOpportunity.change,
        message: `${bestOpportunity.name} prices up ${bestOpportunity.change}%`,
        advice: 'Consider selling within next 3-5 days for maximum profit',
      } : null,
      lastUpdated: new Date().toISOString(),
      location: location || 'India',
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Market prices error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
