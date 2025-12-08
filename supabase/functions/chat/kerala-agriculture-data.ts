// Kerala Agricultural University (KAU) Crop Calendars & Package of Practices
// Source: Kerala Agricultural University, ICAR, Kerala Department of Agriculture

export interface CropCalendarEntry {
  crop: string;
  variety: string[];
  sowingMonths: string[];
  duration: number; // days
  stages: {
    name: string;
    startDay: number;
    endDay: number;
    operations: string[];
    fertilizer?: { type: string; dosage: string; perAcre: string }[];
    irrigation?: string;
    pestWatch?: string[];
  }[];
  soilTypes: string[];
  districts: string[];
  source: string;
}

export interface PestEntry {
  crop: string;
  pest: string;
  type: "insect" | "disease" | "nematode" | "weed";
  malayalamName: string;
  symptoms: string[];
  favorableConditions: { humidity?: string; temperature?: string; rainfall?: string; season?: string[] };
  districts: string[];
  management: {
    cultural: string[];
    biological: string[];
    chemical: { pesticide: string; dosage: string; perAcre: string; phi: number; source: string }[];
  };
  source: string;
}

export interface FertilizerRecommendation {
  crop: string;
  soilType: string;
  npkRatio: string;
  schedule: {
    stage: string;
    nitrogen: { source: string; dosage: string; perAcre: string };
    phosphorus: { source: string; dosage: string; perAcre: string };
    potassium: { source: string; dosage: string; perAcre: string };
  }[];
  organicAlternatives: { type: string; dosage: string; timing: string }[];
  source: string;
}

export interface DistrictSoilData {
  district: string;
  predominantSoils: string[];
  pH: { min: number; max: number; typical: number };
  characteristics: string[];
  suitableCrops: string[];
  limitations: string[];
  recommendations: string[];
  agroClimaticZone: string;
}

export interface WeatherAdvisory {
  condition: string;
  threshold: { min?: number; max?: number; unit: string };
  crops: string[];
  advisory: string[];
  doNot: string[];
  source: string;
}

