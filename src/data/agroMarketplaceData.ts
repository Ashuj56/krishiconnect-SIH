// Agro Marketplace Data for all categories

// User's current location (dummy coordinates - Thrissur, Kerala)
export const userLocation = {
  lat: 10.5276,
  lng: 76.2144,
  name: "Thrissur, Kerala"
};

// Vendor locations with coordinates for distance calculation
interface VendorLocation {
  lat: number;
  lng: number;
  name: string;
}

const vendorLocations: Record<string, VendorLocation> = {
  thrissur: { lat: 10.5276, lng: 76.2144, name: "Thrissur, Kerala" },
  ernakulam: { lat: 9.9312, lng: 76.2673, name: "Ernakulam, Kerala" },
  palakkad: { lat: 10.7867, lng: 76.6548, name: "Palakkad, Kerala" },
  kottayam: { lat: 9.5916, lng: 76.5222, name: "Kottayam, Kerala" },
  kozhikode: { lat: 11.2588, lng: 75.7804, name: "Kozhikode, Kerala" },
  alappuzha: { lat: 9.4981, lng: 76.3388, name: "Alappuzha, Kerala" },
  kollam: { lat: 8.8932, lng: 76.6141, name: "Kollam, Kerala" },
  kannur: { lat: 11.8745, lng: 75.3704, name: "Kannur, Kerala" },
  malappuram: { lat: 11.0510, lng: 76.0711, name: "Malappuram, Kerala" },
  wayanad: { lat: 11.6854, lng: 76.1320, name: "Wayanad, Kerala" },
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
};

// Product interface
export interface Product {
  name: string;
  price: number;
  originalPrice?: number;
  type: string;
  crop?: string;
  brand?: string;
  weight?: string;
  inStock: boolean;
}

// Vendor interface
export interface Vendor {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  coordinates: { lat: number; lng: number };
  deliveryTime: string;
  tags: string[];
  isPromoted: boolean;
  category: 'pesticides' | 'fertilizers' | 'seeds' | 'equipment';
  products: Product[];
}

