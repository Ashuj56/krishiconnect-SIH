// Kerala District-wise Soil Types
// Source: Kerala Agriculture Department / Kerala Soil Atlas

export interface DistrictSoilData {
  district: string;
  soilTypes: string[];
  primarySoilType: string;
}

export const keralaSoilMapping: Record<string, DistrictSoilData> = {
  "Thiruvananthapuram": {
    district: "Thiruvananthapuram",
    soilTypes: [
      "Fairly rich brown loam of laterite",
      "Sandy loam",
      "Rich dark brown loam (granite origin)"
    ],
    primarySoilType: "Fairly rich brown loam of laterite"
  },
  "Kollam": {
    district: "Kollam",
    soilTypes: [
      "Sandy loam",
      "Laterite soil"
    ],
    primarySoilType: "Sandy loam"
  },
  "Pathanamthitta": {
    district: "Pathanamthitta",
    soilTypes: [
      "Clay soil",
      "Laterite soil"
    ],
    primarySoilType: "Clay soil"
  },
  "Alappuzha": {
    district: "Alappuzha",
    soilTypes: [
      "Sandy loam",
      "Sandy soil",
      "Clay loam with high acidity"
    ],
    primarySoilType: "Sandy loam"
  },
  "Kottayam": {
    district: "Kottayam",
    soilTypes: [
      "Laterite soil",
      "Laterite soil (upper regions)",
      "Alluvial soil"
    ],
    primarySoilType: "Laterite soil"
  },
  "Idukki": {
    district: "Idukki",
    soilTypes: [
      "Laterite soil",
      "Alluvial soil"
    ],
    primarySoilType: "Laterite soil"
  },
  "Ernakulam": {
    district: "Ernakulam",
    soilTypes: [
      "Laterite soil",
      "Sandy loam",
      "Alluvial soil"
    ],
    primarySoilType: "Laterite soil"
  },
  "Thrissur": {
    district: "Thrissur",
    soilTypes: [
      "Sandy loam",
      "Laterite soil",
      "Clayey soil"
    ],
    primarySoilType: "Sandy loam"
  },
  "Palakkad": {
    district: "Palakkad",
    soilTypes: [
      "Alluvial soil",
      "Laterite soil",
      "Black soil"
    ],
    primarySoilType: "Alluvial soil"
  },
  "Malappuram": {
    district: "Malappuram",
    soilTypes: [
      "Laterite soil",
      "Sandy soil"
    ],
    primarySoilType: "Laterite soil"
  },
  "Kozhikode": {
    district: "Kozhikode",
    soilTypes: [
      "Sandy soil",
      "Laterite soil"
    ],
    primarySoilType: "Sandy soil"
  },
  "Wayanad": {
    district: "Wayanad",
    soilTypes: [
      "Sandy soil",
      "Laterite soil",
      "Loamy soil"
    ],
    primarySoilType: "Sandy soil"
  },
  "Kannur": {
    district: "Kannur",
    soilTypes: [
      "Laterite soil",
      "Sandy soil"
    ],
    primarySoilType: "Laterite soil"
  },
  "Kasaragod": {
    district: "Kasaragod",
    soilTypes: [
      "Laterite soil",
      "Sandy soil"
    ],
    primarySoilType: "Laterite soil"
  }
};

// Get soil types for a district
export const getSoilTypesForDistrict = (district: string): string[] => {
  const data = keralaSoilMapping[district];
  return data ? data.soilTypes : [];
};

// Get primary (default) soil type for a district
export const getPrimarySoilType = (district: string): string => {
  const data = keralaSoilMapping[district];
  return data ? data.primarySoilType : "";
};

// Get all unique soil types across Kerala
export const getAllKeralaSoilTypes = (): string[] => {
  const allTypes = new Set<string>();
  Object.values(keralaSoilMapping).forEach(data => {
    data.soilTypes.forEach(type => allTypes.add(type));
  });
  return Array.from(allTypes).sort();
};

// Kerala districts list
export const keralaDistricts = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod"
];
