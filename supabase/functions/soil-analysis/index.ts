import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SoilInput {
  N: number;
  P: number;
  K: number;
  pH: number;
  language?: string;
}

interface NutrientStatus {
  level: 'Low' | 'Medium' | 'Optimal';
  levelMl: string;
  value: number;
  ideal: { min: number; max: number };
}

interface PHStatus {
  category: 'Strongly Acidic' | 'Acidic' | 'Slightly Acidic' | 'Neutral' | 'Slightly Alkaline' | 'Alkaline' | 'Strongly Alkaline';
  categoryMl: string;
  value: number;
}

interface Recommendation {
  type: string;
  typeMl: string;
  message: string;
  messageMl: string;
  priority: 'high' | 'medium' | 'low';
}

interface SuitableCrop {
  name: string;
  nameMl: string;
  icon: string;
  reason: string;
  reasonMl: string;
}

interface NutrientRange {
  low: number;
  medium: number;
  high: number;
  ideal: { min: number; max: number };
}

function analyzeNutrient(value: number, nutrient: 'N' | 'P' | 'K'): NutrientStatus {
  // Indian Standard ranges for soil nutrients (kg/ha)
  const ranges: Record<'N' | 'P' | 'K', NutrientRange> = {
    N: { low: 280, medium: 560, high: 560, ideal: { min: 280, max: 560 } },  // N: <280 Low, 280-560 Medium, >560 High
    P: { low: 10, medium: 25, high: 25, ideal: { min: 10, max: 25 } },       // P: <10 Low, 10-25 Medium, >25 High
    K: { low: 110, medium: 280, high: 280, ideal: { min: 110, max: 280 } }   // K: <110 Low, 110-280 Medium, >280 High
  };

  const range = ranges[nutrient];
  
  if (value < range.low) {
    return { level: 'Low', levelMl: 'കുറവ്', value, ideal: range.ideal };
  } else if (value <= range.medium) {
    return { level: 'Medium', levelMl: 'ഇടത്തരം', value, ideal: range.ideal };
  } else {
    return { level: 'Optimal', levelMl: 'ഉചിതം', value, ideal: range.ideal };
  }
}

function analyzePH(value: number): PHStatus {
  // Simplified pH classification as per user requirements
  // Acidic (<6.5), Neutral (6.5–7.5), Alkaline (>7.5)
  if (value < 6.5) {
    return { category: 'Acidic', categoryMl: 'അമ്ലത്വം', value };
  } else if (value <= 7.5) {
    return { category: 'Neutral', categoryMl: 'നിഷ്പക്ഷം', value };
  } else {
    return { category: 'Alkaline', categoryMl: 'ക്ഷാരത്വം', value };
  }
}

