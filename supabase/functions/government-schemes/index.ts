import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FarmerContext {
  location?: string;
  landArea?: number;
  areaUnit?: string;
  crops?: string[];
  soilType?: string;
}

interface Scheme {
  id: string;
  name: string;
  nameHindi?: string;
  department: string;
  benefit: string;
  eligibility: "eligible" | "check" | "not-eligible";
  deadline?: string;
  description: string;
  documents: string[];
  applicationUrl?: string;
  category: string;
  minLandArea?: number;
  maxLandArea?: number;
  applicableStates?: string[];
  applicableCrops?: string[];
}

// Comprehensive list of Indian government schemes for farmers
const allSchemes: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    nameHindi: "पीएम किसान सम्मान निधि",
    department: "Ministry of Agriculture & Farmers Welfare",
    benefit: "₹6,000/year direct transfer in 3 installments",
    eligibility: "eligible",
    description: "Income support scheme providing ₹6,000 per year to all landholding farmer families",
    documents: ["Aadhaar Card", "Land Records", "Bank Account Details"],
    applicationUrl: "https://pmkisan.gov.in",
    category: "Income Support",
    maxLandArea: 100,
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    nameHindi: "प्रधानमंत्री फसल बीमा योजना",
    department: "Ministry of Agriculture",
    benefit: "Crop insurance up to ₹2 lakh coverage",
    eligibility: "eligible",
    deadline: "Kharif: July 31, Rabi: Dec 31",
    description: "Comprehensive crop insurance scheme covering natural calamities, pests & diseases",
    documents: ["Aadhaar Card", "Land Records", "Bank Passbook", "Sowing Certificate"],
    applicationUrl: "https://pmfby.gov.in",
    category: "Insurance",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    nameHindi: "किसान क्रेडिट कार्ड",
    department: "Banks/Cooperative Societies",
    benefit: "Low interest crop loan at 4% p.a.",
    eligibility: "eligible",
    description: "Credit facility for farmers to meet agricultural and other needs at low interest rates",
    documents: ["Aadhaar Card", "Land Records", "Passport Photo", "Identity Proof"],
    applicationUrl: "https://www.pmkisan.gov.in/KCC",
    category: "Credit",
  },
  {
    id: "pkvy",
    name: "Paramparagat Krishi Vikas Yojana (PKVY)",
    nameHindi: "परंपरागत कृषि विकास योजना",
    department: "Ministry of Agriculture",
    benefit: "₹50,000/hectare over 3 years for organic farming",
    eligibility: "check",
    description: "Promotes organic farming through cluster approach with certification support",
    documents: ["Land Records", "Farmer Group Registration", "Bank Details"],
    category: "Organic Farming",
    minLandArea: 1,
  },
  {
    id: "pmksy-pdmc",
    name: "PM Krishi Sinchayee Yojana - Drip Irrigation",
    nameHindi: "पीएम कृषि सिंचाई योजना",
    department: "Ministry of Agriculture/Horticulture",
    benefit: "55-75% subsidy on drip/sprinkler irrigation",
    eligibility: "eligible",
    description: "Subsidy for micro irrigation systems to improve water use efficiency",
    documents: ["Land Records", "Quotation from Supplier", "Bank Details", "Caste Certificate"],
    category: "Irrigation",
    minLandArea: 0.5,
  },
  {
    id: "smam",
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    nameHindi: "कृषि मशीनीकरण उप-मिशन",
    department: "Ministry of Agriculture",
    benefit: "40-50% subsidy on farm machinery",
    eligibility: "eligible",
    description: "Subsidy on purchase of tractors, harvesters, and other farm equipment",
    documents: ["Aadhaar Card", "Land Records", "Bank Details", "Quotation"],
    category: "Mechanization",
    minLandArea: 1,
  },
  {
    id: "soil-health-card",
    name: "Soil Health Card Scheme",
    nameHindi: "मृदा स्वास्थ्य कार्ड योजना",
    department: "Ministry of Agriculture",
    benefit: "Free soil testing and recommendations",
    eligibility: "eligible",
    description: "Free soil testing to provide crop-wise fertilizer recommendations",
    documents: ["Aadhaar Card", "Land Details"],
    applicationUrl: "https://soilhealth.dac.gov.in",
    category: "Soil Health",
  },
  {
    id: "pm-kusum",
    name: "PM-KUSUM (Solar Pump)",
    nameHindi: "पीएम कुसुम",
    department: "Ministry of New & Renewable Energy",
    benefit: "60% subsidy on solar pumps",
    eligibility: "check",
    description: "Subsidy for solar pumps and solarization of grid-connected pumps",
    documents: ["Land Records", "Electricity Bill", "Bank Details", "Aadhaar"],
    category: "Solar Energy",
    minLandArea: 2,
  },
  {
    id: "nmsa",
    name: "National Mission for Sustainable Agriculture",
    nameHindi: "राष्ट्रीय सतत कृषि मिशन",
    department: "Ministry of Agriculture",
    benefit: "Support for climate-resilient practices",
    eligibility: "eligible",
    description: "Promotes sustainable farming practices and climate adaptation",
    documents: ["Land Records", "Farm Plan", "Bank Details"],
    category: "Sustainable Farming",
  },
  {
    id: "agri-infra-fund",
    name: "Agriculture Infrastructure Fund",
    nameHindi: "कृषि अवसंरचना कोष",
    department: "Ministry of Agriculture",
    benefit: "3% interest subvention on loans up to ₹2 crore",
    eligibility: "check",
    description: "Financing for post-harvest infrastructure like warehouses, cold storage",
    documents: ["Project Report", "Land Documents", "Bank Details", "GST Registration"],
    category: "Infrastructure",
    minLandArea: 5,
  },
  {
    id: "rashtriya-krishi-vikas",
    name: "Rashtriya Krishi Vikas Yojana (RKVY)",
    nameHindi: "राष्ट्रीय कृषि विकास योजना",
    department: "Ministry of Agriculture",
    benefit: "Project-based support for agriculture development",
    eligibility: "check",
    description: "Flexible support for state-specific agricultural development projects",
    documents: ["Project Proposal", "Land Records", "Bank Details"],
    category: "Development",
  },
  {
    id: "nmoop",
    name: "National Mission on Oilseeds & Oil Palm",
    nameHindi: "तिलहन और ऑयल पाम मिशन",
    department: "Ministry of Agriculture",
    benefit: "₹30,000-50,000/ha for oil palm cultivation",
    eligibility: "check",
    description: "Support for cultivation of oilseeds and oil palm",
    documents: ["Land Records", "Bank Details", "Caste Certificate"],
    category: "Oilseeds",
    applicableCrops: ["oil palm", "groundnut", "mustard", "soybean", "sunflower"],
  },
  {
    id: "nfsm",
    name: "National Food Security Mission",
    nameHindi: "राष्ट्रीय खाद्य सुरक्षा मिशन",
    department: "Ministry of Agriculture",
    benefit: "Subsidized seeds, demonstrations, equipment",
    eligibility: "eligible",
    description: "Support for increasing production of rice, wheat, pulses, coarse cereals",
    documents: ["Land Records", "Aadhaar", "Bank Details"],
    category: "Food Security",
    applicableCrops: ["rice", "wheat", "pulses", "maize", "bajra", "jowar"],
  },
  {
    id: "horticulture-mission",
    name: "Mission for Integrated Development of Horticulture",
    nameHindi: "एकीकृत बागवानी विकास मिशन",
    department: "Ministry of Agriculture",
    benefit: "40-75% subsidy on orchard development",
    eligibility: "check",
    description: "Support for fruit orchards, vegetables, spices, flowers cultivation",
    documents: ["Land Records", "Bank Details", "Project Report"],
    category: "Horticulture",
    applicableCrops: ["mango", "banana", "coconut", "apple", "vegetables", "spices", "flowers"],
    minLandArea: 0.4,
  },
  {
    id: "pmegp",
    name: "Prime Minister's Employment Generation Programme",
    nameHindi: "प्रधानमंत्री रोजगार सृजन कार्यक्रम",
    department: "Ministry of MSME",
    benefit: "15-35% subsidy on agri-business projects up to ₹50 lakh",
    eligibility: "check",
    description: "Support for setting up agri-based micro enterprises",
    documents: ["Project Report", "Aadhaar", "Bank Details", "Educational Certificates"],
    category: "Entrepreneurship",
  },
  {
    id: "dairy-entrepreneur",
    name: "Dairy Entrepreneurship Development Scheme",
    nameHindi: "डेयरी उद्यमिता विकास योजना",
    department: "NABARD/Dairy Dept",
    benefit: "25-33% subsidy on dairy units",
    eligibility: "check",
    description: "Support for setting up small dairy farms and milk processing",
    documents: ["Project Report", "Land Documents", "Bank Details"],
    category: "Dairy",
  },
  {
    id: "goat-sheep",
    name: "Integrated Scheme for Goat & Sheep Development",
    nameHindi: "बकरी और भेड़ विकास योजना",
    department: "Animal Husbandry Dept",
    benefit: "Up to 50% subsidy on goat/sheep units",
    eligibility: "check",
    description: "Support for establishing goat and sheep rearing units",
    documents: ["Aadhaar", "Bank Details", "Land Certificate"],
    category: "Livestock",
  },
  {
    id: "beekeeping",
    name: "National Beekeeping & Honey Mission",
    nameHindi: "राष्ट्रीय मधुमक्खी पालन मिशन",
    department: "KVIC/Agriculture Dept",
    benefit: "Up to ₹1.5 lakh support per unit",
    eligibility: "eligible",
    description: "Support for beekeeping, honey processing and marketing",
    documents: ["Aadhaar", "Bank Details", "Training Certificate"],
    category: "Beekeeping",
  },
];