// ====================== PESTICIDES VENDORS ======================
export const pesticidesVendors: Vendor[] = [
  {
    id: 1,
    name: "Kerala Agro Chemicals",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 342,
    location: "Thrissur, Kerala",
    coordinates: vendorLocations.thrissur,
    deliveryTime: "30-45 min",
    tags: ["Verified", "Fast Delivery", "Bulk Orders"],
    isPromoted: true,
    category: 'pesticides',
    products: [
      { name: "Neem Oil Organic", price: 280, originalPrice: 350, type: "Bio-Pesticide", crop: "Vegetables", inStock: true },
      { name: "Chlorpyrifos 20% EC", price: 450, type: "Insecticide", crop: "Paddy", inStock: true },
      { name: "Mancozeb 75% WP", price: 320, type: "Fungicide", crop: "Coconut", inStock: false },
      { name: "Imidacloprid 17.8% SL", price: 520, type: "Insecticide", crop: "Banana", inStock: true },
    ]
  },
  {
    id: 2,
    name: "Green Shield Agri Store",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop",
    rating: 4.3,
    reviews: 189,
    location: "Ernakulam, Kerala",
    coordinates: vendorLocations.ernakulam,
    deliveryTime: "45-60 min",
    tags: ["Organic Specialist", "Bulk Orders"],
    isPromoted: false,
    category: 'pesticides',
    products: [
      { name: "Trichoderma Powder", price: 180, type: "Bio-Pesticide", crop: "All Crops", inStock: true },
      { name: "Copper Oxychloride 50%", price: 290, originalPrice: 340, type: "Fungicide", crop: "Spices", inStock: true },
      { name: "Glyphosate 41% SL", price: 520, type: "Herbicide", crop: "All Crops", inStock: true },
    ]
  },
  {
    id: 3,
    name: "Farmer's Choice Pesticides",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 567,
    location: "Palakkad, Kerala",
    coordinates: vendorLocations.palakkad,
    deliveryTime: "20-30 min",
    tags: ["Top Rated", "Verified", "Fast Delivery"],
    isPromoted: true,
    category: 'pesticides',
    products: [
      { name: "Imidacloprid 17.8%", price: 380, type: "Insecticide", crop: "Banana", inStock: true },
      { name: "Carbendazim 50% WP", price: 260, type: "Fungicide", crop: "Paddy", inStock: true },
      { name: "2,4-D Amine Salt", price: 195, originalPrice: 250, type: "Herbicide", crop: "Paddy", inStock: true },
    ]
  },
  {
    id: 4,
    name: "Bio Agri Solutions",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
    rating: 4.5,
    reviews: 234,
    location: "Kottayam, Kerala",
    coordinates: vendorLocations.kottayam,
    deliveryTime: "50-70 min",
    tags: ["100% Organic", "Eco-Friendly"],
    isPromoted: false,
    category: 'pesticides',
    products: [
      { name: "Beauveria Bassiana", price: 220, type: "Bio-Pesticide", crop: "Coconut", inStock: true },
      { name: "Pseudomonas fluorescens", price: 195, type: "Bio-Pesticide", crop: "Vegetables", inStock: true },
      { name: "Neem Cake Powder", price: 150, originalPrice: 180, type: "Bio-Pesticide", crop: "All Crops", inStock: true },
    ]
  },
  {
    id: 5,
    name: "Agri Max Traders",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop",
    rating: 4.1,
    reviews: 156,
    location: "Kozhikode, Kerala",
    coordinates: vendorLocations.kozhikode,
    deliveryTime: "35-50 min",
    tags: ["Wide Range", "Competitive Prices"],
    isPromoted: false,
    category: 'pesticides',
    products: [
      { name: "Malathion 50% EC", price: 310, type: "Insecticide", crop: "Vegetables", inStock: true },
      { name: "Hexaconazole 5% EC", price: 420, type: "Fungicide", crop: "Spices", inStock: false },
      { name: "Pendimethalin 30% EC", price: 480, type: "Herbicide", crop: "Paddy", inStock: true },
    ]
  },
  {
    id: 6,
    name: "Kerala Organic Agro",
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 423,
    location: "Alappuzha, Kerala",
    coordinates: vendorLocations.alappuzha,
    deliveryTime: "60-80 min",
    tags: ["Premium Quality", "Organic Certified"],
    isPromoted: true,
    category: 'pesticides',
    products: [
      { name: "Azadirachtin 0.03%", price: 340, type: "Bio-Pesticide", crop: "All Crops", inStock: true },
      { name: "Bacillus thuringiensis", price: 280, type: "Bio-Pesticide", crop: "Vegetables", inStock: true },
      { name: "Fish Amino Acid", price: 190, originalPrice: 230, type: "Bio-Pesticide", crop: "All Crops", inStock: true },
    ]
  },
  {
    id: 7,
    name: "South Kerala Pesticides",
    image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c10?w=400&h=300&fit=crop",
    rating: 4.2,
    reviews: 178,
    location: "Kollam, Kerala",
    coordinates: vendorLocations.kollam,
    deliveryTime: "40-55 min",
    tags: ["Verified", "Home Delivery"],
    isPromoted: false,
    category: 'pesticides',
    products: [
      { name: "Lambda Cyhalothrin 5%", price: 380, type: "Insecticide", crop: "Vegetables", inStock: true },
      { name: "Propiconazole 25%", price: 450, type: "Fungicide", crop: "Paddy", inStock: true },
      { name: "Paraquat Dichloride", price: 320, type: "Herbicide", crop: "Coconut", inStock: true },
    ]
  },
];

