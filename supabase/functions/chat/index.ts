import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Language instructions
const languageInstructions: Record<string, string> = {
  'en': 'Respond in English. Use simple, easy to understand language suitable for farmers.',
  'ml': 'Always respond in Malayalam (മലയാളം). Use the Malayalam script. ഉത്തരം മലയാളത്തിൽ നൽകുക.',
  'hi': 'Always respond in Hindi (हिंदी). Use the Devanagari script. कृपया हिंदी में जवाब दें।',
};

// =============== KNOWLEDGE ENGINE DATA ===============

// Crop Calendar with growth stages and recommended operations
const cropCalendars: Record<string, { stages: Array<{ name: string; nameEn: string; dayStart: number; dayEnd: number; operations: string; operationsMl: string }> }> = {
  'Rice': {
    stages: [
      { name: 'മുളയ്ക്കൽ', nameEn: 'Germination', dayStart: 0, dayEnd: 10, operations: 'Maintain water level 2-3cm, ensure proper drainage', operationsMl: 'വെള്ളത്തിൻ്റെ അളവ് 2-3 സെ.മീ. നിലനിർത്തുക' },
      { name: 'നാറ്റുപറിക്കൽ', nameEn: 'Transplanting', dayStart: 21, dayEnd: 30, operations: 'Transplant 2-3 seedlings per hill, apply basal fertilizer', operationsMl: 'ഓരോ കുഴിയിലും 2-3 തൈകൾ നടുക, അടിവളം ചേർക്കുക' },
      { name: 'വളർച്ച ഘട്ടം', nameEn: 'Vegetative', dayStart: 31, dayEnd: 55, operations: 'Apply 1st top dressing (Urea), maintain 5cm water', operationsMl: 'ആദ്യ മേൽവളം (യൂറിയ) നൽകുക, 5 സെ.മീ. വെള്ളം നിലനിർത്തുക' },
      { name: 'കതിർ വരൽ', nameEn: 'Flowering', dayStart: 56, dayEnd: 75, operations: 'Apply 2nd top dressing, watch for pests', operationsMl: 'രണ്ടാം മേൽവളം നൽകുക, കീടങ്ങൾക്കായി ശ്രദ്ധിക്കുക' },
      { name: 'വിളവെടുപ്പ്', nameEn: 'Harvest', dayStart: 110, dayEnd: 130, operations: 'Harvest when 80% grains are golden', operationsMl: '80% ധാന്യങ്ങൾ സ്വർണ്ണനിറമായാൽ വിളവെടുക്കുക' },
    ]
  },
  'Coconut': {
    stages: [
      { name: 'പുതിയ തൈ', nameEn: 'Seedling', dayStart: 0, dayEnd: 365, operations: 'Water daily, apply organic manure, mulching', operationsMl: 'ദിവസവും നനയ്ക്കുക, ജൈവവളം ചേർക്കുക, പുതയിടുക' },
      { name: 'യുവ മരം', nameEn: 'Young Palm', dayStart: 366, dayEnd: 1095, operations: 'Apply NPK fertilizer 3 times a year, basin irrigation', operationsMl: 'വർഷത്തിൽ 3 തവണ NPK വളം നൽകുക' },
      { name: 'ഫലം കായ്ക്കുന്നു', nameEn: 'Bearing', dayStart: 1096, dayEnd: 3650, operations: 'Regular harvesting every 45 days, annual fertilization', operationsMl: '45 ദിവസം കൂടുമ്പോൾ വിളവെടുപ്പ്' },
    ]
  },
  'Banana': {
    stages: [
      { name: 'മുളയ്ക്കൽ', nameEn: 'Sprouting', dayStart: 0, dayEnd: 30, operations: 'Ensure proper drainage, light irrigation', operationsMl: 'നല്ല നീർവാർച്ച ഉറപ്പാക്കുക' },
      { name: 'വളർച്ച ഘട്ടം', nameEn: 'Vegetative', dayStart: 31, dayEnd: 150, operations: 'Apply Urea + Potash, desuckering, remove dry leaves', operationsMl: 'യൂറിയ + പൊട്ടാഷ് ചേർക്കുക, ഉണങ്ങിയ ഇലകൾ നീക്കം ചെയ്യുക' },
      { name: 'കുല വരൽ', nameEn: 'Flowering', dayStart: 151, dayEnd: 180, operations: 'Support with bamboo, remove male bud', operationsMl: 'മുള കൊണ്ട് താങ്ങുക, പൂക്കുല നീക്കം ചെയ്യുക' },
      { name: 'വിളവെടുപ്പ്', nameEn: 'Harvest', dayStart: 270, dayEnd: 330, operations: 'Harvest when fingers are full but green', operationsMl: 'വിരലുകൾ നിറഞ്ഞു പക്ഷേ പച്ചയായിരിക്കുമ്പോൾ വിളവെടുക്കുക' },
    ]
  },
  'Pepper': {
    stages: [
      { name: 'വേരുപിടിക്കൽ', nameEn: 'Establishment', dayStart: 0, dayEnd: 90, operations: 'Regular watering, shade protection', operationsMl: 'പതിവായി നനയ്ക്കുക, തണൽ സംരക്ഷണം' },
      { name: 'വളർച്ച', nameEn: 'Growth', dayStart: 91, dayEnd: 730, operations: 'Train on support, apply organic manure', operationsMl: 'താങ്ങിൽ പടർത്തുക, ജൈവവളം ചേർക്കുക' },
      { name: 'പൂവിടൽ', nameEn: 'Flowering', dayStart: 1095, dayEnd: 1460, operations: 'Apply flowering fertilizer, pest monitoring', operationsMl: 'പൂവിടൽ വളം ചേർക്കുക, കീട നിരീക്ഷണം' },
      { name: 'വിളവെടുപ്പ്', nameEn: 'Harvest', dayStart: 1461, dayEnd: 1825, operations: 'Harvest when berries turn yellow-red', operationsMl: 'കുരു മഞ്ഞ-ചുവപ്പായാൽ വിളവെടുക്കുക' },
    ]
  },
  'Cardamom': {
    stages: [
      { name: 'സ്ഥാപനം', nameEn: 'Establishment', dayStart: 0, dayEnd: 180, operations: 'Maintain shade, regular irrigation', operationsMl: 'തണൽ നിലനിർത്തുക, പതിവ് ജലസേചനം' },
      { name: 'വളർച്ച', nameEn: 'Vegetative', dayStart: 181, dayEnd: 730, operations: 'Apply organic manure, weed control', operationsMl: 'ജൈവവളം ചേർക്കുക, കള നിയന്ത്രണം' },
      { name: 'പൂവിടൽ', nameEn: 'Flowering', dayStart: 731, dayEnd: 1095, operations: 'Spray micronutrients, pest control', operationsMl: 'സൂക്ഷ്മ പോഷകങ്ങൾ തളിക്കുക' },
    ]
  },
  'Rubber': {
    stages: [
      { name: 'തൈ വളർച്ച', nameEn: 'Seedling', dayStart: 0, dayEnd: 365, operations: 'Maintain proper drainage, weed control', operationsMl: 'നല്ല നീർവാർച്ച നിലനിർത്തുക' },
      { name: 'അപക്വം', nameEn: 'Immature', dayStart: 366, dayEnd: 2555, operations: 'Annual fertilization, disease monitoring', operationsMl: 'വാർഷിക വളപ്രയോഗം, രോഗ നിരീക്ഷണം' },
      { name: 'ടാപ്പിംഗ്', nameEn: 'Tapping', dayStart: 2556, dayEnd: 10950, operations: 'Regular tapping, bark treatment', operationsMl: 'പതിവ് ടാപ്പിംഗ്, തൊലി ചികിത്സ' },
    ]
  },
};