// State-specific schemes
const stateSchemes: Record<string, Scheme[]> = {
  kerala: [
    {
      id: "kerala-subhiksha",
      name: "Subhiksha Keralam",
      department: "Kerala Agriculture Dept",
      benefit: "Support for vegetable cultivation",
      eligibility: "eligible",
      description: "State scheme for promoting vegetable self-sufficiency",
      documents: ["Aadhaar", "Land Records", "Bank Details"],
      category: "State Scheme",
      applicableStates: ["Kerala"],
    },
    {
      id: "kerala-coconut",
      name: "Kerala Coconut Mission",
      department: "Kerala Coconut Development Board",
      benefit: "₹40/plant replanting subsidy",
      eligibility: "check",
      description: "Support for coconut replanting and value addition",
      documents: ["Land Records", "Bank Details"],
      category: "State Scheme",
      applicableCrops: ["coconut"],
    },
  ],
  karnataka: [
    {
      id: "karnataka-raitha-siri",
      name: "Raitha Siri",
      department: "Karnataka Agriculture Dept",
      benefit: "Free seeds and fertilizers",
      eligibility: "eligible",
      description: "Subsidized inputs for small and marginal farmers",
      documents: ["Aadhaar", "Land Records", "Caste Certificate"],
      category: "State Scheme",
      applicableStates: ["Karnataka"],
      maxLandArea: 5,
    },
  ],
  tamilnadu: [
    {
      id: "tn-farm-mechanization",
      name: "TN Farm Mechanization Scheme",
      department: "TN Agriculture Dept",
      benefit: "50% subsidy on farm machinery",
      eligibility: "check",
      description: "State subsidy on agricultural machinery",
      documents: ["Aadhaar", "Land Records", "Bank Details"],
      category: "State Scheme",
      applicableStates: ["Tamil Nadu"],
    },
  ],
  maharashtra: [
    {
      id: "mh-magel-tyala",
      name: "Magel Tyala Shet Tale",
      department: "MH Agriculture Dept",
      benefit: "100% subsidy on farm ponds",
      eligibility: "eligible",
      description: "Free farm pond construction for water conservation",
      documents: ["Land Records (7/12 extract)", "Bank Details"],
      category: "State Scheme",
      applicableStates: ["Maharashtra"],
    },
  ],
  punjab: [
    {
      id: "punjab-pusa",
      name: "Punjab Crop Diversification Scheme",
      department: "Punjab Agriculture Dept",
      benefit: "₹12,000/acre for crop diversification",
      eligibility: "check",
      description: "Support for shifting from paddy to other crops",
      documents: ["Land Records", "Bank Details"],
      category: "State Scheme",
      applicableStates: ["Punjab"],
    },
  ],
};