// ====================== FERTILIZERS VENDORS ======================
export const fertilizersVendors: Vendor[] = [
  {
    id: 101,
    name: "Kerala Fertilizers Hub",
    image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 456,
    location: "Thrissur, Kerala",
    coordinates: vendorLocations.thrissur,
    deliveryTime: "25-40 min",
    tags: ["Verified", "Bulk Orders", "Fast Delivery"],
    isPromoted: true,
    category: 'fertilizers',
    products: [
      { name: "Urea (46% N)", price: 270, type: "Nitrogen", weight: "50 kg", brand: "IFFCO", inStock: true },
      { name: "DAP (18-46-0)", price: 1350, type: "Phosphorus", weight: "50 kg", brand: "Coromandel", inStock: true },
      { name: "MOP (Potash)", price: 900, originalPrice: 1000, type: "Potassium", weight: "50 kg", brand: "IPL", inStock: true },
    ]
  },
  {
    id: 102,
    name: "Organic Manure Center",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    rating: 4.5,
    reviews: 312,
    location: "Ernakulam, Kerala",
    coordinates: vendorLocations.ernakulam,
    deliveryTime: "40-55 min",
    tags: ["100% Organic", "Eco-Friendly", "Verified"],
    isPromoted: false,
    category: 'fertilizers',
    products: [
      { name: "Vermicompost Premium", price: 12, type: "Organic", weight: "1 kg", brand: "Nature's Best", inStock: true },
      { name: "Cow Dung Manure", price: 8, type: "Organic", weight: "1 kg", brand: "Farm Fresh", inStock: true },
      { name: "Neem Cake", price: 25, originalPrice: 30, type: "Organic", weight: "1 kg", brand: "Agro Care", inStock: true },
    ]
  },
  {
    id: 103,
    name: "NPK Solutions Palakkad",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 289,
    location: "Palakkad, Kerala",
    coordinates: vendorLocations.palakkad,
    deliveryTime: "30-45 min",
    tags: ["Top Rated", "Wide Range", "Bulk Orders"],
    isPromoted: true,
    category: 'fertilizers',
    products: [
      { name: "NPK 17-17-17", price: 1100, type: "Complex", weight: "50 kg", brand: "Zuari", inStock: true },
      { name: "NPK 19-19-19", price: 1200, type: "Complex", weight: "50 kg", brand: "Nagarjuna", inStock: true },
      { name: "Ammonium Sulphate", price: 450, type: "Nitrogen", weight: "50 kg", brand: "GSFC", inStock: false },
    ]
  },
  {
    id: 104,
    name: "Bio Fertilizer Point",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
    rating: 4.4,
    reviews: 198,
    location: "Kottayam, Kerala",
    coordinates: vendorLocations.kottayam,
    deliveryTime: "45-60 min",
    tags: ["Bio Specialist", "Home Delivery"],
    isPromoted: false,
    category: 'fertilizers',
    products: [
      { name: "Rhizobium Culture", price: 85, type: "Bio-Fertilizer", weight: "200g", brand: "IARI", inStock: true },
      { name: "Azotobacter", price: 75, type: "Bio-Fertilizer", weight: "200g", brand: "BioMax", inStock: true },
      { name: "PSB (Phosphate Solubilizing)", price: 90, type: "Bio-Fertilizer", weight: "200g", brand: "AgriLife", inStock: true },
    ]
  },
  {
    id: 105,
    name: "Micronutrient World",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop",
    rating: 4.3,
    reviews: 167,
    location: "Kozhikode, Kerala",
    coordinates: vendorLocations.kozhikode,
    deliveryTime: "35-50 min",
    tags: ["Specialty Fertilizers", "Verified"],
    isPromoted: false,
    category: 'fertilizers',
    products: [
      { name: "Zinc Sulphate 21%", price: 180, type: "Micronutrient", weight: "5 kg", brand: "Tata", inStock: true },
      { name: "Ferrous Sulphate", price: 120, type: "Micronutrient", weight: "5 kg", brand: "Deepak", inStock: true },
      { name: "Borax", price: 250, originalPrice: 300, type: "Micronutrient", weight: "1 kg", brand: "Indo Borax", inStock: true },
    ]
  },
  {
    id: 106,
    name: "Foliar Feed Center",
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 534,
    location: "Alappuzha, Kerala",
    coordinates: vendorLocations.alappuzha,
    deliveryTime: "50-70 min",
    tags: ["Premium Quality", "Fast Delivery", "Verified"],
    isPromoted: true,
    category: 'fertilizers',
    products: [
      { name: "Seaweed Extract", price: 320, type: "Organic", weight: "1 L", brand: "Ocean Gold", inStock: true },
      { name: "Humic Acid Liquid", price: 280, type: "Organic", weight: "1 L", brand: "BioGrow", inStock: true },
      { name: "Amino Acid Complex", price: 450, type: "Organic", weight: "1 L", brand: "VitaPlant", inStock: true },
    ]
  },
];