// Pest and Disease Knowledge Base
const pestKnowledge: Array<{
  crop: string;
  pest: string;
  pestMl: string;
  symptoms: string;
  symptomsMl: string;
  climateRisk: { humidity: string; temp: string; rain: boolean };
  prevention: string;
  preventionMl: string;
  control: string;
  controlMl: string;
}> = [
  {
    crop: 'Rice',
    pest: 'Brown Plant Hopper (BPH)',
    pestMl: 'ബ്രൗൺ പ്ലാൻ്റ് ഹോപ്പർ',
    symptoms: 'Yellowing of leaves, hopperburn, wilting of plants',
    symptomsMl: 'ഇലകൾ മഞ്ഞളിക്കൽ, ഹോപ്പർബേൺ, ചെടികൾ വാടൽ',
    climateRisk: { humidity: 'high', temp: '25-30', rain: true },
    prevention: 'Avoid excess nitrogen, maintain water level, use resistant varieties',
    preventionMl: 'അമിത നൈട്രജൻ ഒഴിവാക്കുക, വെള്ളത്തിൻ്റെ അളവ് നിലനിർത്തുക',
    control: 'Apply Imidacloprid or Thiamethoxam spray',
    controlMl: 'ഇമിഡാക്ലോപ്രിഡ് അല്ലെങ്കിൽ തയാമെത്തോക്സാം തളിക്കുക',
  },
  {
    crop: 'Rice',
    pest: 'Stem Borer',
    pestMl: 'തണ്ട് തുരപ്പൻ',
    symptoms: 'Dead hearts in vegetative stage, white ears in reproductive stage',
    symptomsMl: 'വളർച്ച ഘട്ടത്തിൽ ഡെഡ് ഹാർട്ട്സ്, പ്രജനന ഘട്ടത്തിൽ വെളുത്ത കതിർ',
    climateRisk: { humidity: 'medium', temp: '28-32', rain: false },
    prevention: 'Remove stubbles after harvest, light trap',
    preventionMl: 'വിളവെടുപ്പിന് ശേഷം താളടി നീക്കം ചെയ്യുക, വിളക്കുകെണി',
    control: 'Spray Chlorantraniliprole or release Trichogramma',
    controlMl: 'ക്ലോറാൻട്രാനിലിപ്രോൾ തളിക്കുക അല്ലെങ്കിൽ ട്രൈക്കോഗ്രാമ വിടുക',
  },
  {
    crop: 'Banana',
    pest: 'Banana Bunchy Top Virus',
    pestMl: 'വാഴ ബഞ്ചി ടോപ്പ് വൈറസ്',
    symptoms: 'Stunted growth, bunching of leaves, marginal chlorosis',
    symptomsMl: 'വളർച്ച മുരടിപ്പ്, ഇലകൾ കൂട്ടമായി വളരൽ, അരികുകൾ മഞ്ഞളിക്കൽ',
    climateRisk: { humidity: 'high', temp: '20-28', rain: true },
    prevention: 'Use virus-free suckers, destroy infected plants',
    preventionMl: 'വൈറസ് ഇല്ലാത്ത കന്നുകൾ ഉപയോഗിക്കുക, രോഗബാധിത ചെടികൾ നശിപ്പിക്കുക',
    control: 'No cure - remove and destroy infected plants, control aphids',
    controlMl: 'ചികിത്സയില്ല - രോഗബാധിത ചെടികൾ നീക്കം ചെയ്യുക, മുഞ്ഞ നിയന്ത്രിക്കുക',
  },
  {
    crop: 'Coconut',
    pest: 'Rhinoceros Beetle',
    pestMl: 'കാണ്ടാമൃഗ വണ്ട്',
    symptoms: 'V-shaped cuts on leaves, bore holes in crown',
    symptomsMl: 'ഇലകളിൽ V ആകൃതിയിലുള്ള മുറിവുകൾ, കിരീടത്തിൽ ദ്വാരങ്ങൾ',
    climateRisk: { humidity: 'high', temp: '25-35', rain: true },
    prevention: 'Clean breeding places, maintain field sanitation',
    preventionMl: 'പ്രജനന സ്ഥലങ്ങൾ വൃത്തിയാക്കുക, തോട്ടം വൃത്തിയായി സൂക്ഷിക്കുക',
    control: 'Apply naphthalene balls or neem cake in crown, pheromone traps',
    controlMl: 'കിരീടത്തിൽ നാഫ്തലിൻ ബോൾസ് അല്ലെങ്കിൽ വേപ്പിൻ പിണ്ണാക്ക് ഇടുക',
  },
  {
    crop: 'Pepper',
    pest: 'Quick Wilt (Phytophthora)',
    pestMl: 'ക്വിക്ക് വിൽറ്റ്',
    symptoms: 'Sudden wilting, yellowing and shedding of leaves',
    symptomsMl: 'പെട്ടെന്നുള്ള വാട്ടം, ഇലകൾ മഞ്ഞളിച്ച് കൊഴിയൽ',
    climateRisk: { humidity: 'high', temp: '22-28', rain: true },
    prevention: 'Improve drainage, apply Trichoderma, avoid waterlogging',
    preventionMl: 'നീർവാർച്ച മെച്ചപ്പെടുത്തുക, ട്രൈക്കോഡെർമ ചേർക്കുക',
    control: 'Spray Bordeaux mixture 1%, drench with Metalaxyl',
    controlMl: 'ബോർഡോ മിശ്രിതം 1% തളിക്കുക, മെറ്റലാക്സിൽ ഉപയോഗിക്കുക',
  },
  {
    crop: 'Cardamom',
    pest: 'Thrips',
    pestMl: 'ത്രിപ്സ്',
    symptoms: 'Silvery patches on leaves, stunted growth',
    symptomsMl: 'ഇലകളിൽ വെള്ളി പാടുകൾ, വളർച്ച മുരടിപ്പ്',
    climateRisk: { humidity: 'low', temp: '28-35', rain: false },
    prevention: 'Maintain shade, conserve natural enemies',
    preventionMl: 'തണൽ നിലനിർത്തുക, പ്രകൃതിദത്ത ശത്രുക്കളെ സംരക്ഷിക്കുക',
    control: 'Spray Dimethoate or neem oil',
    controlMl: 'ഡൈമെത്തോയേറ്റ് അല്ലെങ്കിൽ വേപ്പെണ്ണ തളിക്കുക',
  },
];