// Kerala Crop Calendars - KAU Package of Practices
export const keralaCropCalendars: CropCalendarEntry[] = [
  {
    crop: "Rice (Paddy)",
    variety: ["Jyothi", "Uma", "Kanchana", "Aishwarya", "Shreyas", "Prathyasha"],
    sowingMonths: ["May-June (Virippu)", "September-October (Mundakan)", "December-January (Punja)"],
    duration: 120,
    stages: [
      {
        name: "Nursery",
        startDay: 0,
        endDay: 21,
        operations: ["Seed treatment with Pseudomonas fluorescens @ 10g/kg seed", "Prepare raised nursery beds", "Apply FYM @ 1kg/sqm"],
        fertilizer: [{ type: "Urea", dosage: "25g/sqm", perAcre: "N/A for nursery" }],
        irrigation: "Maintain 2-3cm water level",
        pestWatch: ["Bacterial leaf blight", "Brown spot"]
      },
      {
        name: "Transplanting",
        startDay: 21,
        endDay: 28,
        operations: ["Transplant 21-25 day old seedlings", "Spacing 20x15cm", "2-3 seedlings per hill"],
        fertilizer: [
          { type: "Urea", dosage: "22kg", perAcre: "22kg/acre" },
          { type: "Super Phosphate", dosage: "75kg", perAcre: "75kg/acre" },
          { type: "MOP", dosage: "20kg", perAcre: "20kg/acre" }
        ],
        irrigation: "Maintain 5cm standing water"
      },
      {
        name: "Tillering",
        startDay: 28,
        endDay: 55,
        operations: ["Gap filling within 7-10 DAT", "Weeding at 20 and 40 DAT", "Top dressing"],
        fertilizer: [{ type: "Urea", dosage: "22kg", perAcre: "22kg/acre (first top dressing at 21 DAT)" }],
        irrigation: "Intermittent irrigation",
        pestWatch: ["Stem borer", "Leaf folder", "BPH", "Sheath blight"]
      },
      {
        name: "Panicle Initiation",
        startDay: 55,
        endDay: 70,
        operations: ["Second top dressing", "Drain field for 2-3 days", "Monitor for pests"],
        fertilizer: [
          { type: "Urea", dosage: "22kg", perAcre: "22kg/acre" },
          { type: "MOP", dosage: "20kg", perAcre: "20kg/acre" }
        ],
        irrigation: "Maintain 5cm water",
        pestWatch: ["Neck blast", "Brown planthopper", "Gall midge"]
      },
      {
        name: "Flowering",
        startDay: 70,
        endDay: 90,
        operations: ["Avoid pesticide spray during flowering", "Maintain water level"],
        irrigation: "Maintain 2-3cm water",
        pestWatch: ["Neck blast", "False smut", "Grain discoloration"]
      },
      {
        name: "Grain Filling & Maturity",
        startDay: 90,
        endDay: 120,
        operations: ["Drain water 7-10 days before harvest", "Harvest at 80% grain maturity"],
        irrigation: "Drain gradually"
      }
    ],
    soilTypes: ["Laterite", "Alluvial", "Coastal alluvial", "Forest loam"],
    districts: ["Palakkad", "Thrissur", "Alappuzha", "Kottayam", "Ernakulam", "Wayanad"],
    source: "Kerala Agricultural University - Package of Practices 2023"
  },
  {
    crop: "Banana",
    variety: ["Nendran", "Poovan", "Robusta", "Grand Naine", "Palayamkodan", "Kappa", "Monthan"],
    sowingMonths: ["February-March", "September-October"],
    duration: 365,
    stages: [
      {
        name: "Planting",
        startDay: 0,
        endDay: 30,
        operations: ["Pit size 50x50x50cm", "Apply 10kg FYM + 250g Neem cake per pit", "Plant sword suckers"],
        fertilizer: [
          { type: "Urea", dosage: "110g", perAcre: "55kg (for 500 plants)" },
          { type: "Super Phosphate", dosage: "320g", perAcre: "160kg" },
          { type: "MOP", dosage: "200g", perAcre: "100kg" }
        ],
        irrigation: "Irrigate immediately after planting"
      },
      {
        name: "Vegetative Growth",
        startDay: 30,
        endDay: 180,
        operations: ["Desuckering monthly", "Earthing up at 2 and 4 months", "Mulching"],
        fertilizer: [
          { type: "Urea", dosage: "110g/plant", perAcre: "Split into 4 doses at monthly intervals" },
          { type: "MOP", dosage: "200g/plant", perAcre: "Split into 4 doses" }
        ],
        irrigation: "Weekly irrigation - 40 liters/plant",
        pestWatch: ["Pseudostem weevil", "Rhizome weevil", "Sigatoka leaf spot", "Panama wilt"]
      },
      {
        name: "Shooting & Bunch Development",
        startDay: 180,
        endDay: 270,
        operations: ["Remove male bud after last hand opens", "Prop plants with bamboo stakes", "Bunch cover with blue polythene"],
        fertilizer: [{ type: "MOP", dosage: "200g/plant", perAcre: "Final dose" }],
        irrigation: "Maintain soil moisture - 50 liters/plant/week",
        pestWatch: ["Thrips", "Scarring beetle", "Anthracnose"]
      },
      {
        name: "Maturity & Harvest",
        startDay: 270,
        endDay: 365,
        operations: ["Harvest when fingers are 3/4 round", "Cut pseudostem at 30cm from ground for ratoon"],
        irrigation: "Reduce irrigation 15 days before harvest"
      }
    ],
    soilTypes: ["Laterite", "Alluvial", "Red loam"],
    districts: ["Wayanad", "Kozhikode", "Thrissur", "Palakkad", "Malappuram", "Kannur"],
    source: "Kerala Agricultural University - Banana Cultivation Guide 2023"
  },
  {
    crop: "Coconut",
    variety: ["West Coast Tall", "Chowghat Orange Dwarf", "Chowghat Green Dwarf", "Lakshaganga", "Kalparaksha"],
    sowingMonths: ["June-July (onset of monsoon)", "October-November"],
    duration: 1825, // 5 years to first yield
    stages: [
      {
        name: "Planting",
        startDay: 0,
        endDay: 60,
        operations: ["Pit size 1x1x1m", "Fill with topsoil + 25kg FYM + 2kg bone meal", "Plant 10-12 month old seedlings"],
        fertilizer: [{ type: "Organic", dosage: "25kg FYM", perAcre: "Apply in pit before planting" }],
        irrigation: "Irrigate immediately, maintain moisture"
      },
      {
        name: "Juvenile (Year 1-3)",
        startDay: 60,
        endDay: 1095,
        operations: ["Basin management", "Husk burial in interspaces", "Green manuring with Glyricidia"],
        fertilizer: [
          { type: "Urea", dosage: "300g/palm/year", perAcre: "Split into 2 doses (May-June & Sept-Oct)" },
          { type: "Super Phosphate", dosage: "200g/palm/year", perAcre: "Apply once in September" },
          { type: "MOP", dosage: "500g/palm/year", perAcre: "Split into 2 doses" }
        ],
        irrigation: "Weekly irrigation in summer - 200 liters/palm",
        pestWatch: ["Rhinoceros beetle", "Red palm weevil", "Eriophyid mite"]
      },
      {
        name: "Bearing (Year 4+)",
        startDay: 1095,
        endDay: 1825,
        operations: ["Regular crown cleaning", "Remove dried spathe and inflorescence", "Harvest every 45 days"],
        fertilizer: [
          { type: "Urea", dosage: "1.3kg/palm/year", perAcre: "Split into 2 doses" },
          { type: "Super Phosphate", dosage: "2kg/palm/year", perAcre: "Apply in September" },
          { type: "MOP", dosage: "2kg/palm/year", perAcre: "Split into 2 doses" }
        ],
        irrigation: "Summer irrigation essential - 250 liters/palm/week",
        pestWatch: ["Root wilt", "Stem bleeding", "Bud rot", "Leaf rot"]
      }
    ],
    soilTypes: ["Laterite", "Sandy loam", "Red loam", "Alluvial"],
    districts: ["Kozhikode", "Thrissur", "Malappuram", "Palakkad", "Kannur", "Kasaragod", "Alappuzha"],
    source: "CPCRI Kasaragod & Kerala Agricultural University"
  },
  {
    crop: "Pepper",
    variety: ["Panniyur-1", "Panniyur-2", "Panniyur-5", "Karimunda", "Sreekara", "Subhakara"],
    sowingMonths: ["May-June (with onset of monsoon)"],
    duration: 1095, // 3 years to bearing
    stages: [
      {
        name: "Planting",
        startDay: 0,
        endDay: 30,
        operations: ["Pit size 50x50x50cm at base of standard", "Apply 10kg FYM + 1kg neem cake", "Plant rooted cuttings"],
        fertilizer: [{ type: "Organic", dosage: "10kg FYM + 1kg neem cake", perAcre: "Per pit" }],
        irrigation: "Water immediately after planting"
      },
      {
        name: "Establishment (Year 1)",
        startDay: 30,
        endDay: 365,
        operations: ["Train vines on standards", "Mulching with leaves", "Weeding twice"],
        fertilizer: [
          { type: "Urea", dosage: "50g/vine", perAcre: "Split into 2 doses (May-June & Sept-Oct)" },
          { type: "Super Phosphate", dosage: "100g/vine", perAcre: "Apply once in June" },
          { type: "MOP", dosage: "100g/vine", perAcre: "Split into 2 doses" }
        ],
        irrigation: "Weekly irrigation in summer",
        pestWatch: ["Pollu beetle", "Leaf gall thrips", "Quick wilt", "Phytophthora foot rot"]
      },
      {
        name: "Bearing (Year 3+)",
        startDay: 730,
        endDay: 1095,
        operations: ["Pruning of trailing shoots", "Apply Bordeaux mixture prophylactically", "Harvest at 6-7 months after flowering"],
        fertilizer: [
          { type: "Urea", dosage: "100g/vine", perAcre: "Split application" },
          { type: "Super Phosphate", dosage: "200g/vine", perAcre: "September" },
          { type: "MOP", dosage: "200g/vine", perAcre: "Split application" }
        ],
        irrigation: "Reduce irrigation during harvest",
        pestWatch: ["Pollu beetle", "Anthracnose", "Slow wilt"]
      }
    ],
    soilTypes: ["Laterite", "Forest loam", "Red loam"],
    districts: ["Idukki", "Wayanad", "Kannur", "Kozhikode", "Kottayam"],
    source: "Indian Institute of Spices Research (IISR) Kozhikode & KAU"
  },
  {
    crop: "Rubber",
    variety: ["RRII 105", "RRII 414", "RRII 430", "PB 260", "RRIM 600"],
    sowingMonths: ["June-July"],
    duration: 2555, // 7 years to tapping
    stages: [
      {
        name: "Planting",
        startDay: 0,
        endDay: 60,
        operations: ["Pit size 90x90x90cm", "Fill with topsoil", "Plant budded stumps at 90cm height"],
        fertilizer: [
          { type: "Rock Phosphate", dosage: "175g/plant", perAcre: "Apply in pit" }
        ],
        irrigation: "Water during dry spells"
      },
      {
        name: "Immature Period (Year 1-6)",
        startDay: 60,
        endDay: 2190,
        operations: ["Cover cropping with Pueraria", "Basin management", "Brown bud grafting for wind damage"],
        fertilizer: [
          { type: "NPK 10:10:4:1.5 (Mg)", dosage: "900g/tree/year", perAcre: "Split into 2-3 doses" }
        ],
        irrigation: "Irrigation during severe summer",
        pestWatch: ["Abnormal leaf fall", "Powdery mildew", "Corynespora leaf disease", "Pink disease"]
      },
      {
        name: "Tapping",
        startDay: 2190,
        endDay: 2555,
        operations: ["Start tapping when 70% trees reach 50cm girth at 120cm height", "Half spiral alternate daily tapping"],
        fertilizer: [
          { type: "NPK 10:10:10", dosage: "1.2kg/tree/year", perAcre: "Split into 2 doses" }
        ],
        irrigation: "Maintain moisture for latex flow"
      }
    ],
    soilTypes: ["Laterite", "Forest loam"],
    districts: ["Kottayam", "Pathanamthitta", "Idukki", "Ernakulam", "Thrissur", "Kozhikode"],
    source: "Rubber Research Institute of India (RRII) Kottayam"
  },
  {
    crop: "Cardamom",
    variety: ["Malabar", "Mysore", "Vazhukka", "ICRI-1", "ICRI-2", "Mudigere-1"],
    sowingMonths: ["June-July"],
    duration: 1095,
    stages: [
      {
        name: "Planting",
        startDay: 0,
        endDay: 30,
        operations: ["Pit size 45x45x45cm", "Spacing 2x2m", "Apply 5kg FYM + 1kg neem cake"],
        fertilizer: [{ type: "Organic", dosage: "5kg FYM", perAcre: "Per pit" }],
        irrigation: "Irrigate immediately"
      },
      {
        name: "Establishment (Year 1-2)",
        startDay: 30,
        endDay: 730,
        operations: ["Mulching with forest litter", "Shade regulation (40-50%)", "Trashing of old leaves"],
        fertilizer: [
          { type: "Urea", dosage: "75g/plant/year", perAcre: "Split into 3 doses" },
          { type: "Super Phosphate", dosage: "75g/plant/year", perAcre: "Apply in May" },
          { type: "MOP", dosage: "150g/plant/year", perAcre: "Split into 2 doses" }
        ],
        irrigation: "Sprinkler irrigation in summer",
        pestWatch: ["Thrips", "Shoot borer", "Katte disease", "Capsule rot"]
      },
      {
        name: "Bearing (Year 3+)",
        startDay: 730,
        endDay: 1095,
        operations: ["Hand pollination if needed", "Harvest at full maturity", "Cure capsules within 24 hours"],
        fertilizer: [
          { type: "Urea", dosage: "150g/plant/year", perAcre: "Split into 3 doses" },
          { type: "Super Phosphate", dosage: "150g/plant/year", perAcre: "May application" },
          { type: "MOP", dosage: "300g/plant/year", perAcre: "Split doses" }
        ],
        irrigation: "Critical during flowering",
        pestWatch: ["Capsule borer", "Root grub", "Rhizome rot", "Azhukal disease"]
      }
    ],
    soilTypes: ["Forest loam", "Well-drained laterite"],
    districts: ["Idukki", "Wayanad"],
    source: "Indian Cardamom Research Institute (ICRI) Myladumpara & IISR"
  },
  {
    crop: "Ginger",
    variety: ["Maran", "Rio-de-Janeiro", "Wayanad Local", "IISR Varada", "IISR Rejatha"],
    sowingMonths: ["April-May (with pre-monsoon showers)"],
    duration: 240,
    stages: [
      {
        name: "Planting",
        startDay: 0,
        endDay: 15,
        operations: ["Treat seed rhizomes with Trichoderma @ 5g/L for 30 min", "Bed size 1m wide", "Spacing 25x25cm"],
        fertilizer: [
          { type: "FYM", dosage: "25t/ha", perAcre: "10t/acre as basal" },
          { type: "Neem Cake", dosage: "2t/ha", perAcre: "800kg/acre" }
        ],
        irrigation: "Provide light irrigation"
      },
      {
        name: "Sprouting & Tillering",
        startDay: 15,
        endDay: 90,
        operations: ["Gap filling at 21 DAP", "Mulching with green leaves @ 12t/ha", "First earthing up at 45 DAP"],
        fertilizer: [
          { type: "Urea", dosage: "35kg/acre", perAcre: "35kg (1st top dressing at 45 DAP)" },
          { type: "MOP", dosage: "25kg/acre", perAcre: "25kg (at 45 DAP)" }
        ],
        irrigation: "Weekly irrigation if no rain",
        pestWatch: ["Shoot borer", "Soft rot (Pythium)", "Bacterial wilt"]
      },
      {
        name: "Rhizome Development",
        startDay: 90,
        endDay: 180,
        operations: ["Second mulching", "Second earthing up at 90 DAP", "Weeding"],
        fertilizer: [
          { type: "Urea", dosage: "35kg/acre", perAcre: "2nd top dressing at 90 DAP" },
          { type: "MOP", dosage: "25kg/acre", perAcre: "At 90 DAP" }
        ],
        irrigation: "Maintain soil moisture",
        pestWatch: ["Rhizome rot", "Leaf spot"]
      },
      {
        name: "Maturity & Harvest",
        startDay: 180,
        endDay: 240,
        operations: ["Harvest for fresh ginger at 180 DAP", "For dry ginger at 240 DAP when leaves yellow"],
        irrigation: "Stop irrigation 15 days before harvest"
      }
    ],
    soilTypes: ["Forest loam", "Laterite with good organic matter"],
    districts: ["Wayanad", "Idukki", "Kozhikode", "Kannur", "Kasaragod"],
    source: "IISR Kozhikode & Kerala Agricultural University"
  },
  {
    crop: "Turmeric",
    variety: ["Kerala Local", "Suvarna", "Suguna", "IISR Prabha", "IISR Prathibha"],
    sowingMonths: ["May-June"],
    duration: 270,
    stages: [
      {
        name: "Planting",
        startDay: 0,
        endDay: 15,
        operations: ["Treat rhizomes with Trichoderma", "Bed planting at 25x30cm", "Apply basal fertilizers"],
        fertilizer: [
          { type: "FYM", dosage: "20t/ha", perAcre: "8t/acre as basal" },
          { type: "Super Phosphate", dosage: "60kg/acre", perAcre: "Basal application" }
        ],
        irrigation: "Light irrigation after planting"
      },
      {
        name: "Tillering",
        startDay: 30,
        endDay: 120,
        operations: ["Gap filling", "Mulching with green leaves", "Earthing up at 45 and 90 DAP"],
        fertilizer: [
          { type: "Urea", dosage: "22kg/acre", perAcre: "At 45 DAP" },
          { type: "MOP", dosage: "20kg/acre", perAcre: "At 45 and 90 DAP" }
        ],
        irrigation: "Weekly irrigation",
        pestWatch: ["Shoot borer", "Leaf blotch", "Rhizome rot"]
      },
      {
        name: "Rhizome Bulking",
        startDay: 120,
        endDay: 210,
        operations: ["Third mulching", "Weeding", "Monitor for pests"],
        fertilizer: [
          { type: "Urea", dosage: "22kg/acre", perAcre: "At 90 DAP" }
        ],
        irrigation: "Maintain moisture",
        pestWatch: ["Leaf roller", "Scale insects"]
      },
      {
        name: "Harvest",
        startDay: 210,
        endDay: 270,
        operations: ["Harvest when leaves turn yellow and dry", "Cure rhizomes by boiling and drying"],
        irrigation: "Stop 2 weeks before harvest"
      }
    ],
    soilTypes: ["Forest loam", "Well-drained laterite"],
    districts: ["Wayanad", "Kasaragod", "Kannur", "Kozhikode", "Ernakulam"],
    source: "IISR Kozhikode"
  },
  {
    crop: "Vegetables - Cowpea",
    variety: ["Kanakamani", "Anaswara", "Bhagyalakshmi", "Lola", "Arka Garima"],
    sowingMonths: ["June-July", "September-October", "January-February"],
    duration: 70,
    stages: [
      {
        name: "Sowing",
        startDay: 0,
        endDay: 10,
        operations: ["Seed treatment with Trichoderma", "Spacing 30x15cm", "Sow 2-3 seeds per pit"],
        fertilizer: [
          { type: "FYM", dosage: "5t/acre", perAcre: "Basal application" }
        ],
        irrigation: "Light irrigation"
      },
      {
        name: "Vegetative",
        startDay: 10,
        endDay: 35,
        operations: ["Thinning to 1-2 plants per pit", "Staking for pole varieties", "Weeding"],
        fertilizer: [
          { type: "Urea", dosage: "10kg/acre", perAcre: "At 21 DAS" }
        ],
        irrigation: "Twice weekly",
        pestWatch: ["Aphids", "Pod borer", "Mosaic virus"]
      },
      {
        name: "Flowering & Pod Formation",
        startDay: 35,
        endDay: 55,
        operations: ["Avoid water stress during flowering", "Monitor for pests"],
        fertilizer: [
          { type: "MOP", dosage: "10kg/acre", perAcre: "Foliar spray 1%" }
        ],
        irrigation: "Critical - maintain moisture",
        pestWatch: ["Pod borer", "Maruca", "Rust"]
      },
      {
        name: "Harvest",
        startDay: 55,
        endDay: 70,
        operations: ["Harvest tender pods every 3-4 days", "For dry seeds, harvest when pods turn brown"],
        irrigation: "Reduce frequency"
      }
    ],
    soilTypes: ["Laterite", "Sandy loam", "Alluvial"],
    districts: ["All Kerala districts"],
    source: "Kerala Agricultural University - Vegetable Crops"
  }
];