// ====================== SEEDS VENDORS ======================
export const seedsVendors: Vendor[] = [
  {
    id: 201,
    name: "Kerala Seeds Corporation",
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 678,
    location: "Thrissur, Kerala",
    coordinates: vendorLocations.thrissur,
    deliveryTime: "25-35 min",
    tags: ["Certified Seeds", "Verified", "Govt. Supplier"],
    isPromoted: true,
    category: 'seeds',
    products: [
      { name: "Jyothi Paddy Seeds", price: 120, type: "Paddy", weight: "1 kg", brand: "KAU", inStock: true },
      { name: "Uma Paddy Seeds", price: 110, type: "Paddy", weight: "1 kg", brand: "KAU", inStock: true },
      { name: "Kairali Cowpea", price: 180, originalPrice: 220, type: "Vegetables", weight: "500g", brand: "KAU", inStock: true },
    ]
  },
  {
    id: 202,
    name: "Hybrid Seeds Emporium",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    rating: 4.5,
    reviews: 423,
    location: "Ernakulam, Kerala",
    coordinates: vendorLocations.ernakulam,
    deliveryTime: "35-50 min",
    tags: ["Hybrid Specialist", "High Yield", "Verified"],
    isPromoted: false,
    category: 'seeds',
    products: [
      { name: "Tomato Hybrid F1", price: 450, type: "Vegetables", weight: "10g", brand: "Syngenta", inStock: true },
      { name: "Chilli Hybrid", price: 380, type: "Vegetables", weight: "10g", brand: "Nunhems", inStock: true },
      { name: "Brinjal Hybrid", price: 320, type: "Vegetables", weight: "10g", brand: "Seminis", inStock: true },
    ]
  },
  {
    id: 203,
    name: "Traditional Seeds Bank",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 345,
    location: "Palakkad, Kerala",
    coordinates: vendorLocations.palakkad,
    deliveryTime: "30-40 min",
    tags: ["Heritage Seeds", "Organic", "Top Rated"],
    isPromoted: true,
    category: 'seeds',
    products: [
      { name: "Navara Rice Seeds", price: 280, type: "Paddy", weight: "1 kg", brand: "Traditional", inStock: true },
      { name: "Pokkali Rice Seeds", price: 320, type: "Paddy", weight: "1 kg", brand: "Traditional", inStock: true },
      { name: "Native Cucumber", price: 150, type: "Vegetables", weight: "50g", brand: "Heritage", inStock: true },
    ]
  },
  {
    id: 204,
    name: "Spice Seeds Paradise",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
    rating: 4.4,
    reviews: 234,
    location: "Wayanad, Kerala",
    coordinates: vendorLocations.wayanad,
    deliveryTime: "60-80 min",
    tags: ["Spice Specialist", "Premium Quality"],
    isPromoted: false,
    category: 'seeds',
    products: [
      { name: "Pepper Cuttings", price: 45, type: "Spices", weight: "1 pc", brand: "Panniyur", inStock: true },
      { name: "Cardamom Seeds", price: 650, type: "Spices", weight: "100g", brand: "Idukki Gold", inStock: true },
      { name: "Ginger Rhizomes", price: 80, type: "Spices", weight: "1 kg", brand: "Maran", inStock: true },
    ]
  },
  {
    id: 205,
    name: "Fruit Saplings Center",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 456,
    location: "Malappuram, Kerala",
    coordinates: vendorLocations.malappuram,
    deliveryTime: "45-60 min",
    tags: ["Saplings", "Grafted Plants", "Verified"],
    isPromoted: false,
    category: 'seeds',
    products: [
      { name: "Mango Grafted (Alphonso)", price: 350, type: "Fruits", weight: "1 plant", brand: "Tropical", inStock: true },
      { name: "Coconut Seedlings (DxT)", price: 180, type: "Fruits", weight: "1 plant", brand: "CPCRI", inStock: true },
      { name: "Banana Sucker (Nendran)", price: 85, originalPrice: 100, type: "Fruits", weight: "1 plant", brand: "Local", inStock: true },
    ]
  },
  {
    id: 206,
    name: "Vegetable Seeds Mart",
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop",
    rating: 4.3,
    reviews: 289,
    location: "Kannur, Kerala",
    coordinates: vendorLocations.kannur,
    deliveryTime: "55-70 min",
    tags: ["Vegetable Seeds", "Bulk Orders"],
    isPromoted: false,
    category: 'seeds',
    products: [
      { name: "Okra (Bhindi) Seeds", price: 65, type: "Vegetables", weight: "100g", brand: "East-West", inStock: true },
      { name: "Bitter Gourd Seeds", price: 85, type: "Vegetables", weight: "50g", brand: "Namdhari", inStock: true },
      { name: "Snake Gourd Seeds", price: 70, type: "Vegetables", weight: "50g", brand: "Indo-US", inStock: true },
    ]
  },
];