// Best Practices Library
const bestPractices: Array<{
  crop: string;
  soilType: string;
  irrigationType: string;
  tip: string;
  tipMl: string;
  season: string;
}> = [
  { crop: 'Rice', soilType: 'Alluvial', irrigationType: 'Canal', tip: 'Maintain 5cm standing water during tillering stage for best yield', tipMl: 'ടില്ലറിംഗ് ഘട്ടത്തിൽ 5 സെ.മീ. വെള്ളം നിലനിർത്തുക', season: 'monsoon' },
  { crop: 'Rice', soilType: 'Clay', irrigationType: 'any', tip: 'Apply green manure before transplanting to improve soil structure', tipMl: 'നടീൽ മുമ്പ് പച്ചവളം ചേർത്ത് മണ്ണിന്റെ ഘടന മെച്ചപ്പെടുത്തുക', season: 'monsoon' },
  { crop: 'Coconut', soilType: 'Laterite', irrigationType: 'any', tip: 'Apply lime to correct soil acidity, maintain basin around tree', tipMl: 'മണ്ണിന്റെ അമ്ലത്വം കുറയ്ക്കാൻ കുമ്മായം ചേർക്കുക', season: 'all' },
  { crop: 'Coconut', soilType: 'any', irrigationType: 'Drip', tip: 'Drip irrigation saves 40% water, install 8 drippers per palm', tipMl: 'ഡ്രിപ്പ് ഇറിഗേഷൻ 40% വെള്ളം ലാഭിക്കുന്നു', season: 'summer' },
  { crop: 'Banana', soilType: 'any', irrigationType: 'any', tip: 'Desuckering: Keep only 1 healthy sucker per plant for better yield', tipMl: 'ഓരോ ചെടിക്കും 1 ആരോഗ്യമുള്ള കന്ന് മാത്രം നിർത്തുക', season: 'all' },
  { crop: 'Banana', soilType: 'Sandy', irrigationType: 'any', tip: 'Increase irrigation frequency in sandy soil, apply mulching', tipMl: 'മണൽ മണ്ണിൽ ജലസേചന ആവൃത്തി കൂട്ടുക', season: 'summer' },
  { crop: 'Pepper', soilType: 'any', irrigationType: 'any', tip: 'Apply organic mulch around base to retain moisture and cool roots', tipMl: 'ഈർപ്പം നിലനിർത്താൻ ചുവട്ടിൽ ജൈവ പുത ഇടുക', season: 'summer' },
  { crop: 'Pepper', soilType: 'any', irrigationType: 'any', tip: 'Prune weak branches after harvest, apply cow dung slurry', tipMl: 'വിളവെടുപ്പിന് ശേഷം ദുർബലമായ ശാഖകൾ മുറിക്കുക', season: 'post-monsoon' },
  { crop: 'Cardamom', soilType: 'any', irrigationType: 'Sprinkler', tip: 'Maintain 60-70% shade, irrigate during dry spells', tipMl: '60-70% തണൽ നിലനിർത്തുക, വരണ്ട കാലത്ത് നനയ്ക്കുക', season: 'summer' },
  { crop: 'Rubber', soilType: 'Laterite', irrigationType: 'any', tip: 'Rest period during February-April, resume tapping after pre-monsoon showers', tipMl: 'ഫെബ്രുവരി-ഏപ്രിൽ വിശ്രമ കാലം, ഇടവപ്പാതി മഴയ്ക്ക് ശേഷം ടാപ്പിംഗ്', season: 'summer' },
];