function generateRecommendations(
  nStatus: NutrientStatus,
  pStatus: NutrientStatus,
  kStatus: NutrientStatus,
  phStatus: PHStatus
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Nitrogen recommendations
  if (nStatus.level === 'Low') {
    recommendations.push({
      type: 'Nitrogen Deficiency',
      typeMl: 'നൈട്രജൻ കുറവ്',
      message: 'Apply Urea (46% N) at 50-80 kg/ha. Consider green manure crops or neem cake for organic options.',
      messageMl: 'യൂറിയ (46% N) 50-80 കി.ഗ്രാം/ഹെക്ടർ നിരക്കിൽ പ്രയോഗിക്കുക. ജൈവ ബദലുകളായി പച്ചില വളമോ വേപ്പിൻ പിണ്ണാക്കോ ഉപയോഗിക്കാം.',
      priority: 'high'
    });
  } else if (nStatus.level === 'Medium') {
    recommendations.push({
      type: 'Nitrogen Maintenance',
      typeMl: 'നൈട്രജൻ പരിപാലനം',
      message: 'Apply Urea at 30-40 kg/ha or use compost for gradual nitrogen release.',
      messageMl: 'യൂറിയ 30-40 കി.ഗ്രാം/ഹെക്ടർ പ്രയോഗിക്കുക അല്ലെങ്കിൽ ക്രമേണ നൈട്രജൻ പുറത്തുവിടാൻ കമ്പോസ്റ്റ് ഉപയോഗിക്കുക.',
      priority: 'medium'
    });
  }

  // Phosphorus recommendations
  if (pStatus.level === 'Low') {
    recommendations.push({
      type: 'Phosphorus Deficiency',
      typeMl: 'ഫോസ്ഫറസ് കുറവ്',
      message: 'Apply DAP (18-46-0) at 100-150 kg/ha or Single Super Phosphate (SSP) at 250-375 kg/ha. Bone meal is an organic alternative.',
      messageMl: 'DAP (18-46-0) 100-150 കി.ഗ്രാം/ഹെക്ടർ അല്ലെങ്കിൽ SSP 250-375 കി.ഗ്രാം/ഹെക്ടർ പ്രയോഗിക്കുക. ജൈവ ബദലായി എല്ലുപൊടി ഉപയോഗിക്കാം.',
      priority: 'high'
    });
  } else if (pStatus.level === 'Medium') {
    recommendations.push({
      type: 'Phosphorus Maintenance',
      typeMl: 'ഫോസ്ഫറസ് പരിപാലനം',
      message: 'Apply DAP at 50-75 kg/ha or rock phosphate for slow release.',
      messageMl: 'DAP 50-75 കി.ഗ്രാം/ഹെക്ടർ അല്ലെങ്കിൽ റോക്ക് ഫോസ്ഫേറ്റ് പ്രയോഗിക്കുക.',
      priority: 'medium'
    });
  }

  // Potassium recommendations
  if (kStatus.level === 'Low') {
    recommendations.push({
      type: 'Potassium Deficiency',
      typeMl: 'പൊട്ടാസ്യം കുറവ്',
      message: 'Apply Muriate of Potash (MOP - 60% K2O) at 80-120 kg/ha. Banana stem ash and wood ash are organic alternatives.',
      messageMl: 'MOP (60% K2O) 80-120 കി.ഗ്രാം/ഹെക്ടർ പ്രയോഗിക്കുക. ജൈവ ബദലുകളായി വാഴത്തണ്ട് ചാരവും മരച്ചാരവും ഉപയോഗിക്കാം.',
      priority: 'high'
    });
  } else if (kStatus.level === 'Medium') {
    recommendations.push({
      type: 'Potassium Maintenance',
      typeMl: 'പൊട്ടാസ്യം പരിപാലനം',
      message: 'Apply MOP at 40-60 kg/ha or use compost enriched with wood ash.',
      messageMl: 'MOP 40-60 കി.ഗ്രാം/ഹെക്ടർ അല്ലെങ്കിൽ മരച്ചാരം ചേർത്ത കമ്പോസ്റ്റ് ഉപയോഗിക്കുക.',
      priority: 'medium'
    });
  }

  // pH correction recommendations
  if (phStatus.value < 5.5) {
    recommendations.push({
      type: 'Soil pH Correction (Acidic)',
      typeMl: 'മണ്ണിന്റെ pH ശരിയാക്കൽ (അമ്ലത്വം)',
      message: 'Apply agricultural lime (CaCO3) at 2-4 tonnes/ha to raise pH. Dolomite lime provides both calcium and magnesium.',
      messageMl: 'pH ഉയർത്താൻ കാർഷിക ചുണ്ണാമ്പ് (CaCO3) 2-4 ടൺ/ഹെക്ടർ പ്രയോഗിക്കുക. ഡോളമൈറ്റ് ചുണ്ണാമ്പ് കാൽസ്യവും മഗ്നീഷ്യവും നൽകുന്നു.',
      priority: 'high'
    });
  } else if (phStatus.value > 8.0) {
    recommendations.push({
      type: 'Soil pH Correction (Alkaline)',
      typeMl: 'മണ്ണിന്റെ pH ശരിയാക്കൽ (ക്ഷാരത്വം)',
      message: 'Apply gypsum (CaSO4) at 2-5 tonnes/ha to lower pH. Sulfur application can also help reduce alkalinity.',
      messageMl: 'pH കുറയ്ക്കാൻ ജിപ്സം (CaSO4) 2-5 ടൺ/ഹെക്ടർ പ്രയോഗിക്കുക. സൾഫർ പ്രയോഗവും ക്ഷാരത്വം കുറയ്ക്കാൻ സഹായിക്കും.',
      priority: 'high'
    });
  }

  // General organic recommendation
  recommendations.push({
    type: 'Organic Matter',
    typeMl: 'ജൈവ വസ്തുക്കൾ',
    message: 'Add well-decomposed farmyard manure (FYM) at 10-15 tonnes/ha to improve overall soil health and nutrient retention.',
    messageMl: 'മണ്ണിന്റെ ആരോഗ്യവും പോഷക നിലനിർത്തലും മെച്ചപ്പെടുത്താൻ നന്നായി അഴുകിയ തൊഴുത്ത് വളം (FYM) 10-15 ടൺ/ഹെക്ടർ ചേർക്കുക.',
    priority: 'low'
  });

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function getSuitableCrops(
  nStatus: NutrientStatus,
  pStatus: NutrientStatus,
  kStatus: NutrientStatus,
  phStatus: PHStatus
): SuitableCrop[] {
  const allCrops: (SuitableCrop & { requirements: { nMin: string; pMin: string; kMin: string; phMin: number; phMax: number } })[] = [
    {
      name: 'Rice (Paddy)',
      nameMl: 'നെല്ല്',
      icon: '🌾',
      reason: 'Thrives in slightly acidic to neutral soils with moderate NPK',
      reasonMl: 'ഇടത്തരം NPK ഉള്ള അല്പം അമ്ലത്വം മുതൽ നിഷ്പക്ഷ മണ്ണിൽ വളരുന്നു',
      requirements: { nMin: 'Medium', pMin: 'Medium', kMin: 'Medium', phMin: 5.5, phMax: 7.5 }
    },
    {
      name: 'Coconut',
      nameMl: 'തെങ്ങ്',
      icon: '🥥',
      reason: 'Tolerates varied NPK levels, prefers slightly acidic to neutral pH',
      reasonMl: 'വ്യത്യസ്ത NPK നിലകൾ സഹിക്കുന്നു, അല്പം അമ്ലത്വം മുതൽ നിഷ്പക്ഷ pH ഇഷ്ടപ്പെടുന്നു',
      requirements: { nMin: 'Low', pMin: 'Low', kMin: 'Medium', phMin: 5.0, phMax: 8.0 }
    },
    {
      name: 'Banana',
      nameMl: 'വാഴ',
      icon: '🍌',
      reason: 'Requires high potassium and moderate nitrogen for good fruit development',
      reasonMl: 'നല്ല ഫല വികസനത്തിന് ഉയർന്ന പൊട്ടാസ്യവും ഇടത്തരം നൈട്രജനും ആവശ്യമാണ്',
      requirements: { nMin: 'Medium', pMin: 'Medium', kMin: 'Medium', phMin: 5.5, phMax: 7.0 }
    },
    {
      name: 'Pepper',
      nameMl: 'കുരുമുളക്',
      icon: '🫑',
      reason: 'Prefers slightly acidic soil with good organic matter',
      reasonMl: 'നല്ല ജൈവ വസ്തുക്കളുള്ള അല്പം അമ്ല മണ്ണ് ഇഷ്ടപ്പെടുന്നു',
      requirements: { nMin: 'Medium', pMin: 'Medium', kMin: 'Medium', phMin: 5.5, phMax: 7.0 }
    },
    {
      name: 'Rubber',
      nameMl: 'റബ്ബർ',
      icon: '🌳',
      reason: 'Grows well in acidic soils with moderate nutrient levels',
      reasonMl: 'ഇടത്തരം പോഷക നിലകളുള്ള അമ്ല മണ്ണിൽ നന്നായി വളരുന്നു',
      requirements: { nMin: 'Low', pMin: 'Low', kMin: 'Low', phMin: 4.5, phMax: 6.5 }
    },
    {
      name: 'Cardamom',
      nameMl: 'ഏലം',
      icon: '🌿',
      reason: 'Thrives in acidic soils with high organic matter',
      reasonMl: 'ഉയർന്ന ജൈവ വസ്തുക്കളുള്ള അമ്ല മണ്ണിൽ വളരുന്നു',
      requirements: { nMin: 'Medium', pMin: 'Medium', kMin: 'Medium', phMin: 5.0, phMax: 6.5 }
    },
    {
      name: 'Ginger',
      nameMl: 'ഇഞ്ചി',
      icon: '🫚',
      reason: 'Prefers slightly acidic to neutral soil with good drainage',
      reasonMl: 'നല്ല നീർവാർച്ചയുള്ള അല്പം അമ്ലത്വം മുതൽ നിഷ്പക്ഷ മണ്ണ് ഇഷ്ടപ്പെടുന്നു',
      requirements: { nMin: 'Medium', pMin: 'Medium', kMin: 'Medium', phMin: 5.5, phMax: 7.0 }
    },
    {
      name: 'Turmeric',
      nameMl: 'മഞ്ഞൾ',
      icon: '🟡',
      reason: 'Grows well in slightly acidic to neutral loamy soils',
      reasonMl: 'അല്പം അമ്ലത്വം മുതൽ നിഷ്പക്ഷ ക്ലേ മണ്ണിൽ നന്നായി വളരുന്നു',
      requirements: { nMin: 'Medium', pMin: 'Medium', kMin: 'Medium', phMin: 5.5, phMax: 7.5 }
    },
    {
      name: 'Tapioca',
      nameMl: 'മരച്ചീനി',
      icon: '🥔',
      reason: 'Tolerant to low fertility and acidic conditions',
      reasonMl: 'കുറഞ്ഞ ഫലഭൂയിഷ്ഠതയും അമ്ല സാഹചര്യങ്ങളും സഹിക്കുന്നു',
      requirements: { nMin: 'Low', pMin: 'Low', kMin: 'Low', phMin: 4.5, phMax: 8.0 }
    },
    {
      name: 'Arecanut',
      nameMl: 'അടയ്ക്ക',
      icon: '🌴',
      reason: 'Prefers slightly acidic soils with moderate nutrients',
      reasonMl: 'ഇടത്തരം പോഷകങ്ങളുള്ള അല്പം അമ്ല മണ്ണ് ഇഷ്ടപ്പെടുന്നു',
      requirements: { nMin: 'Medium', pMin: 'Medium', kMin: 'Medium', phMin: 5.0, phMax: 7.0 }
    },
    {
      name: 'Tea',
      nameMl: 'ചായ',
      icon: '🍵',
      reason: 'Requires acidic soil conditions for optimal growth',
      reasonMl: 'ഒപ്റ്റിമൽ വളർച്ചയ്ക്ക് അമ്ല മണ്ണ് സാഹചര്യങ്ങൾ ആവശ്യമാണ്',
      requirements: { nMin: 'Medium', pMin: 'Medium', kMin: 'Medium', phMin: 4.5, phMax: 5.5 }
    },
    {
      name: 'Vegetables',
      nameMl: 'പച്ചക്കറികൾ',
      icon: '🥬',
      reason: 'Most vegetables prefer neutral pH with good nutrient levels',
      reasonMl: 'മിക്ക പച്ചക്കറികളും നല്ല പോഷക നിലകളുള്ള നിഷ്പക്ഷ pH ഇഷ്ടപ്പെടുന്നു',
      requirements: { nMin: 'Medium', pMin: 'Medium', kMin: 'Medium', phMin: 6.0, phMax: 7.5 }
    },
  ];

  const levelOrder = { 'Low': 0, 'Medium': 1, 'Optimal': 2 };
  
  return allCrops.filter(crop => {
    const nOk = levelOrder[nStatus.level] >= levelOrder[crop.requirements.nMin as keyof typeof levelOrder];
    const pOk = levelOrder[pStatus.level] >= levelOrder[crop.requirements.pMin as keyof typeof levelOrder];
    const kOk = levelOrder[kStatus.level] >= levelOrder[crop.requirements.kMin as keyof typeof levelOrder];
    const phOk = phStatus.value >= crop.requirements.phMin && phStatus.value <= crop.requirements.phMax;
    
    return phOk && (nOk || pOk || kOk);
  }).slice(0, 12).map(({ name, nameMl, icon, reason, reasonMl }) => ({ name, nameMl, icon, reason, reasonMl }));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { N, P, K, pH, language = 'en' }: SoilInput = await req.json();

    console.log('Analyzing soil with values:', { N, P, K, pH, language });

    // Validate inputs
    if (typeof N !== 'number' || typeof P !== 'number' || typeof K !== 'number' || typeof pH !== 'number') {
      throw new Error('Invalid input values. All NPK and pH values must be numbers.');
    }

    if (pH < 0 || pH > 14) {
      throw new Error('pH value must be between 0 and 14');
    }

    // Analyze each nutrient
    const nitrogenStatus = analyzeNutrient(N, 'N');
    const phosphorusStatus = analyzeNutrient(P, 'P');
    const potassiumStatus = analyzeNutrient(K, 'K');
    const phStatus = analyzePH(pH);

    // Generate recommendations
    const recommendations = generateRecommendations(
      nitrogenStatus,
      phosphorusStatus,
      potassiumStatus,
      phStatus
    );

    // Get suitable crops
    const suitableCrops = getSuitableCrops(
      nitrogenStatus,
      phosphorusStatus,
      potassiumStatus,
      phStatus
    );

    // Generate summary
    const summary = {
      en: `Your soil has ${nitrogenStatus.level.toLowerCase()} nitrogen, ${phosphorusStatus.level.toLowerCase()} phosphorus, and ${potassiumStatus.level.toLowerCase()} potassium levels. The pH is ${phStatus.category.toLowerCase()} at ${pH}.`,
      ml: `നിങ്ങളുടെ മണ്ണിൽ ${nitrogenStatus.levelMl} നൈട്രജൻ, ${phosphorusStatus.levelMl} ഫോസ്ഫറസ്, ${potassiumStatus.levelMl} പൊട്ടാസ്യം എന്നിവയുണ്ട്. pH ${pH} ൽ ${phStatus.categoryMl} ആണ്.`
    };

    const response = {
      nutrientStatus: {
        nitrogen: nitrogenStatus,
        phosphorus: phosphorusStatus,
        potassium: potassiumStatus
      },
      phStatus,
      summary,
      recommendations,
      suitableCrops
    };

    console.log('Analysis complete:', JSON.stringify(response, null, 2));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in soil-analysis function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