// ====================== EQUIPMENT VENDORS ======================
export const equipmentVendors: Vendor[] = [
  {
    id: 301,
    name: "Agri Equipment World",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 534,
    location: "Thrissur, Kerala",
    coordinates: vendorLocations.thrissur,
    deliveryTime: "Same Day",
    tags: ["Verified", "Installation Service", "Warranty"],
    isPromoted: true,
    category: 'equipment',
    products: [
      { name: "Knapsack Sprayer 16L", price: 1850, type: "Sprayers", brand: "Neptune", inStock: true },
      { name: "Power Sprayer 20L", price: 12500, originalPrice: 14000, type: "Sprayers", brand: "Honda", inStock: true },
      { name: "Drip Irrigation Kit (1 Acre)", price: 18000, type: "Irrigation", brand: "Jain", inStock: true },
    ]
  },
  {
    id: 302,
    name: "Farm Tools Center",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    rating: 4.4,
    reviews: 312,
    location: "Ernakulam, Kerala",
    coordinates: vendorLocations.ernakulam,
    deliveryTime: "1-2 Days",
    tags: ["Hand Tools", "Quality Products"],
    isPromoted: false,
    category: 'equipment',
    products: [
      { name: "Cutter/Sickle Set", price: 450, type: "Hand Tools", brand: "Stanley", inStock: true },
      { name: "Garden Hoe", price: 280, type: "Hand Tools", brand: "Falcon", inStock: true },
      { name: "Pruning Shears", price: 650, originalPrice: 750, type: "Hand Tools", brand: "Tramontina", inStock: true },
    ]
  },
  {
    id: 303,
    name: "Irrigation Solutions",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 678,
    location: "Palakkad, Kerala",
    coordinates: vendorLocations.palakkad,
    deliveryTime: "Same Day",
    tags: ["Top Rated", "Expert Installation", "After Sales"],
    isPromoted: true,
    category: 'equipment',
    products: [
      { name: "Submersible Pump 1HP", price: 8500, type: "Pumps", brand: "Kirloskar", inStock: true },
      { name: "Sprinkler System Kit", price: 4500, type: "Irrigation", brand: "Rain Bird", inStock: true },
      { name: "Solar Water Pump", price: 45000, type: "Pumps", brand: "Tata Solar", inStock: false },
    ]
  },
  {
    id: 304,
    name: "Power Equipment Depot",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop",
    rating: 4.5,
    reviews: 423,
    location: "Kottayam, Kerala",
    coordinates: vendorLocations.kottayam,
    deliveryTime: "2-3 Days",
    tags: ["Power Tools", "Rental Available", "Service Center"],
    isPromoted: false,
    category: 'equipment',
    products: [
      { name: "Power Tiller", price: 125000, type: "Machinery", brand: "VST", inStock: true },
      { name: "Brush Cutter", price: 18500, type: "Power Tools", brand: "Stihl", inStock: true },
      { name: "Chain Saw", price: 22000, originalPrice: 25000, type: "Power Tools", brand: "Husqvarna", inStock: true },
    ]
  },
  {
    id: 305,
    name: "Greenhouse Supplies",
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 234,
    location: "Wayanad, Kerala",
    coordinates: vendorLocations.wayanad,
    deliveryTime: "3-5 Days",
    tags: ["Polyhouse Materials", "Technical Support"],
    isPromoted: false,
    category: 'equipment',
    products: [
      { name: "UV Plastic Sheet (200 micron)", price: 85, type: "Greenhouse", brand: "Ginegar", weight: "per sqm", inStock: true },
      { name: "Shade Net 50%", price: 45, type: "Greenhouse", brand: "Netafim", weight: "per sqm", inStock: true },
      { name: "Insect Net", price: 65, type: "Greenhouse", brand: "Green Pro", weight: "per sqm", inStock: true },
    ]
  },
  {
    id: 306,
    name: "Smart Farming Tech",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 189,
    location: "Kozhikode, Kerala",
    coordinates: vendorLocations.kozhikode,
    deliveryTime: "Same Day",
    tags: ["IoT Devices", "Smart Farming", "Premium"],
    isPromoted: true,
    category: 'equipment',
    products: [
      { name: "Soil Moisture Sensor", price: 1200, type: "Sensors", brand: "AgriTech", inStock: true },
      { name: "Weather Station Kit", price: 8500, type: "Sensors", brand: "Davis", inStock: true },
      { name: "Auto Irrigation Controller", price: 5500, originalPrice: 6500, type: "Controllers", brand: "Hunter", inStock: true },
    ]
  },
];