// Helper function to calculate crop stage
function calculateCropStage(cropName: string, sowingDate: string): { stage: string; stageMl: string; daysSinceSowing: number; operations: string; operationsMl: string } | null {
  const calendar = cropCalendars[cropName];
  if (!calendar) return null;
  
  const sowing = new Date(sowingDate);
  const today = new Date();
  const daysSinceSowing = Math.floor((today.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24));
  
  for (const stage of calendar.stages) {
    if (daysSinceSowing >= stage.dayStart && daysSinceSowing <= stage.dayEnd) {
      return {
        stage: stage.nameEn,
        stageMl: stage.name,
        daysSinceSowing,
        operations: stage.operations,
        operationsMl: stage.operationsMl,
      };
    }
  }
  
  // Return last stage if past all stages
  const lastStage = calendar.stages[calendar.stages.length - 1];
  return {
    stage: lastStage.nameEn,
    stageMl: lastStage.name,
    daysSinceSowing,
    operations: lastStage.operations,
    operationsMl: lastStage.operationsMl,
  };
}

// Helper function to get pest risks based on weather
function getPestRisks(crops: string[], humidity: number, temp: number, isRainy: boolean): typeof pestKnowledge {
  return pestKnowledge.filter(pest => {
    const cropMatch = crops.some(c => c.toLowerCase().includes(pest.crop.toLowerCase()));
    if (!cropMatch) return false;
    
    const humidityRisk = 
      (pest.climateRisk.humidity === 'high' && humidity > 70) ||
      (pest.climateRisk.humidity === 'medium' && humidity > 50) ||
      (pest.climateRisk.humidity === 'low' && humidity < 50);
    
    const tempParts = pest.climateRisk.temp.split('-').map(Number);
    const tempRisk = temp >= tempParts[0] && temp <= tempParts[1];
    
    const rainRisk = !pest.climateRisk.rain || isRainy === pest.climateRisk.rain;
    
    return humidityRisk || tempRisk || rainRisk;
  });
}