// Kerala Pest & Disease Management - ICAR/KAU Approved
export const keralaPestManagement: PestEntry[] = [
  {
    crop: "Rice",
    pest: "Brown Planthopper (BPH)",
    type: "insect",
    malayalamName: "തവിട്ടു ചാഴി",
    symptoms: [
      "Yellowing of leaves starting from lower leaves",
      "Hopper burn - circular patches of dried plants",
      "Honeydew secretion on plant surface",
      "Sooty mold development"
    ],
    favorableConditions: {
      humidity: ">85%",
      temperature: "25-30°C",
      season: ["Mundakan", "Virippu"]
    },
    districts: ["Palakkad", "Thrissur", "Alappuzha", "Kottayam"],
    management: {
      cultural: [
        "Avoid close planting",
        "Alternate wetting and drying",
        "Avoid excess nitrogen application",
        "Grow resistant varieties (Jyothi, Kanchana)"
      ],
      biological: [
        "Conserve natural enemies (Mirid bugs, Spiders)",
        "Release Anagrus optabilis (egg parasitoid)"
      ],
      chemical: [
        { pesticide: "Pymetrozine 50% WG", dosage: "0.3g/L", perAcre: "120g in 200L water", phi: 14, source: "ICAR-CRRI" },
        { pesticide: "Buprofezin 25% SC", dosage: "1.6ml/L", perAcre: "640ml in 200L water", phi: 30, source: "KAU" },
        { pesticide: "Dinotefuran 20% SG", dosage: "0.4g/L", perAcre: "160g in 200L water", phi: 14, source: "ICAR" }
      ]
    },
    source: "ICAR-Central Rice Research Institute & Kerala Agricultural University"
  },
  {
    crop: "Rice",
    pest: "Stem Borer",
    type: "insect",
    malayalamName: "തണ്ട് തുരപ്പൻ",
    symptoms: [
      "Dead heart in vegetative stage",
      "White ear head at reproductive stage",
      "Tiny holes in stem with frass"
    ],
    favorableConditions: {
      humidity: ">70%",
      temperature: "25-32°C",
      season: ["Virippu", "Mundakan"]
    },
    districts: ["All paddy growing districts"],
    management: {
      cultural: [
        "Remove stubbles and destroy",
        "Clip tip of seedlings before transplanting",
        "Avoid late planting",
        "Harvest at ground level"
      ],
      biological: [
        "Release Trichogramma japonicum @ 5 cards/acre",
        "Install pheromone traps @ 5/acre"
      ],
      chemical: [
        { pesticide: "Cartap Hydrochloride 50% SP", dosage: "1g/L", perAcre: "400g in 200L water", phi: 40, source: "KAU" },
        { pesticide: "Chlorantraniliprole 0.4% GR", dosage: "10kg/ha", perAcre: "4kg granules broadcast", phi: 7, source: "ICAR" },
        { pesticide: "Flubendiamide 20% WG", dosage: "0.25g/L", perAcre: "100g in 200L water", phi: 7, source: "ICAR" }
      ]
    },
    source: "Kerala Agricultural University Package of Practices"
  },
  {
    crop: "Rice",
    pest: "Blast (Leaf & Neck)",
    type: "disease",
    malayalamName: "ചാമ്പൽ രോഗം / കഴുത്തൊടിച്ചിൽ",
    symptoms: [
      "Spindle-shaped spots with grey center and brown margin on leaves",
      "Neck region turns brown and breaks",
      "Panicle hangs down (neck blast)",
      "Nodes show brown discoloration"
    ],
    favorableConditions: {
      humidity: ">90%",
      temperature: "20-25°C",
      rainfall: "Continuous drizzle"
    },
    districts: ["Wayanad", "Palakkad", "Idukki", "High rainfall areas"],
    management: {
      cultural: [
        "Use certified disease-free seeds",
        "Avoid excess nitrogen",
        "Maintain proper spacing",
        "Grow resistant varieties (Jyothi, Uma)"
      ],
      biological: [
        "Seed treatment with Pseudomonas fluorescens @ 10g/kg",
        "Foliar spray of Bacillus subtilis"
      ],
      chemical: [
        { pesticide: "Tricyclazole 75% WP", dosage: "0.6g/L", perAcre: "120g in 200L water", phi: 21, source: "KAU" },
        { pesticide: "Isoprothiolane 40% EC", dosage: "1.5ml/L", perAcre: "300ml in 200L water", phi: 21, source: "ICAR" },
        { pesticide: "Carbendazim 50% WP", dosage: "1g/L", perAcre: "200g in 200L water", phi: 14, source: "KAU" }
      ]
    },
    source: "ICAR-CRRI & Kerala Agricultural University"
  },
  {
    crop: "Banana",
    pest: "Pseudostem Weevil",
    type: "insect",
    malayalamName: "കായ തുളയ്ക്കുന്ന വണ്ട്",
    symptoms: [
      "Jelly-like sap oozing from pseudostem",
      "Wilting and yellowing of outer leaves",
      "Tunneling in pseudostem",
      "Premature falling of bunches"
    ],
    favorableConditions: {
      humidity: ">80%",
      season: ["Monsoon", "Post-monsoon"]
    },
    districts: ["Wayanad", "Thrissur", "Palakkad", "Malappuram"],
    management: {
      cultural: [
        "Use healthy suckers",
        "Remove dried leaves periodically",
        "Set longitudinal split pseudostem traps",
        "Destroy affected plants"
      ],
      biological: [
        "Apply Beauveria bassiana @ 40g/plant in leaf axils",
        "Use Steinernema carpocapsae (EPN)"
      ],
      chemical: [
        { pesticide: "Chlorpyriphos 20% EC", dosage: "5ml/L", perAcre: "Swab on pseudostem", phi: 60, source: "KAU" },
        { pesticide: "Imidacloprid 17.8% SL", dosage: "0.5ml/L", perAcre: "Inject 2ml solution per plant", phi: 60, source: "ICAR" }
      ]
    },
    source: "ICAR-National Research Centre for Banana & KAU"
  },
  {
    crop: "Banana",
    pest: "Sigatoka Leaf Spot",
    type: "disease",
    malayalamName: "ഇലപ്പുള്ളി രോഗം",
    symptoms: [
      "Small pale yellow streaks on leaves",
      "Streaks enlarge to brown spots with grey center",
      "Premature drying of leaves",
      "Reduced bunch size"
    ],
    favorableConditions: {
      humidity: ">90%",
      temperature: "25-30°C",
      rainfall: "Prolonged wet weather"
    },
    districts: ["All banana growing districts"],
    management: {
      cultural: [
        "Remove and destroy affected leaves",
        "Provide adequate drainage",
        "Avoid overcrowding",
        "Improve air circulation"
      ],
      biological: [
        "Spray Pseudomonas fluorescens @ 10g/L"
      ],
      chemical: [
        { pesticide: "Propiconazole 25% EC", dosage: "1ml/L", perAcre: "200ml in 200L water", phi: 21, source: "KAU" },
        { pesticide: "Carbendazim 50% WP", dosage: "1g/L", perAcre: "200g in 200L water", phi: 14, source: "ICAR" },
        { pesticide: "Mancozeb 75% WP", dosage: "2.5g/L", perAcre: "500g in 200L water", phi: 30, source: "KAU" }
      ]
    },
    source: "Kerala Agricultural University"
  },
  {
    crop: "Coconut",
    pest: "Rhinoceros Beetle",
    type: "insect",
    malayalamName: "കൊമ്പൻ വണ്ട്",
    symptoms: [
      "V-shaped cuts on unfurled fronds",
      "Holes in crown region",
      "Chewed central spindle",
      "Reduced nut production"
    ],
    favorableConditions: {
      season: ["March-May", "October-November"]
    },
    districts: ["All coconut growing districts"],
    management: {
      cultural: [
        "Remove and destroy breeding sites (FYM heaps, decaying logs)",
        "Hook out beetles from palms",
        "Fill leaf axils with sand + neem cake mixture"
      ],
      biological: [
        "Apply Metarhizium anisopliae @ 50g mixed with FYM in crown",
        "Use Oryctes Rhinoceros Nudivirus (OrNV)",
        "Install pheromone traps @ 1/ha"
      ],
      chemical: [
        { pesticide: "Neem cake", dosage: "250g/palm", perAcre: "Apply in 3 innermost leaf axils", phi: 0, source: "CPCRI" },
        { pesticide: "Chlorpyriphos 1.5% DP", dosage: "25g/palm", perAcre: "Apply in crown + manure pits", phi: 45, source: "KAU" }
      ]
    },
    source: "CPCRI Kasaragod & Kerala Agricultural University"
  },
  {
    crop: "Coconut",
    pest: "Root Wilt Disease",
    type: "disease",
    malayalamName: "വേര് ചീയൽ രോഗം",
    symptoms: [
      "Ribbing and flaccidity of leaflets",
      "Abnormal yellowing of leaves",
      "Necrosis of root tips",
      "Reduction in nut size and copra content"
    ],
    favorableConditions: {
      humidity: ">80%",
      season: ["Monsoon"]
    },
    districts: ["Alappuzha", "Kottayam", "Ernakulam", "Thrissur", "Palakkad"],
    management: {
      cultural: [
        "Use tolerant varieties (Kalparaksha, Kalpashree)",
        "Provide adequate drainage",
        "Remove severely affected palms",
        "Maintain palm nutrition"
      ],
      biological: [
        "Apply Trichoderma harzianum @ 50g/palm in basin"
      ],
      chemical: [
        { pesticide: "Triadimefon 25% WP", dosage: "2g/L", perAcre: "Root feeding 50ml solution", phi: 21, source: "CPCRI" },
        { pesticide: "Oxytetracycline HCl", dosage: "2g/L", perAcre: "Trunk injection for phytoplasma", phi: 30, source: "CPCRI" }
      ]
    },
    source: "CPCRI Kayangulam & Kerala Agricultural University"
  },
  {
    crop: "Pepper",
    pest: "Phytophthora Foot Rot (Quick Wilt)",
    type: "disease",
    malayalamName: "പെട്ടെന്നുള്ള വാട്ടം",
    symptoms: [
      "Sudden wilting of vines",
      "Yellowing and shedding of leaves",
      "Black lesions at collar region",
      "Rotting of roots with foul smell"
    ],
    favorableConditions: {
      humidity: ">95%",
      rainfall: "Heavy, continuous rain",
      season: ["June-September"]
    },
    districts: ["Idukki", "Wayanad", "Kannur", "Kozhikode"],
    management: {
      cultural: [
        "Improve drainage",
        "Avoid waterlogging",
        "Remove and destroy infected vines",
        "Provide adequate shade"
      ],
      biological: [
        "Apply Trichoderma harzianum @ 50g/vine in basin",
        "Drench with Pseudomonas fluorescens @ 20g/L"
      ],
      chemical: [
        { pesticide: "Copper Hydroxide 77% WP", dosage: "3g/L", perAcre: "Drench 5L per vine (prophylactic)", phi: 21, source: "IISR" },
        { pesticide: "Potassium Phosphonate 40%", dosage: "3ml/L", perAcre: "Foliar spray + drenching", phi: 14, source: "IISR" },
        { pesticide: "Metalaxyl 8% + Mancozeb 64% WP", dosage: "2.5g/L", perAcre: "Spray during monsoon", phi: 30, source: "KAU" }
      ]
    },
    source: "IISR Kozhikode - Phytophthora Management in Black Pepper"
  },
  {
    crop: "Pepper",
    pest: "Pollu Beetle",
    type: "insect",
    malayalamName: "പൊള്ളു വണ്ട്",
    symptoms: [
      "Bore holes on developing berries",
      "Berries become hollow (pollu)",
      "Black coloration of affected berries",
      "Quality deterioration"
    ],
    favorableConditions: {
      humidity: ">80%",
      season: ["August-December (spike development)"]
    },
    districts: ["Idukki", "Wayanad", "Kannur"],
    management: {
      cultural: [
        "Timely harvest",
        "Collect and destroy fallen berries",
        "Maintain field sanitation"
      ],
      biological: [
        "Spray Beauveria bassiana @ 5g/L during spike development"
      ],
      chemical: [
        { pesticide: "Quinalphos 25% EC", dosage: "2ml/L", perAcre: "Spray during spike development", phi: 15, source: "IISR" },
        { pesticide: "Lambda Cyhalothrin 5% EC", dosage: "0.5ml/L", perAcre: "100ml in 200L water", phi: 15, source: "KAU" }
      ]
    },
    source: "IISR Kozhikode"
  },
  {
    crop: "Ginger",
    pest: "Soft Rot (Pythium aphanidermatum)",
    type: "disease",
    malayalamName: "ചീയൽ രോഗം",
    symptoms: [
      "Water-soaked lesions at collar region",
      "Yellowing and wilting of leaves",
      "Rotting of rhizomes with foul smell",
      "Easy pulling of pseudostems"
    ],
    favorableConditions: {
      humidity: ">90%",
      rainfall: "Waterlogged conditions",
      season: ["June-September"]
    },
    districts: ["Wayanad", "Idukki", "Kozhikode"],
    management: {
      cultural: [
        "Use disease-free seed rhizomes",
        "Provide good drainage",
        "Avoid waterlogging",
        "Remove and destroy infected plants with surrounding soil"
      ],
      biological: [
        "Treat seed rhizomes with Trichoderma viride @ 5g/L for 30 min",
        "Drench with Pseudomonas fluorescens @ 20g/L"
      ],
      chemical: [
        { pesticide: "Mancozeb 75% WP", dosage: "3g/L", perAcre: "Seed treatment + drenching", phi: 30, source: "IISR" },
        { pesticide: "Metalaxyl 8% + Mancozeb 64% WP", dosage: "2.5g/L", perAcre: "Drench at disease onset", phi: 30, source: "KAU" },
        { pesticide: "Copper Oxychloride 50% WP", dosage: "3g/L", perAcre: "Prophylactic spray", phi: 21, source: "IISR" }
      ]
    },
    source: "IISR Kozhikode - Ginger Diseases and Management"
  },
  {
    crop: "Cardamom",
    pest: "Thrips",
    type: "insect",
    malayalamName: "ഇലത്തേൻ",
    symptoms: [
      "Silvery streaks on leaves",
      "Leaf curling and distortion",
      "Scarring on capsules",
      "Reduced capsule quality"
    ],
    favorableConditions: {
      humidity: "<60%",
      season: ["January-May (dry season)"]
    },
    districts: ["Idukki", "Wayanad"],
    management: {
      cultural: [
        "Maintain adequate shade (40-50%)",
        "Regular irrigation during summer",
        "Remove plant debris"
      ],
      biological: [
        "Spray Verticillium lecanii @ 5g/L"
      ],
      chemical: [
        { pesticide: "Dimethoate 30% EC", dosage: "2ml/L", perAcre: "Spray during peak infestation", phi: 21, source: "IISR" },
        { pesticide: "Spinosad 45% SC", dosage: "0.3ml/L", perAcre: "60ml in 200L water", phi: 7, source: "ICRI" }
      ]
    },
    source: "ICRI Myladumpara & IISR Kozhikode"
  },
  {
    crop: "Cardamom",
    pest: "Katte Disease (Mosaic)",
    type: "disease",
    malayalamName: "കട്ടെ രോഗം",
    symptoms: [
      "Mosaic pattern on leaves",
      "Green streaks on pseudostem",
      "Stunted growth",
      "No capsule formation"
    ],
    favorableConditions: {
      season: ["Throughout year - vector spread"]
    },
    districts: ["Idukki", "Wayanad"],
    management: {
      cultural: [
        "Use virus-free planting material",
        "Remove and destroy infected plants",
        "Control aphid vectors",
        "Maintain field sanitation"
      ],
      biological: [
        "No direct biological control; focus on vector management"
      ],
      chemical: [
        { pesticide: "Imidacloprid 17.8% SL", dosage: "0.3ml/L", perAcre: "Spray to control aphid vectors", phi: 40, source: "ICRI" },
        { pesticide: "Thiamethoxam 25% WG", dosage: "0.2g/L", perAcre: "Vector management", phi: 21, source: "IISR" }
      ]
    },
    source: "Indian Cardamom Research Institute"
  }
];