// ====================== FILTER OPTIONS PER CATEGORY ======================
export const filterOptions = {
  pesticides: {
    types: ["Insecticide", "Fungicide", "Herbicide", "Bio-Pesticide"],
    crops: ["Paddy", "Coconut", "Banana", "Vegetables", "Spices", "All Crops"],
    compositions: ["Neem Based", "Chlorpyrifos", "Mancozeb", "Glyphosate", "Copper Oxychloride"],
  },
  fertilizers: {
    types: ["Nitrogen", "Phosphorus", "Potassium", "Complex", "Organic", "Bio-Fertilizer", "Micronutrient"],
    brands: ["IFFCO", "Coromandel", "Zuari", "Nagarjuna", "Tata", "Nature's Best"],
    forms: ["Granular", "Liquid", "Powder", "Pellets"],
  },
  seeds: {
    types: ["Paddy", "Vegetables", "Spices", "Fruits", "Cereals", "Pulses"],
    varieties: ["Hybrid", "Open Pollinated", "Traditional", "Certified", "Grafted"],
    brands: ["KAU", "Syngenta", "Nunhems", "Seminis", "East-West", "Namdhari"],
  },
  equipment: {
    types: ["Sprayers", "Irrigation", "Pumps", "Hand Tools", "Power Tools", "Machinery", "Greenhouse", "Sensors", "Controllers"],
    brands: ["Neptune", "Honda", "Jain", "Kirloskar", "Stihl", "Husqvarna", "Tata"],
    features: ["Installation Service", "Warranty", "Rental Available", "After Sales"],
  },
};

// Common filter options across all categories
export const priceRanges = [
  { label: "Below ₹300", min: 0, max: 300 },
  { label: "₹300 - ₹700", min: 300, max: 700 },
  { label: "₹700 - ₹2000", min: 700, max: 2000 },
  { label: "Above ₹2000", min: 2000, max: Infinity }
];

