import distributorsData from './agriDistributorsData.json';

export interface Dealer {
  sn: string;
  unit_name: string;
  owner_name: string | null;
  is_household_dealer: string | null;
  address: string | null;
  phone: string | null;
  license_number: string | null;
  validity: string | null;
}

export interface District {
  name: string;
  dealers: Dealer[];
}

// Kerala farming product types
export const productTypes = [
  'Pesticides',
  'Insecticides',
  'Fungicides',
  'Herbicides',
  'Organic Fertilizers',
  'NPK Fertilizers',
  'Urea',
  'DAP',
  'Potash',
  'Micronutrients',
  'Bio-fertilizers',
  'Seeds'
] as const;

export type ProductType = typeof productTypes[number];

// Random banner images for distributors
const bannerImages = [
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
  'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=800&q=80',
  'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=800&q=80',
  'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80',
  'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&q=80',
  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80',
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
];

// Function to get a random banner image
export const getRandomBannerImage = (index: number): string => {
  return bannerImages[index % bannerImages.length];
};

// Function to get random products for a dealer (2-5 products)
export const getRandomProducts = (seed: number): ProductType[] => {
  const numProducts = 2 + (seed % 4); // 2 to 5 products
  const shuffled = [...productTypes].sort(() => 0.5 - Math.sin(seed));
  return shuffled.slice(0, numProducts) as ProductType[];
};

// Get all districts
export const getDistricts = (): District[] => {
  return distributorsData.districts;
};

// Get all district names
export const getDistrictNames = (): string[] => {
  return distributorsData.districts.map(d => d.name);
};

// Get dealers by district
export const getDealersByDistrict = (districtName: string): Dealer[] => {
  const district = distributorsData.districts.find(d => d.name === districtName);
  return district?.dealers || [];
};

// Get all dealers with district info - only licensed vendors
export interface DealerWithDistrict extends Dealer {
  district: string;
  bannerImage: string;
  products: ProductType[];
}

export const getAllDealers = (): DealerWithDistrict[] => {
  let index = 0;
  return distributorsData.districts.flatMap(district => 
    district.dealers
      .filter(dealer => dealer.license_number && dealer.license_number.trim() !== '') // Only licensed dealers
      .map(dealer => ({
        ...dealer,
        district: district.name,
        bannerImage: getRandomBannerImage(index),
        products: getRandomProducts(index++)
      }))
  );
};

// Search dealers with product filter
export const searchDealers = (
  query: string, 
  districtFilter?: string,
  productFilter?: string
): DealerWithDistrict[] => {
  let dealers = getAllDealers();
  
  if (districtFilter && districtFilter !== 'all') {
    dealers = dealers.filter(d => d.district === districtFilter);
  }
  
  if (productFilter && productFilter !== 'all') {
    dealers = dealers.filter(d => d.products.includes(productFilter as ProductType));
  }
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    dealers = dealers.filter(d => 
      d.unit_name.toLowerCase().includes(lowerQuery) ||
      (d.owner_name && d.owner_name.toLowerCase().includes(lowerQuery)) ||
      (d.address && d.address.toLowerCase().includes(lowerQuery))
    );
  }
  
  return dealers;
};