// Helper function to get best practices
function getRelevantPractices(crops: string[], soilType: string, irrigationType: string): typeof bestPractices {
  const month = new Date().getMonth();
  let currentSeason = 'monsoon';
  if (month >= 2 && month <= 5) currentSeason = 'summer';
  else if (month >= 9 && month <= 11) currentSeason = 'post-monsoon';
  
  return bestPractices.filter(practice => {
    const cropMatch = crops.some(c => c.toLowerCase().includes(practice.crop.toLowerCase())) || practice.crop === 'any';
    const soilMatch = practice.soilType === 'any' || soilType?.toLowerCase().includes(practice.soilType.toLowerCase());
    const irrigationMatch = practice.irrigationType === 'any' || irrigationType?.toLowerCase().includes(practice.irrigationType.toLowerCase());
    const seasonMatch = practice.season === 'all' || practice.season === currentSeason;
    
    return cropMatch && (soilMatch || irrigationMatch) && seasonMatch;
  });
}

// Helper function to generate proactive advisory
function generateProactiveAdvisory(
  farmerContext: any,
  weather: any,
  language: string
): string {
  const advisories: string[] = [];
  const isMalayalam = language === 'ml';
  
  if (!farmerContext) return '';
  
  // Weather-based advisories
  if (weather) {
    if (weather.rainProbability > 60) {
      advisories.push(isMalayalam 
        ? `⚠️ മഴ സാധ്യത ${weather.rainProbability}% - ഇന്ന് കീടനാശിനി തളിക്കരുത്`
        : `⚠️ Rain probability ${weather.rainProbability}% - Avoid spraying pesticides today`);
    }
    if (weather.humidity > 80) {
      advisories.push(isMalayalam
        ? `🌫️ ഉയർന്ന ഈർപ്പം (${weather.humidity}%) - കുമിൾ രോഗ സാധ്യത, വായു സഞ്ചാരം ഉറപ്പാക്കുക`
        : `🌫️ High humidity (${weather.humidity}%) - Fungal disease risk, ensure good air circulation`);
    }
    if (weather.temperature > 35) {
      advisories.push(isMalayalam
        ? `🌡️ ഉയർന്ന താപനില (${weather.temperature}°C) - രാവിലെ നേരത്തെ നനയ്ക്കുക, മൾച്ചിംഗ് ചെയ്യുക`
        : `🌡️ High temperature (${weather.temperature}°C) - Irrigate early morning, apply mulching`);
    }
  }
  
  // Crop stage advisories
  if (farmerContext.crops && farmerContext.crops.length > 0) {
    for (const crop of farmerContext.crops) {
      if (crop.planting_date) {
        const stageInfo = calculateCropStage(crop.name, crop.planting_date);
        if (stageInfo) {
          advisories.push(isMalayalam
            ? `🌱 ${crop.name}: ${stageInfo.stageMl} ഘട്ടം (${stageInfo.daysSinceSowing} ദിവസം) - ${stageInfo.operationsMl}`
            : `🌱 ${crop.name}: ${stageInfo.stage} stage (Day ${stageInfo.daysSinceSowing}) - ${stageInfo.operations}`);
        }
      }
    }
  }
  
  // Recent activity advisories
  if (farmerContext.recentActivities && farmerContext.recentActivities.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const recentIrrigation = farmerContext.recentActivities.find(
      (a: any) => a.activity_type === 'irrigation' && (a.activity_date === today || a.activity_date === yesterday)
    );
    if (recentIrrigation) {
      advisories.push(isMalayalam
        ? `💧 ഇന്നലെ/ഇന്ന് നനച്ചു - അടുത്ത ജലസേചനം ഒഴിവാക്കുക`
        : `💧 Recently irrigated - Skip next irrigation cycle`);
    }
    
    const recentSpray = farmerContext.recentActivities.find(
      (a: any) => a.activity_type === 'pesticide' && (a.activity_date === today || a.activity_date === yesterday)
    );
    if (recentSpray && weather?.rainProbability > 40) {
      advisories.push(isMalayalam
        ? `⚠️ അടുത്തിടെ തളിച്ചു, മഴ പ്രതീക്ഷിക്കുന്നു - പുനർ പ്രയോഗം ആവശ്യമായേക്കാം`
        : `⚠️ Recently sprayed but rain expected - May need reapplication`);
    }
  }
  
  // Pest risk advisories
  if (farmerContext.crops && weather) {
    const cropNames = farmerContext.crops.map((c: any) => c.name);
    const pestRisks = getPestRisks(cropNames, weather.humidity || 70, weather.temperature || 28, weather.rainProbability > 50);
    
    if (pestRisks.length > 0) {
      const topRisk = pestRisks[0];
      advisories.push(isMalayalam
        ? `🐛 ${topRisk.pestMl} സാധ്യത (${topRisk.crop}) - ${topRisk.preventionMl}`
        : `🐛 ${topRisk.pest} risk for ${topRisk.crop} - ${topRisk.prevention}`);
    }
  }
  
  // Best practices
  if (farmerContext.farm && farmerContext.crops) {
    const cropNames = farmerContext.crops.map((c: any) => c.name);
    const practices = getRelevantPractices(cropNames, farmerContext.farm.soil_type, farmerContext.farm.water_source);
    
    if (practices.length > 0) {
      const tip = practices[0];
      advisories.push(isMalayalam
        ? `💡 ടിപ്പ്: ${tip.tipMl}`
        : `💡 Tip: ${tip.tip}`);
    }
  }
  
  return advisories.join('\n');
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

    console.log("Processing chat request with", messages.length, "messages");
    console.log("Farmer context:", farmerContext);
    console.log("Language:", language);
    console.log("Weather data:", weather);

    // Get language instruction
    const langInstruction = languageInstructions[language] || languageInstructions['en'];

    // Generate proactive advisory based on context
    const proactiveAdvisory = generateProactiveAdvisory(farmerContext, weather, language);
    console.log("Generated proactive advisory:", proactiveAdvisory);

    // Build personalized system prompt with farmer context and knowledge engine
    let systemPrompt = `You are Krishi Mitra (കൃഷി മിത്ര / कृषि मित्र), an intelligent AI farming assistant for Kerala farmers. 

IMPORTANT LANGUAGE INSTRUCTION: ${langInstruction}

You provide personalized, proactive, and contextual advice based on:
- Farmer's specific profile, location, and farm details
- Current crop stages calculated from sowing dates
- Real-time weather conditions
- Recent farming activities
- Pest and disease risks for the region
- Best practices from agricultural knowledge base

You excel at:
- Crop management and stage-specific recommendations
- Pest and disease identification with prevention/control measures
- Weather-based farming advisories (when to irrigate, spray, harvest)
- Soil health and fertilization schedules
- Government schemes and subsidies for Kerala farmers
- Market prices and selling strategies

KNOWLEDGE ENGINE DATA:
You have access to detailed crop calendars, pest knowledge, and best practices. Use this to provide accurate, timely advice.

${proactiveAdvisory ? `\n--- TODAY'S PROACTIVE ADVISORIES ---\n${proactiveAdvisory}\n---\nIncorporate these advisories naturally in your responses when relevant.\n` : ''}`;

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
        systemPrompt += `\n\nCurrent Crops with Stage Analysis:`;
        farmerContext.crops.forEach((crop: any, index: number) => {
          systemPrompt += `\n${index + 1}. ${crop.name}${crop.variety ? ` (${crop.variety})` : ''}`;
          if (crop.area) systemPrompt += ` - Area: ${crop.area} ${crop.area_unit || 'acres'}`;
          if (crop.current_stage) systemPrompt += ` - Stage: ${crop.current_stage}`;
          if (crop.health_status) systemPrompt += ` - Health: ${crop.health_status}`;
          if (crop.planting_date) {
            systemPrompt += ` - Planted: ${crop.planting_date}`;
            const stageInfo = calculateCropStage(crop.name, crop.planting_date);
            if (stageInfo) {
              systemPrompt += `\n   📊 Calculated Stage: ${stageInfo.stage} (Day ${stageInfo.daysSinceSowing})`;
              systemPrompt += `\n   📋 Recommended: ${stageInfo.operations}`;
            }
          }
        });
        
        // Add pest risks for farmer's crops
        if (weather) {
          const cropNames = farmerContext.crops.map((c: any) => c.name);
          const pestRisks = getPestRisks(cropNames, weather.humidity || 70, weather.temperature || 28, weather.rainProbability > 50);
          if (pestRisks.length > 0) {
            systemPrompt += `\n\n⚠️ Current Pest/Disease Risks:`;
            pestRisks.slice(0, 3).forEach(risk => {
              systemPrompt += `\n- ${risk.pest} (${risk.crop}): ${risk.symptoms}`;
              systemPrompt += `\n  Prevention: ${risk.prevention}`;
            });
          }
        }
      }
      
      if (farmerContext.recentActivities && farmerContext.recentActivities.length > 0) {
        systemPrompt += `\n\nRecent Activities (last 7 days):`;
        farmerContext.recentActivities.forEach((activity: any) => {
          systemPrompt += `\n- ${activity.activity_date}: ${activity.title} (${activity.activity_type})`;
          if (activity.description) systemPrompt += ` - ${activity.description}`;
        });
      }
      
      // Add weather context
      if (weather) {
        systemPrompt += `\n\n🌤️ Current Weather:`;
        systemPrompt += `\n- Temperature: ${weather.temperature || 'N/A'}°C`;
        systemPrompt += `\n- Humidity: ${weather.humidity || 'N/A'}%`;
        systemPrompt += `\n- Condition: ${weather.condition || 'N/A'}`;
        if (weather.rainProbability !== undefined) {
          systemPrompt += `\n- Rain Probability: ${weather.rainProbability}%`;
        }
      }
      
      // Add best practices for farmer's context
      if (farmerContext.farm && farmerContext.crops) {
        const cropNames = farmerContext.crops.map((c: any) => c.name);
        const practices = getRelevantPractices(cropNames, farmerContext.farm.soil_type, farmerContext.farm.water_source);
        if (practices.length > 0) {
          systemPrompt += `\n\n💡 Relevant Best Practices:`;
          practices.slice(0, 3).forEach(practice => {
            systemPrompt += `\n- ${practice.tip}`;
          });
        }
      }
      
      systemPrompt += `\n\n--- END OF FARMER PROFILE ---`;
      systemPrompt += `\n\nUse ALL the above information to provide highly personalized, proactive advice. Address the farmer by name. Consider their specific crops, stages, location, weather, and recent activities. Be proactive - warn about upcoming needs, pest risks, and weather impacts. Remember to always respond in ${language === 'ml' ? 'Malayalam' : language === 'hi' ? 'Hindi' : 'English'}.`;
    }

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