export const ratingFilters = ["4.5+", "4.0+", "3.5+"];
export const availabilityFilters = ["In Stock", "Bulk Order", "Fast Delivery"];

// Get all vendors by category
export const getVendorsByCategory = (category: string): Vendor[] => {
  switch (category) {
    case 'pesticides':
      return pesticidesVendors;
    case 'fertilizers':
      return fertilizersVendors;
    case 'seeds':
      return seedsVendors;
    case 'equipment':
      return equipmentVendors;
    default:
      return pesticidesVendors;
  }
};

// Get category title
export const getCategoryTitle = (category: string): string => {
  switch (category) {
    case 'pesticides':
      return 'Pesticides';
    case 'fertilizers':
      return 'Fertilizers';
    case 'seeds':
      return 'Seeds & Planting Materials';
    case 'equipment':
      return 'Farm Equipment & Tools';
    default:
      return 'Products';
  }
};

// Kerala locations for dropdown
export const keralaLocations = [
  "Thrissur, Kerala",
  "Ernakulam, Kerala",
  "Palakkad, Kerala",
  "Kottayam, Kerala",
  "Kozhikode, Kerala",
  "Alappuzha, Kerala",
  "Kollam, Kerala",
  "Kannur, Kerala",
  "Malappuram, Kerala",
  "Wayanad, Kerala",
  "Idukki, Kerala",
  "Pathanamthitta, Kerala",
  "Thiruvananthapuram, Kerala",
  "Kasaragod, Kerala",
];

// Get coordinates for a location
export const getLocationCoordinates = (locationName: string): { lat: number; lng: number } => {
  const locationKey = locationName.toLowerCase().split(',')[0].trim().replace(/\s+/g, '');
  const location = vendorLocations[locationKey];
  return location ? { lat: location.lat, lng: location.lng } : { lat: 10.5276, lng: 76.2144 }; // Default to Thrissur
};

// Combined vendors array for microfinance integration
export interface VendorWithProducts {
  id: string;
  name: string;
  rating: number;
  location: string;
  deliveryTime: string;
  category: string;
}

export const vendors: VendorWithProducts[] = [
  ...pesticidesVendors.map(v => ({ id: v.id.toString(), name: v.name, rating: v.rating, location: v.location, deliveryTime: v.deliveryTime, category: 'Pesticides' })),
  ...fertilizersVendors.map(v => ({ id: v.id.toString(), name: v.name, rating: v.rating, location: v.location, deliveryTime: v.deliveryTime, category: 'Fertilizers' })),
  ...seedsVendors.map(v => ({ id: v.id.toString(), name: v.name, rating: v.rating, location: v.location, deliveryTime: v.deliveryTime, category: 'Seeds' })),
  ...equipmentVendors.map(v => ({ id: v.id.toString(), name: v.name, rating: v.rating, location: v.location, deliveryTime: v.deliveryTime, category: 'Equipment' })),
];

// Vendor products for display
export interface VendorProduct {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  type: string;
  inStock: boolean;
}

export const vendorProducts: VendorProduct[] = [
  ...pesticidesVendors.flatMap(v => v.products.map((p, idx) => ({ id: `${v.id}-${idx}`, vendorId: v.id.toString(), name: p.name, price: p.price, type: p.type, inStock: p.inStock }))),
  ...fertilizersVendors.flatMap(v => v.products.map((p, idx) => ({ id: `${v.id}-${idx}`, vendorId: v.id.toString(), name: p.name, price: p.price, type: p.type, inStock: p.inStock }))),
  ...seedsVendors.flatMap(v => v.products.map((p, idx) => ({ id: `${v.id}-${idx}`, vendorId: v.id.toString(), name: p.name, price: p.price, type: p.type, inStock: p.inStock }))),
  ...equipmentVendors.flatMap(v => v.products.map((p, idx) => ({ id: `${v.id}-${idx}`, vendorId: v.id.toString(), name: p.name, price: p.price, type: p.type, inStock: p.inStock }))),
];