// Kerala Fertilizer Recommendations - KAU/ICAR Standards
export const keralaFertilizerRecommendations: FertilizerRecommendation[] = [
  {
    crop: "Rice",
    soilType: "Laterite",
    npkRatio: "70:35:35 kg/ha (28:14:14 kg/acre)",
    schedule: [
      {
        stage: "Basal (At transplanting)",
        nitrogen: { source: "Urea", dosage: "22kg/acre", perAcre: "22kg" },
        phosphorus: { source: "Super Phosphate", dosage: "75kg/acre", perAcre: "Full dose" },
        potassium: { source: "MOP", dosage: "20kg/acre", perAcre: "Half dose" }
      },
      {
        stage: "First Top Dressing (21 DAT - Tillering)",
        nitrogen: { source: "Urea", dosage: "22kg/acre", perAcre: "22kg" },
        phosphorus: { source: "None", dosage: "0", perAcre: "Already applied" },
        potassium: { source: "None", dosage: "0", perAcre: "N/A" }
      },
      {
        stage: "Second Top Dressing (45 DAT - Panicle Initiation)",
        nitrogen: { source: "Urea", dosage: "22kg/acre", perAcre: "22kg" },
        phosphorus: { source: "None", dosage: "0", perAcre: "N/A" },
        potassium: { source: "MOP", dosage: "20kg/acre", perAcre: "Remaining half" }
      }
    ],
    organicAlternatives: [
      { type: "FYM", dosage: "5t/acre", timing: "2 weeks before transplanting" },
      { type: "Green Manure (Sesbania)", dosage: "6t/acre", timing: "Incorporate at 45 days" },
      { type: "Neem Cake", dosage: "100kg/acre", timing: "At basal application" },
      { type: "Vermicompost", dosage: "1t/acre", timing: "Basal application" }
    ],
    source: "Kerala Agricultural University - Rice Package of Practices"
  },
  {
    crop: "Banana (Nendran)",
    soilType: "All Kerala soils",
    npkRatio: "200:200:400 g/plant/year",
    schedule: [
      {
        stage: "At Planting",
        nitrogen: { source: "Urea", dosage: "55g/plant", perAcre: "1/4 of N dose" },
        phosphorus: { source: "Super Phosphate", dosage: "320g/plant", perAcre: "Full dose" },
        potassium: { source: "MOP", dosage: "100g/plant", perAcre: "1/4 of K dose" }
      },
      {
        stage: "2nd Month",
        nitrogen: { source: "Urea", dosage: "55g/plant", perAcre: "1/4 of N dose" },
        phosphorus: { source: "None", dosage: "0", perAcre: "N/A" },
        potassium: { source: "MOP", dosage: "100g/plant", perAcre: "1/4 of K dose" }
      },
      {
        stage: "4th Month",
        nitrogen: { source: "Urea", dosage: "55g/plant", perAcre: "1/4 of N dose" },
        phosphorus: { source: "None", dosage: "0", perAcre: "N/A" },
        potassium: { source: "MOP", dosage: "100g/plant", perAcre: "1/4 of K dose" }
      },
      {
        stage: "At Shooting",
        nitrogen: { source: "Urea", dosage: "55g/plant", perAcre: "Final 1/4 N" },
        phosphorus: { source: "None", dosage: "0", perAcre: "N/A" },
        potassium: { source: "MOP", dosage: "100g/plant", perAcre: "Final 1/4 K" }
      }
    ],
    organicAlternatives: [
      { type: "FYM", dosage: "10kg/plant", timing: "At planting in pit" },
      { type: "Neem Cake", dosage: "250g/plant", timing: "At planting" },
      { type: "Ash", dosage: "500g/plant", timing: "Monthly - potassium source" },
      { type: "Vermicompost", dosage: "5kg/plant", timing: "At 2nd and 4th month" }
    ],
    source: "Kerala Agricultural University & NRCB"
  },
  {
    crop: "Coconut",
    soilType: "Laterite",
    npkRatio: "500g N : 320g P2O5 : 1200g K2O per palm/year",
    schedule: [
      {
        stage: "First Application (June - Before Monsoon)",
        nitrogen: { source: "Urea", dosage: "650g/palm", perAcre: "1/2 of N dose" },
        phosphorus: { source: "Super Phosphite", dosage: "1kg/palm", perAcre: "1/2 of P dose" },
        potassium: { source: "MOP", dosage: "1kg/palm", perAcre: "1/2 of K dose" }
      },
      {
        stage: "Second Application (September - After Monsoon)",
        nitrogen: { source: "Urea", dosage: "650g/palm", perAcre: "Remaining N" },
        phosphorus: { source: "Super Phosphate", dosage: "1kg/palm", perAcre: "Remaining P" },
        potassium: { source: "MOP", dosage: "1kg/palm", perAcre: "Remaining K" }
      }
    ],
    organicAlternatives: [
      { type: "FYM/Compost", dosage: "25kg/palm", timing: "Once a year in May" },
      { type: "Green Leaves (Glyricidia)", dosage: "25kg/palm", timing: "Incorporate in basin" },
      { type: "Neem Cake", dosage: "5kg/palm", timing: "With first fertilizer dose" },
      { type: "Coir Pith Compost", dosage: "50kg/palm", timing: "Annual application" }
    ],
    source: "CPCRI Kasaragod - Coconut Nutrition Management"
  },
  {
    crop: "Pepper",
    soilType: "Laterite/Forest loam",
    npkRatio: "50g N : 50g P2O5 : 150g K2O per vine/year (young) | 100:100:300 (bearing)",
    schedule: [
      {
        stage: "First Application (May-June - Before Monsoon)",
        nitrogen: { source: "Urea", dosage: "55g/vine (young), 110g (bearing)", perAcre: "1/2 dose" },
        phosphorus: { source: "Super Phosphate", dosage: "160g/vine (young), 320g (bearing)", perAcre: "Full dose once" },
        potassium: { source: "MOP", dosage: "125g/vine (young), 250g (bearing)", perAcre: "1/2 dose" }
      },
      {
        stage: "Second Application (September - After Monsoon)",
        nitrogen: { source: "Urea", dosage: "55g/vine (young), 110g (bearing)", perAcre: "Remaining 1/2" },
        phosphorus: { source: "None", dosage: "0", perAcre: "Already applied" },
        potassium: { source: "MOP", dosage: "125g/vine (young), 250g (bearing)", perAcre: "Remaining 1/2" }
      }
    ],
    organicAlternatives: [
      { type: "FYM", dosage: "10kg/vine", timing: "At start of monsoon" },
      { type: "Neem Cake", dosage: "1kg/vine", timing: "With FYM" },
      { type: "Wood Ash", dosage: "500g/vine", timing: "For potassium supplementation" },
      { type: "Vermicompost", dosage: "5kg/vine", timing: "Split into 2 doses" }
    ],
    source: "IISR Kozhikode - Black Pepper Package of Practices"
  },
  {
    crop: "Ginger",
    soilType: "Forest loam/Laterite with organic matter",
    npkRatio: "75:50:50 kg NPK/ha (30:20:20 kg/acre)",
    schedule: [
      {
        stage: "Basal (At Planting)",
        nitrogen: { source: "FYM + Neem Cake", dosage: "10t FYM + 800kg neem cake/acre", perAcre: "Full organic dose" },
        phosphorus: { source: "Super Phosphate", dosage: "125kg/acre", perAcre: "Full P dose" },
        potassium: { source: "MOP", dosage: "17kg/acre", perAcre: "1/3 of K" }
      },
      {
        stage: "First Top Dressing (45 DAP)",
        nitrogen: { source: "Urea", dosage: "35kg/acre", perAcre: "1/2 of N" },
        phosphorus: { source: "None", dosage: "0", perAcre: "N/A" },
        potassium: { source: "MOP", dosage: "17kg/acre", perAcre: "1/3 of K" }
      },
      {
        stage: "Second Top Dressing (90 DAP)",
        nitrogen: { source: "Urea", dosage: "35kg/acre", perAcre: "Remaining 1/2 N" },
        phosphorus: { source: "None", dosage: "0", perAcre: "N/A" },
        potassium: { source: "MOP", dosage: "17kg/acre", perAcre: "Final 1/3 K" }
      }
    ],
    organicAlternatives: [
      { type: "FYM", dosage: "10t/acre", timing: "As basal application" },
      { type: "Neem Cake", dosage: "800kg/acre", timing: "Mixed with FYM" },
      { type: "Poultry Manure", dosage: "2t/acre", timing: "Alternative to FYM" },
      { type: "Vermicompost", dosage: "2t/acre", timing: "At planting and 45 DAP" }
    ],
    source: "IISR Kozhikode - Ginger Production Technology"
  }
];