function getStateFromLocation(location: string): string | null {
  const locationLower = location.toLowerCase();
  const stateKeywords: Record<string, string[]> = {
    kerala: ["kerala", "kochi", "thiruvananthapuram", "kozhikode", "thrissur", "kollam", "kottayam", "alappuzha", "palakkad", "malappuram", "kannur", "wayanad", "idukki", "pathanamthitta", "ernakulam", "kasaragod"],
    karnataka: ["karnataka", "bangalore", "bengaluru", "mysore", "mysuru", "hubli", "mangalore", "mangaluru", "belgaum", "belagavi", "dharwad", "davangere", "shimoga", "tumkur", "hassan", "mandya", "chitradurga", "raichur", "bidar", "gulbarga", "kalaburagi"],
    tamilnadu: ["tamil nadu", "tamilnadu", "chennai", "coimbatore", "madurai", "tiruchirappalli", "trichy", "salem", "tirunelveli", "erode", "vellore", "theni", "thanjavur", "dindigul", "tiruppur", "cuddalore", "kanchipuram", "tiruvallur"],
    maharashtra: ["maharashtra", "mumbai", "pune", "nagpur", "nashik", "aurangabad", "solapur", "kolhapur", "sangli", "satara", "ahmednagar", "jalgaon", "akola", "amravati", "chandrapur", "latur", "osmanabad", "beed", "parbhani", "nanded", "yavatmal", "buldhana", "wardha", "washim", "gondia", "bhandara", "gadchiroli", "hingoli", "ratnagiri", "sindhudurg"],
    punjab: ["punjab", "chandigarh", "ludhiana", "amritsar", "jalandhar", "patiala", "bathinda", "mohali", "firozpur", "pathankot", "moga", "barnala", "sangrur", "muktsar", "hoshiarpur", "nawanshahr", "gurdaspur", "kapurthala", "faridkot", "mansa", "fatehgarh sahib", "ropar", "rupnagar", "fazilka", "tarn taran"],
    haryana: ["haryana", "gurgaon", "gurugram", "faridabad", "panipat", "ambala", "karnal", "rohtak", "hisar", "sonipat", "yamunanagar", "sirsa", "bhiwani", "jind", "fatehabad", "rewari", "mahendragarh", "jhajjar", "kaithal", "kurukshetra", "palwal", "nuh", "charkhi dadri"],
    uttarpradesh: ["uttar pradesh", "up", "lucknow", "kanpur", "agra", "varanasi", "meerut", "allahabad", "prayagraj", "bareilly", "aligarh", "moradabad", "saharanpur", "gorakhpur", "noida", "firozabad", "jhansi", "mathura", "muzaffarnagar", "shahjahanpur", "rampur", "ayodhya", "faizabad", "azamgarh", "basti", "deoria", "sultanpur", "gonda", "ballia", "mirzapur", "rae bareli", "unnao", "hardoi", "sitapur", "lakhimpur kheri", "bahraich", "ghazipur", "jaunpur", "pratapgarh", "fatehpur", "banda", "hamirpur", "mahoba", "chitrakoot", "lalitpur", "etawah", "mainpuri", "budaun", "bijnor", "bulandshahr", "ghaziabad", "hapur", "shamli", "baghpat", "muzzafarnagar", "amroha", "sambhal", "pilibhit", "hathras", "etah", "kasganj", "auraiya", "farrukhabad", "kannauj", "kanpur dehat"],
    madhyapradesh: ["madhya pradesh", "mp", "bhopal", "indore", "gwalior", "jabalpur", "ujjain", "sagar", "dewas", "satna", "ratlam", "rewa", "chhindwara", "betul", "khandwa", "khargone", "vidisha", "sehore", "hoshangabad", "dhar", "shajapur", "damoh", "panna", "tikamgarh", "chhatarpur", "datia", "shivpuri", "guna", "ashok nagar", "neemuch", "mandsaur", "morena", "bhind", "balaghat", "mandla", "seoni", "narsinghpur", "rajgarh", "agar", "malwa", "shahdol", "umaria", "sidhi", "singrauli", "anuppur", "dindori", "katni", "barwani", "jhabua", "alirajpur", "burhanpur"],
    rajasthan: ["rajasthan", "jaipur", "jodhpur", "udaipur", "kota", "bikaner", "ajmer", "alwar", "bharatpur", "sikar", "bhilwara", "pali", "tonk", "nagaur", "barmer", "jaisalmer", "churu", "jhunjhunu", "sri ganganagar", "hanumangarh", "bundi", "sawai madhopur", "karauli", "dholpur", "dausa", "rajsamand", "chittorgarh", "banswara", "dungarpur", "pratapgarh", "sirohi", "jalor", "jhalawar", "baran"],
    gujarat: ["gujarat", "ahmedabad", "surat", "vadodara", "rajkot", "bhavnagar", "jamnagar", "junagadh", "gandhinagar", "anand", "kheda", "mehsana", "patan", "banaskantha", "sabarkantha", "aravalli", "mahisagar", "dahod", "panchmahal", "chhota udepur", "narmada", "bharuch", "tapi", "surat", "navsari", "valsad", "dang", "morbi", "surendranagar", "kutch", "amreli", "gir somnath", "porbandar", "devbhumi dwarka", "botad"],
    andhrapradesh: ["andhra pradesh", "ap", "hyderabad", "vijayawada", "visakhapatnam", "vizag", "guntur", "nellore", "kurnool", "rajahmundry", "kakinada", "tirupati", "kadapa", "anantapur", "eluru", "ongole", "vizianagaram", "srikakulam", "prakasam", "krishna", "west godavari", "east godavari", "chittoor"],
    telangana: ["telangana", "hyderabad", "secunderabad", "warangal", "nizamabad", "karimnagar", "ramagundam", "khammam", "mahbubnagar", "nalgonda", "adilabad", "suryapet", "siddipet", "miryalaguda", "jagtial", "mancherial", "bhongir", "wanaparthy", "sangareddy", "vikarabad", "medak", "medchal", "rangareddy"],
    westbengal: ["west bengal", "wb", "kolkata", "howrah", "durgapur", "siliguri", "asansol", "bardhaman", "burdwan", "malda", "murshidabad", "birbhum", "bankura", "purulia", "hooghly", "nadia", "north 24 parganas", "south 24 parganas", "jalpaiguri", "darjeeling", "cooch behar", "alipurduar", "dinajpur", "midnapore"],
    odisha: ["odisha", "orissa", "bhubaneswar", "cuttack", "rourkela", "berhampur", "sambalpur", "puri", "balasore", "bhadrak", "jajpur", "kendrapara", "jagatsinghpur", "khordha", "nayagarh", "ganjam", "gajapati", "koraput", "malkangiri", "nabarangpur", "rayagada", "kandhamal", "boudh", "kalahandi", "nuapada", "bargarh", "bolangir", "sonepur", "sundargarh", "jharsuguda", "deogarh", "angul", "dhenkanal", "keonjhar", "mayurbhanj"],
    bihar: ["bihar", "patna", "gaya", "bhagalpur", "muzaffarpur", "purnia", "darbhanga", "bihar sharif", "arrah", "begusarai", "katihar", "munger", "chhapra", "samastipur", "hajipur", "sasaram", "dehri", "siwan", "motihari", "saharsa", "nawada", "bettiah", "bagaha", "kishanganj", "madhubani", "supaul", "madhepura", "sitamarhi", "sheohar", "gopalganj", "jehanabad", "aurangabad", "arwal", "jamui", "lakhisarai", "sheikhpura", "nalanda", "khagaria", "vaishali", "saran", "bhojpur", "buxar", "kaimur", "rohtas", "banka"],
    assam: ["assam", "guwahati", "silchar", "dibrugarh", "jorhat", "nagaon", "tezpur", "tinsukia", "bongaigaon", "dhubri", "goalpara", "barpeta", "nalbari", "kokrajhar", "kamrup", "darrang", "sonitpur", "lakhimpur", "dhemaji", "sivasagar", "golaghat", "karbi anglong", "dima hasao", "cachar", "karimganj", "hailakandi", "morigaon", "hojai", "biswanath", "charaideo", "majuli", "south salmara", "west karbi anglong", "bajali", "tamulpur", "udalguri", "baksa", "chirang"],
    jharkhand: ["jharkhand", "ranchi", "jamshedpur", "dhanbad", "bokaro", "hazaribagh", "deoghar", "giridih", "ramgarh", "dumka", "chatra", "koderma", "gumla", "lohardaga", "simdega", "khunti", "latehar", "palamu", "garhwa", "west singhbhum", "east singhbhum", "seraikela", "kharsawan", "godda", "sahebganj", "pakur", "jamtara"],
    chhattisgarh: ["chhattisgarh", "raipur", "bhilai", "bilaspur", "korba", "durg", "rajnandgaon", "raigarh", "jagdalpur", "ambikapur", "dhamtari", "mahasamund", "kawardha", "mungeli", "kondagaon", "kanker", "narayanpur", "bijapur", "sukma", "dantewada", "bastar", "janjgir", "champa", "jashpur", "surguja", "surajpur", "balrampur", "koriya", "balod", "bemetara", "gariaband"],
  };

  for (const [state, keywords] of Object.entries(stateKeywords)) {
    if (keywords.some(keyword => locationLower.includes(keyword))) {
      return state;
    }
  }
  return null;
}