// Kerala District Soil Data - Kerala Soil Atlas
export const keralaDistrictSoilData: DistrictSoilData[] = [
  {
    district: "Thiruvananthapuram",
    predominantSoils: ["Laterite", "Red Loam", "Coastal Alluvium", "Sandy Coastal"],
    pH: { min: 4.5, max: 6.5, typical: 5.5 },
    characteristics: ["High iron and aluminum content", "Good drainage in uplands", "Sandy texture in coastal areas"],
    suitableCrops: ["Coconut", "Tapioca", "Banana", "Rubber", "Cashew", "Vegetables"],
    limitations: ["Low organic matter", "Acidic nature", "Low phosphorus availability"],
    recommendations: ["Apply lime @ 600kg/ha for acidic soils", "Regular organic matter addition", "Phosphorus supplementation essential"],
    agroClimaticZone: "Southern Coastal Plain"
  },
  {
    district: "Kollam",
    predominantSoils: ["Laterite", "Alluvial", "Coastal Sandy"],
    pH: { min: 4.8, max: 6.2, typical: 5.6 },
    characteristics: ["Mixed laterite-alluvial zones", "Kuttanad type black clay in some areas"],
    suitableCrops: ["Coconut", "Cashew", "Rubber", "Tapioca", "Banana", "Pepper"],
    limitations: ["Waterlogging in low-lying areas", "Coastal salinity in Ashtamudi region"],
    recommendations: ["Raised bed cultivation in waterlogged areas", "Salt-tolerant varieties for coastal zones"],
    agroClimaticZone: "Southern Coastal Plain"
  },
  {
    district: "Pathanamthitta",
    predominantSoils: ["Laterite", "Forest Loam", "Mountain Soil"],
    pH: { min: 5.0, max: 6.5, typical: 5.8 },
    characteristics: ["High organic matter in forest zones", "Sloping terrain", "Good drainage"],
    suitableCrops: ["Rubber", "Pepper", "Cardamom", "Coffee", "Banana", "Pineapple"],
    limitations: ["Erosion on slopes", "Difficulty in mechanization"],
    recommendations: ["Contour planting", "Terracing on steep slopes", "Cover cropping essential"],
    agroClimaticZone: "Central Midlands"
  },
  {
    district: "Alappuzha",
    predominantSoils: ["Kuttanad Alluvium (Kari soil)", "Coastal Alluvium", "Peat/Organic soil"],
    pH: { min: 3.5, max: 5.5, typical: 4.2 },
    characteristics: ["Below sea level (Kuttanad)", "High organic matter", "Waterlogged conditions", "Acid sulfate soils"],
    suitableCrops: ["Rice (Pokkali, Kuttanad varieties)", "Coconut", "Banana", "Fish farming integration"],
    limitations: ["Severe acidity", "Salinity intrusion", "Waterlogging", "Iron toxicity"],
    recommendations: ["Lime application @ 1t/ha mandatory", "Integrated rice-fish farming", "Drainage management critical"],
    agroClimaticZone: "Kuttanad Special Zone"
  },
  {
    district: "Kottayam",
    predominantSoils: ["Laterite", "Alluvial", "Forest Loam"],
    pH: { min: 4.8, max: 6.0, typical: 5.4 },
    characteristics: ["Rolling terrain", "Good rubber cultivation zone", "Mixed cropping suitable"],
    suitableCrops: ["Rubber", "Pepper", "Coconut", "Banana", "Tapioca", "Pineapple"],
    limitations: ["Acidic nature", "Erosion in sloping areas"],
    recommendations: ["Liming in rubber gardens", "Intercropping with banana/tapioca during immature period"],
    agroClimaticZone: "Central Midlands"
  },
  {
    district: "Idukki",
    predominantSoils: ["Forest Loam", "Mountain Soil", "Laterite"],
    pH: { min: 5.0, max: 6.8, typical: 6.0 },
    characteristics: ["High organic matter", "Cool climate", "Well-drained", "High altitude zones"],
    suitableCrops: ["Cardamom", "Pepper", "Coffee", "Tea", "Vegetables", "Spices"],
    limitations: ["Steep slopes", "Erosion risk", "Accessibility issues"],
    recommendations: ["Shade management for spices", "Contour cultivation", "Mulching mandatory"],
    agroClimaticZone: "High Ranges"
  },
  {
    district: "Ernakulam",
    predominantSoils: ["Laterite", "Coastal Alluvium", "Pokkali lands"],
    pH: { min: 4.5, max: 6.0, typical: 5.3 },
    characteristics: ["Diverse soil types", "Waterlogged in Pokkali areas", "Industrial zone impact"],
    suitableCrops: ["Coconut", "Rice", "Banana", "Vegetables", "Ornamentals", "Aquaculture"],
    limitations: ["Salinity in coastal areas", "Waterlogging in low-lying zones"],
    recommendations: ["Pokkali system for saline areas", "Raised bed horticulture"],
    agroClimaticZone: "Central Coastal Zone"
  },
  {
    district: "Thrissur",
    predominantSoils: ["Laterite", "Alluvial", "Kole Lands (Wetlands)"],
    pH: { min: 4.8, max: 6.5, typical: 5.5 },
    characteristics: ["Major rice bowl", "Kole wetland unique ecosystem", "Diverse cropping zones"],
    suitableCrops: ["Rice", "Coconut", "Banana", "Vegetables", "Arecanut", "Cocoa"],
    limitations: ["Flooding in Kole lands", "Waterlogging", "Pest pressure in rice"],
    recommendations: ["Timely dewatering in Kole", "Integrated pest management in rice"],
    agroClimaticZone: "Central Midlands"
  },
  {
    district: "Palakkad",
    predominantSoils: ["Laterite", "Black Cotton Soil", "Red Loam", "Alluvial"],
    pH: { min: 5.5, max: 7.5, typical: 6.5 },
    characteristics: ["Kerala's rice bowl", "Gap in Western Ghats", "Semi-arid conditions", "Black soil in some areas"],
    suitableCrops: ["Rice", "Sugarcane", "Groundnut", "Vegetables", "Coconut", "Banana"],
    limitations: ["Water scarcity in summer", "Higher temperatures than other districts"],
    recommendations: ["Drip irrigation essential", "Heat-tolerant varieties", "Mulching for moisture conservation"],
    agroClimaticZone: "Palakkad Plains"
  },
  {
    district: "Malappuram",
    predominantSoils: ["Laterite", "Red Loam", "Coastal Alluvium"],
    pH: { min: 5.0, max: 6.2, typical: 5.6 },
    characteristics: ["Undulating terrain", "Rubber and arecanut dominant"],
    suitableCrops: ["Coconut", "Rubber", "Arecanut", "Banana", "Pepper", "Cocoa"],
    limitations: ["Erosion on slopes", "Low soil fertility in degraded areas"],
    recommendations: ["Soil conservation measures", "Organic matter enrichment"],
    agroClimaticZone: "Northern Midlands"
  },
  {
    district: "Kozhikode",
    predominantSoils: ["Laterite", "Red Loam", "Coastal Sandy"],
    pH: { min: 5.0, max: 6.5, typical: 5.7 },
    characteristics: ["Traditional coconut zone", "Spice cultivation in eastern parts"],
    suitableCrops: ["Coconut", "Arecanut", "Banana", "Pepper", "Ginger", "Turmeric"],
    limitations: ["Coastal erosion", "Salinity in Kadalundi area"],
    recommendations: ["Coastal afforestation", "Inland spice cultivation focus"],
    agroClimaticZone: "Northern Coastal Zone"
  },
  {
    district: "Wayanad",
    predominantSoils: ["Forest Loam", "Laterite", "Hill Soil"],
    pH: { min: 5.5, max: 7.0, typical: 6.2 },
    characteristics: ["High organic matter", "Cool climate", "Wildlife corridor", "Tribal farming traditions"],
    suitableCrops: ["Coffee", "Pepper", "Cardamom", "Ginger", "Banana (Nendran)", "Vegetables", "Paddy"],
    limitations: ["Wildlife conflict", "Unpredictable rainfall", "Market access issues"],
    recommendations: ["Agro-forestry systems", "Organic certification opportunities", "Coffee-pepper intercropping"],
    agroClimaticZone: "Wayanad High Ranges"
  },
  {
    district: "Kannur",
    predominantSoils: ["Laterite", "Coastal Alluvium", "Red Loam"],
    pH: { min: 5.0, max: 6.5, typical: 5.5 },
    characteristics: ["Traditional coconut-arecanut gardens", "Pepper intercropping common"],
    suitableCrops: ["Coconut", "Arecanut", "Pepper", "Cashew", "Banana", "Vegetables"],
    limitations: ["Laterite hardpan in some areas", "Coastal erosion"],
    recommendations: ["Breaking laterite pan before planting", "Mixed cropping in arecanut gardens"],
    agroClimaticZone: "Northern Coastal Zone"
  },
  {
    district: "Kasaragod",
    predominantSoils: ["Laterite", "Coastal Sandy", "Red Loam"],
    pH: { min: 5.0, max: 6.2, typical: 5.4 },
    characteristics: ["Coconut research zone (CPCRI)", "Traditional coconut-arecanut belt"],
    suitableCrops: ["Coconut", "Arecanut", "Cashew", "Pepper", "Rubber", "Cocoa"],
    limitations: ["Coconut root wilt in some areas", "Salinity in coastal pockets"],
    recommendations: ["Use CPCRI recommended varieties", "Integrated disease management for root wilt"],
    agroClimaticZone: "Northern Coastal Zone"
  }
];

// IMD Kerala Weather-Based Agronomic Advisories
export const keralaWeatherAdvisories: WeatherAdvisory[] = [
  {
    condition: "Heavy Rainfall",
    threshold: { min: 65, unit: "mm/day" },
    crops: ["All crops"],
    advisory: [
      "Postpone all spray operations",
      "Ensure proper drainage in all fields",
      "Postpone fertilizer application",
      "Prop banana plants to prevent lodging",
      "Check for waterlogging in ginger/turmeric fields",
      "Drain excess water from pepper basins"
    ],
    doNot: [
      "Do NOT spray any pesticides or fungicides",
      "Do NOT apply fertilizers",
      "Do NOT irrigate",
      "Do NOT transplant seedlings"
    ],
    source: "IMD Kerala & ICAR-CRIDA Agrometeorology Advisory"
  },
  {
    condition: "Continuous Drizzle",
    threshold: { min: 3, max: 10, unit: "days continuous" },
    crops: ["Rice", "Pepper", "Cardamom", "Ginger"],
    advisory: [
      "High risk of fungal diseases - monitor closely",
      "Prepare Bordeaux mixture for prophylactic spray when rain stops",
      "Check pepper vines for Phytophthora symptoms",
      "Inspect ginger for soft rot",
      "Monitor rice for blast and sheath blight"
    ],
    doNot: [
      "Do NOT ignore early disease symptoms",
      "Do NOT spray during drizzle"
    ],
    source: "IMD Kerala Agromet Advisory"
  },
  {
    condition: "High Humidity",
    threshold: { min: 85, unit: "%" },
    crops: ["Rice", "Banana", "Pepper", "Spices"],
    advisory: [
      "High disease risk - increase field monitoring",
      "Improve air circulation in gardens (light pruning)",
      "Watch for BPH buildup in rice",
      "Check for Sigatoka in banana",
      "Monitor for quick wilt in pepper"
    ],
    doNot: [
      "Do NOT apply excess nitrogen (promotes disease)",
      "Do NOT overhead irrigate"
    ],
    source: "KAU Agromet Advisory"
  },
  {
    condition: "Dry Spell (Summer)",
    threshold: { min: 15, unit: "days without rain" },
    crops: ["All crops"],
    advisory: [
      "Irrigate coconut palms @ 250L/palm/week",
      "Apply mulch to conserve moisture in all crops",
      "Irrigate banana @ 40-50L/plant/week",
      "Provide shade for cardamom",
      "Reduce fertilizer application (ineffective without moisture)",
      "Basin irrigation for pepper vines"
    ],
    doNot: [
      "Do NOT apply fertilizers without adequate moisture",
      "Do NOT neglect irrigation for coconut during critical summer"
    ],
    source: "IMD Kerala & CPCRI Advisories"
  },
  {
    condition: "High Temperature",
    threshold: { min: 35, unit: "°C" },
    crops: ["Rice", "Vegetables", "Banana"],
    advisory: [
      "Irrigate during early morning or late evening",
      "Increase irrigation frequency",
      "Apply mulch to reduce soil temperature",
      "Provide shade net for nurseries",
      "Spray 1% Potassium Chloride for heat stress",
      "Avoid transplanting during hot hours"
    ],
    doNot: [
      "Do NOT transplant during peak heat (11 AM - 3 PM)",
      "Do NOT allow water stress during flowering"
    ],
    source: "KAU Advisory for Heat Wave"
  },
  {
    condition: "Strong Winds",
    threshold: { min: 40, unit: "km/h" },
    crops: ["Banana", "Coconut", "Arecanut"],
    advisory: [
      "Prop banana plants with bamboo stakes",
      "Postpone all spray operations",
      "Harvest mature bunches immediately",
      "Check coconut palms for loose fronds (safety hazard)",
      "Secure shade structures in cardamom gardens"
    ],
    doNot: [
      "Do NOT spray during windy conditions",
      "Do NOT work near tall palms during strong winds"
    ],
    source: "IMD Kerala Cyclone/Wind Advisory"
  },
  {
    condition: "Pre-Monsoon Period",
    threshold: { min: 0, unit: "May-June" },
    crops: ["All crops"],
    advisory: [
      "Complete land preparation before monsoon onset",
      "Apply basal fertilizers 1-2 weeks before expected rain",
      "Treat planting materials (ginger, turmeric rhizomes)",
      "Prepare nursery for rice",
      "Apply prophylactic Bordeaux mixture to pepper",
      "Clean drainage channels",
      "Stock pesticides and inputs"
    ],
    doNot: [
      "Do NOT delay planting operations",
      "Do NOT leave fields without drainage provision"
    ],
    source: "Kerala State Agriculture Department Pre-Monsoon Advisory"
  },
  {
    condition: "Post-Monsoon (Thulavarsham)",
    threshold: { min: 0, unit: "October-November" },
    crops: ["Rice", "Pepper", "Banana"],
    advisory: [
      "Apply second dose of fertilizers to coconut and pepper",
      "Harvest Mundakan rice as it matures",
      "Monitor pepper for pollu beetle",
      "Complete banana bunch covering",
      "Start harvesting pepper spikes",
      "Apply second top dressing to ginger/turmeric"
    ],
    doNot: [
      "Do NOT delay pepper harvest (quality deterioration)",
      "Do NOT ignore drainage after northeast monsoon rains"
    ],
    source: "Kerala Agriculture Department Seasonal Advisory"
  },
  {
    condition: "Low Temperature (Highland)",
    threshold: { max: 15, unit: "°C" },
    crops: ["Cardamom", "Coffee", "Vegetables"],
    advisory: [
      "Protect nurseries with polythene covers",
      "Apply mulch to maintain soil temperature",
      "Reduce irrigation frequency",
      "Provide smoke screens for frost protection (if frost risk)",
      "Delay transplanting of tender seedlings"
    ],
    doNot: [
      "Do NOT irrigate in late evening (frost risk)",
      "Do NOT transplant tender seedlings during cold spells"
    ],
    source: "IISR & ICRI Highland Advisories"
  }
];