function getEligibility(scheme: Scheme, context: FarmerContext): "eligible" | "check" | "not-eligible" {
  const landArea = context.landArea || 0;
  const crops = context.crops?.map(c => c.toLowerCase()) || [];
  
  // Check land area requirements
  if (scheme.minLandArea && landArea < scheme.minLandArea) {
    return "not-eligible";
  }
  if (scheme.maxLandArea && landArea > scheme.maxLandArea) {
    return "not-eligible";
  }
  
  // Check crop-specific schemes
  if (scheme.applicableCrops && scheme.applicableCrops.length > 0) {
    const hasMatchingCrop = scheme.applicableCrops.some(schemeCrop => 
      crops.some(farmerCrop => 
        farmerCrop.includes(schemeCrop.toLowerCase()) || 
        schemeCrop.toLowerCase().includes(farmerCrop)
      )
    );
    if (!hasMatchingCrop) {
      return "check";
    }
    return "eligible";
  }
  
  // If scheme has requirements that need verification
  if (scheme.eligibility === "check") {
    return "check";
  }
  
  return "eligible";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { farmerContext } = await req.json() as { farmerContext: FarmerContext };
    
    console.log("Fetching schemes for farmer context:", farmerContext);
    
    const location = farmerContext.location || "";
    const state = getStateFromLocation(location);
    
    // Start with all central schemes
    let applicableSchemes: Scheme[] = [...allSchemes];
    
    // Add state-specific schemes
    if (state && stateSchemes[state]) {
      applicableSchemes = [...applicableSchemes, ...stateSchemes[state]];
    }
    
    // Calculate eligibility for each scheme
    const schemesWithEligibility = applicableSchemes.map(scheme => ({
      ...scheme,
      eligibility: getEligibility(scheme, farmerContext),
    }));
    
    // Sort: eligible first, then check, then not-eligible
    const sortedSchemes = schemesWithEligibility.sort((a, b) => {
      const order = { eligible: 0, check: 1, "not-eligible": 2 };
      return order[a.eligibility] - order[b.eligibility];
    });
    
    // Separate applied/approved schemes (simulated - in real app, this would come from database)
    const appliedSchemes = sortedSchemes.slice(0, 1).map(s => ({
      ...s,
      status: "approved" as const,
      nextBenefit: "₹2,000 in January 2025",
    }));
    
    const availableSchemes = sortedSchemes.slice(1);
    
    // Count by eligibility
    const stats = {
      approved: appliedSchemes.length,
      pending: 0,
      eligible: availableSchemes.filter(s => s.eligibility === "eligible").length,
      total: sortedSchemes.length,
    };
    
    console.log(`Found ${sortedSchemes.length} schemes, ${stats.eligible} eligible`);
    
    return new Response(
      JSON.stringify({
        appliedSchemes,
        availableSchemes,
        stats,
        state: state || "India",
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching schemes:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