// Helper function to get crop calendar by crop name and district
export function getCropCalendar(cropName: string, district?: string): CropCalendarEntry | undefined {
  const normalizedCrop = cropName.toLowerCase();
  return keralaCropCalendars.find(cal => {
    const nameMatch = cal.crop.toLowerCase().includes(normalizedCrop) || 
                      normalizedCrop.includes(cal.crop.toLowerCase().split(' ')[0]);
    if (district) {
      return nameMatch && (cal.districts.includes(district) || cal.districts.includes("All Kerala districts") || cal.districts.some(d => d.toLowerCase().includes('all')));
    }
    return nameMatch;
  });
}

// Helper function to calculate crop stage from sowing date
export function calculateCropStage(sowingDate: Date, cropCalendar: CropCalendarEntry): { stage: string; daysFromSowing: number; operations: string[]; pestWatch?: string[] } | null {
  const today = new Date();
  const daysFromSowing = Math.floor((today.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysFromSowing < 0) {
    return { stage: "Not yet planted", daysFromSowing, operations: ["Prepare land", "Procure inputs"] };
  }
  
  for (const stage of cropCalendar.stages) {
    if (daysFromSowing >= stage.startDay && daysFromSowing <= stage.endDay) {
      return {
        stage: stage.name,
        daysFromSowing,
        operations: stage.operations,
        pestWatch: stage.pestWatch
      };
    }
  }
  
  // Beyond crop duration
  return { stage: "Harvest/Post-harvest", daysFromSowing, operations: ["Harvest if not done", "Post-harvest processing"] };
}

// Helper function to get pest management for a crop and district
export function getPestManagement(cropName: string, district: string): PestEntry[] {
  const normalizedCrop = cropName.toLowerCase();
  return keralaPestManagement.filter(pest => {
    const cropMatch = pest.crop.toLowerCase().includes(normalizedCrop) || 
                      normalizedCrop.includes(pest.crop.toLowerCase());
    const districtMatch = pest.districts.some(d => 
      d.toLowerCase().includes(district.toLowerCase()) || 
      d.toLowerCase().includes('all')
    );
    return cropMatch && districtMatch;
  });
}

// Helper function to get soil data for a district
export function getDistrictSoilData(district: string): DistrictSoilData | undefined {
  return keralaDistrictSoilData.find(soil => 
    soil.district.toLowerCase() === district.toLowerCase()
  );
}

// Helper function to get fertilizer recommendation for a crop and soil type
export function getFertilizerRecommendation(cropName: string, soilType?: string): FertilizerRecommendation | undefined {
  const normalizedCrop = cropName.toLowerCase();
  return keralaFertilizerRecommendations.find(rec => {
    const cropMatch = rec.crop.toLowerCase().includes(normalizedCrop) || 
                      normalizedCrop.includes(rec.crop.toLowerCase().split(' ')[0]);
    if (soilType) {
      return cropMatch && rec.soilType.toLowerCase().includes(soilType.toLowerCase());
    }
    return cropMatch;
  });
}

// Helper function to get weather advisories based on current conditions
export function getWeatherAdvisories(
  temperature: number,
  humidity: number,
  rainfall: number,
  windSpeed: number,
  month: number
): WeatherAdvisory[] {
  const advisories: WeatherAdvisory[] = [];
  
  keralaWeatherAdvisories.forEach(advisory => {
    let matches = false;
    
    switch (advisory.condition) {
      case "Heavy Rainfall":
        if (rainfall >= (advisory.threshold.min || 0)) matches = true;
        break;
      case "High Humidity":
        if (humidity >= (advisory.threshold.min || 0)) matches = true;
        break;
      case "Dry Spell (Summer)":
        if (rainfall === 0 && (month >= 1 && month <= 5)) matches = true;
        break;
      case "High Temperature":
        if (temperature >= (advisory.threshold.min || 0)) matches = true;
        break;
      case "Strong Winds":
        if (windSpeed >= (advisory.threshold.min || 0)) matches = true;
        break;
      case "Pre-Monsoon Period":
        if (month === 5 || month === 6) matches = true;
        break;
      case "Post-Monsoon (Thulavarsham)":
        if (month === 10 || month === 11) matches = true;
        break;
      case "Low Temperature (Highland)":
        if (temperature <= (advisory.threshold.max || 100)) matches = true;
        break;
    }
    
    if (matches) advisories.push(advisory);
  });
  
  return advisories;
}
