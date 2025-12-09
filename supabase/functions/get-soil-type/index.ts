import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Soil properties database with NPK/pH values based on soil type
const soilPropertiesDB: Record<string, {
  ph: number | string;
  phRange?: string;
  organicCarbon: number | string;
  nValue?: number;
  pValue?: number;
  kValue?: number;
  nStatus: "Low" | "Medium" | "High";
  pStatus: "Low" | "Medium" | "High";
  kStatus: "Low" | "Medium" | "High";
  texture?: string;
}> = {
  // Kerala soil types
  "Laterite soil": { ph: 5.5, phRange: "5.0-6.0", organicCarbon: 1.2, nValue: 220, pValue: 8, kValue: 95, nStatus: "Low", pStatus: "Low", kStatus: "Low", texture: "Sandy clay loam" },
  "Sandy loam": { ph: 6.2, phRange: "5.8-6.5", organicCarbon: 0.8, nValue: 180, pValue: 12, kValue: 120, nStatus: "Low", pStatus: "Medium", kStatus: "Medium", texture: "Sandy loam" },
  "Sandy soil": { ph: 6.0, phRange: "5.5-6.5", organicCarbon: 0.5, nValue: 150, pValue: 6, kValue: 80, nStatus: "Low", pStatus: "Low", kStatus: "Low", texture: "Sandy" },
  "Clay soil": { ph: 6.8, phRange: "6.5-7.2", organicCarbon: 1.5, nValue: 320, pValue: 18, kValue: 200, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Clay" },
  "Alluvial soil": { ph: 7.0, phRange: "6.5-7.5", organicCarbon: 1.8, nValue: 380, pValue: 22, kValue: 250, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Loamy" },
  "Loamy soil": { ph: 6.5, phRange: "6.0-7.0", organicCarbon: 1.4, nValue: 300, pValue: 16, kValue: 180, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Loam" },
  "Clayey soil": { ph: 7.0, phRange: "6.5-7.5", organicCarbon: 1.6, nValue: 340, pValue: 20, kValue: 220, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Clay" },
  "Fairly rich brown loam of laterite": { ph: 5.8, phRange: "5.5-6.2", organicCarbon: 1.3, nValue: 280, pValue: 14, kValue: 150, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Loamy" },
  "Rich dark brown loam (granite origin)": { ph: 6.0, phRange: "5.5-6.5", organicCarbon: 1.6, nValue: 350, pValue: 18, kValue: 190, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Loamy" },
  "Clay loam with high acidity": { ph: 5.2, phRange: "4.8-5.5", organicCarbon: 1.4, nValue: 260, pValue: 10, kValue: 130, nStatus: "Low", pStatus: "Low", kStatus: "Medium", texture: "Clay loam" },
  "Laterite soil (upper regions)": { ph: 5.3, phRange: "5.0-5.8", organicCarbon: 1.1, nValue: 200, pValue: 7, kValue: 85, nStatus: "Low", pStatus: "Low", kStatus: "Low", texture: "Sandy clay" },
  
  // Other India soil types
  "Black cotton soil": { ph: 7.8, phRange: "7.5-8.5", organicCarbon: 0.6, nValue: 180, pValue: 12, kValue: 320, nStatus: "Low", pStatus: "Medium", kStatus: "High", texture: "Heavy clay" },
  "Medium black soil": { ph: 7.5, phRange: "7.0-8.0", organicCarbon: 0.8, nValue: 220, pValue: 15, kValue: 280, nStatus: "Low", pStatus: "Medium", kStatus: "Medium", texture: "Clay" },
  "Shallow black soil": { ph: 7.3, phRange: "7.0-7.8", organicCarbon: 0.5, nValue: 160, pValue: 10, kValue: 240, nStatus: "Low", pStatus: "Low", kStatus: "Medium", texture: "Clay loam" },
  "Black soil": { ph: 7.6, phRange: "7.2-8.2", organicCarbon: 0.7, nValue: 200, pValue: 14, kValue: 300, nStatus: "Low", pStatus: "Medium", kStatus: "High", texture: "Heavy clay" },
  "Red soil": { ph: 6.2, phRange: "5.5-7.0", organicCarbon: 0.4, nValue: 140, pValue: 8, kValue: 110, nStatus: "Low", pStatus: "Low", kStatus: "Medium", texture: "Sandy loam" },
  "Red loamy soil": { ph: 6.0, phRange: "5.5-6.8", organicCarbon: 0.6, nValue: 180, pValue: 10, kValue: 140, nStatus: "Low", pStatus: "Low", kStatus: "Medium", texture: "Loamy" },
  "Red sandy soil": { ph: 5.8, phRange: "5.2-6.5", organicCarbon: 0.3, nValue: 120, pValue: 5, kValue: 90, nStatus: "Low", pStatus: "Low", kStatus: "Low", texture: "Sandy" },
  "Red and yellow soil": { ph: 5.5, phRange: "5.0-6.2", organicCarbon: 0.5, nValue: 160, pValue: 7, kValue: 100, nStatus: "Low", pStatus: "Low", kStatus: "Low", texture: "Sandy clay loam" },
  "Coastal alluvial soil": { ph: 7.2, phRange: "6.8-7.8", organicCarbon: 1.0, nValue: 280, pValue: 18, kValue: 200, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Silty loam" },
  "Gangetic alluvial soil": { ph: 7.5, phRange: "7.0-8.0", organicCarbon: 0.9, nValue: 300, pValue: 20, kValue: 220, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Silty clay loam" },
  "Deltaic soil": { ph: 7.0, phRange: "6.5-7.5", organicCarbon: 1.2, nValue: 320, pValue: 22, kValue: 240, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Silty clay" },
  "Gangetic alluvium": { ph: 7.4, phRange: "7.0-7.8", organicCarbon: 0.8, nValue: 280, pValue: 18, kValue: 210, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Loamy" },
  "Desert sandy soil": { ph: 8.2, phRange: "7.8-8.8", organicCarbon: 0.2, nValue: 80, pValue: 4, kValue: 150, nStatus: "Low", pStatus: "Low", kStatus: "Medium", texture: "Sandy" },
  "Arid soil": { ph: 8.5, phRange: "8.0-9.0", organicCarbon: 0.15, nValue: 60, pValue: 3, kValue: 180, nStatus: "Low", pStatus: "Low", kStatus: "Medium", texture: "Sandy" },
  "Mountain soil": { ph: 5.5, phRange: "5.0-6.5", organicCarbon: 2.5, nValue: 400, pValue: 12, kValue: 160, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Loamy" },
  "Brown hill soil": { ph: 5.8, phRange: "5.2-6.5", organicCarbon: 2.2, nValue: 380, pValue: 10, kValue: 140, nStatus: "Medium", pStatus: "Low", kStatus: "Medium", texture: "Sandy loam" },
  "Forest soil": { ph: 5.2, phRange: "4.5-6.0", organicCarbon: 3.0, nValue: 450, pValue: 8, kValue: 120, nStatus: "High", pStatus: "Low", kStatus: "Medium", texture: "Loamy" },
  "Terai soil": { ph: 6.5, phRange: "6.0-7.0", organicCarbon: 1.8, nValue: 350, pValue: 16, kValue: 180, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Silty loam" },
  "Piedmont soil": { ph: 6.8, phRange: "6.2-7.2", organicCarbon: 1.4, nValue: 300, pValue: 14, kValue: 160, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Loamy" },
  "Calcareous soil": { ph: 8.0, phRange: "7.5-8.5", organicCarbon: 0.6, nValue: 180, pValue: 8, kValue: 200, nStatus: "Low", pStatus: "Low", kStatus: "Medium", texture: "Clay loam" },
  "Clay loam": { ph: 6.8, phRange: "6.5-7.2", organicCarbon: 1.3, nValue: 300, pValue: 16, kValue: 200, nStatus: "Medium", pStatus: "Medium", kStatus: "Medium", texture: "Clay loam" },
};

// Default soil properties for unknown soil types
const defaultSoilProperties = {
  ph: 6.5,
  phRange: "6.0-7.0",
  organicCarbon: 1.0,
  nStatus: "Medium" as const,
  pStatus: "Medium" as const,
  kStatus: "Medium" as const,
  texture: "Loamy"
};

// India-wide soil GeoJSON data (embedded for edge function)
const indiaSoilGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Thiruvananthapuram", "soil_type": "Laterite soil", "soil_types": ["Fairly rich brown loam of laterite", "Sandy loam", "Rich dark brown loam (granite origin)"] }, "geometry": { "type": "Polygon", "coordinates": [[[76.65, 8.17], [77.17, 8.17], [77.17, 8.89], [76.65, 8.89], [76.65, 8.17]]] } },
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Kollam", "soil_type": "Sandy loam", "soil_types": ["Sandy loam", "Laterite soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[76.48, 8.76], [77.16, 8.76], [77.16, 9.26], [76.48, 9.26], [76.48, 8.76]]] } },
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Pathanamthitta", "soil_type": "Clay soil", "soil_types": ["Clay soil", "Laterite soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[76.69, 9.11], [77.28, 9.11], [77.28, 9.56], [76.69, 9.56], [76.69, 9.11]]] } },
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Alappuzha", "soil_type": "Sandy loam", "soil_types": ["Sandy loam", "Sandy soil", "Clay loam with high acidity"] }, "geometry": { "type": "Polygon", "coordinates": [[[76.26, 9.10], [76.78, 9.10], [76.78, 9.73], [76.26, 9.73], [76.26, 9.10]]] } },
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Kottayam", "soil_type": "Laterite soil", "soil_types": ["Laterite soil", "Laterite soil (upper regions)", "Alluvial soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[76.37, 9.40], [77.01, 9.40], [77.01, 9.94], [76.37, 9.94], [76.37, 9.40]]] } },
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Idukki", "soil_type": "Laterite soil", "soil_types": ["Laterite soil", "Alluvial soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[76.77, 9.58], [77.45, 9.58], [77.45, 10.21], [76.77, 10.21], [76.77, 9.58]]] } },
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Ernakulam", "soil_type": "Laterite soil", "soil_types": ["Laterite soil", "Sandy loam", "Alluvial soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[76.18, 9.82], [76.78, 9.82], [76.78, 10.31], [76.18, 10.31], [76.18, 9.82]]] } },
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Thrissur", "soil_type": "Sandy loam", "soil_types": ["Sandy loam", "Laterite soil", "Clayey soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[75.92, 10.14], [76.59, 10.14], [76.59, 10.68], [75.92, 10.68], [75.92, 10.14]]] } },
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Palakkad", "soil_type": "Alluvial soil", "soil_types": ["Alluvial soil", "Laterite soil", "Black soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[76.07, 10.44], [76.93, 10.44], [76.93, 11.14], [76.07, 11.14], [76.07, 10.44]]] } },
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Malappuram", "soil_type": "Laterite soil", "soil_types": ["Laterite soil", "Sandy soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[75.83, 10.73], [76.58, 10.73], [76.58, 11.28], [75.83, 11.28], [75.83, 10.73]]] } },
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Kozhikode", "soil_type": "Sandy soil", "soil_types": ["Sandy soil", "Laterite soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[75.77, 11.08], [76.19, 11.08], [76.19, 11.60], [75.77, 11.60], [75.77, 11.08]]] } },
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Wayanad", "soil_type": "Sandy soil", "soil_types": ["Sandy soil", "Laterite soil", "Loamy soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[75.78, 11.44], [76.45, 11.44], [76.45, 12.01], [75.78, 12.01], [75.78, 11.44]]] } },
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Kannur", "soil_type": "Laterite soil", "soil_types": ["Laterite soil", "Sandy soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[75.28, 11.56], [76.01, 11.56], [76.01, 12.21], [75.28, 12.21], [75.28, 11.56]]] } },
    { "type": "Feature", "properties": { "state": "Kerala", "district": "Kasaragod", "soil_type": "Laterite soil", "soil_types": ["Laterite soil", "Sandy soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[74.86, 12.03], [75.56, 12.03], [75.56, 12.78], [74.86, 12.78], [74.86, 12.03]]] } },
    { "type": "Feature", "properties": { "state": "Maharashtra", "district": "Nagpur", "soil_type": "Black cotton soil", "soil_types": ["Black cotton soil", "Medium black soil", "Red sandy soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[78.5, 20.5], [79.8, 20.5], [79.8, 21.6], [78.5, 21.6], [78.5, 20.5]]] } },
    { "type": "Feature", "properties": { "state": "Maharashtra", "district": "Pune", "soil_type": "Black cotton soil", "soil_types": ["Black cotton soil", "Laterite soil", "Red soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[73.5, 18.0], [74.5, 18.0], [74.5, 19.0], [73.5, 19.0], [73.5, 18.0]]] } },
    { "type": "Feature", "properties": { "state": "Maharashtra", "district": "Mumbai", "soil_type": "Coastal alluvial soil", "soil_types": ["Coastal alluvial soil", "Laterite soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[72.7, 18.8], [73.1, 18.8], [73.1, 19.4], [72.7, 19.4], [72.7, 18.8]]] } },
    { "type": "Feature", "properties": { "state": "Maharashtra", "district": "Nashik", "soil_type": "Black soil", "soil_types": ["Black soil", "Red soil", "Laterite soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[73.3, 19.5], [74.5, 19.5], [74.5, 20.5], [73.3, 20.5], [73.3, 19.5]]] } },
    { "type": "Feature", "properties": { "state": "Maharashtra", "district": "Aurangabad", "soil_type": "Medium black soil", "soil_types": ["Medium black soil", "Shallow black soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[74.5, 19.5], [76.0, 19.5], [76.0, 20.5], [74.5, 20.5], [74.5, 19.5]]] } },
    { "type": "Feature", "properties": { "state": "Maharashtra", "district": "Kolhapur", "soil_type": "Laterite soil", "soil_types": ["Laterite soil", "Black soil", "Red soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[73.8, 16.4], [74.5, 16.4], [74.5, 17.0], [73.8, 17.0], [73.8, 16.4]]] } },
    { "type": "Feature", "properties": { "state": "Karnataka", "district": "Bangalore Urban", "soil_type": "Red loamy soil", "soil_types": ["Red loamy soil", "Laterite soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[77.4, 12.8], [77.8, 12.8], [77.8, 13.2], [77.4, 13.2], [77.4, 12.8]]] } },
    { "type": "Feature", "properties": { "state": "Karnataka", "district": "Mysore", "soil_type": "Red soil", "soil_types": ["Red soil", "Black soil", "Laterite soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[76.0, 11.8], [77.2, 11.8], [77.2, 12.6], [76.0, 12.6], [76.0, 11.8]]] } },
    { "type": "Feature", "properties": { "state": "Karnataka", "district": "Belgaum", "soil_type": "Black cotton soil", "soil_types": ["Black cotton soil", "Red soil", "Laterite soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[74.2, 15.5], [75.5, 15.5], [75.5, 16.5], [74.2, 16.5], [74.2, 15.5]]] } },
    { "type": "Feature", "properties": { "state": "Tamil Nadu", "district": "Chennai", "soil_type": "Coastal alluvial soil", "soil_types": ["Coastal alluvial soil", "Red sandy soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[80.0, 12.8], [80.4, 12.8], [80.4, 13.3], [80.0, 13.3], [80.0, 12.8]]] } },
    { "type": "Feature", "properties": { "state": "Tamil Nadu", "district": "Coimbatore", "soil_type": "Red loamy soil", "soil_types": ["Red loamy soil", "Black soil", "Alluvial soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[76.5, 10.8], [77.5, 10.8], [77.5, 11.5], [76.5, 11.5], [76.5, 10.8]]] } },
    { "type": "Feature", "properties": { "state": "Tamil Nadu", "district": "Madurai", "soil_type": "Red soil", "soil_types": ["Red soil", "Black soil", "Alluvial soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[77.5, 9.5], [78.5, 9.5], [78.5, 10.3], [77.5, 10.3], [77.5, 9.5]]] } },
    { "type": "Feature", "properties": { "state": "Andhra Pradesh", "district": "Visakhapatnam", "soil_type": "Red sandy soil", "soil_types": ["Red sandy soil", "Laterite soil", "Alluvial soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[82.5, 17.2], [83.5, 17.2], [83.5, 18.2], [82.5, 18.2], [82.5, 17.2]]] } },
    { "type": "Feature", "properties": { "state": "Andhra Pradesh", "district": "Vijayawada", "soil_type": "Alluvial soil", "soil_types": ["Alluvial soil", "Black cotton soil", "Red soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[80.3, 16.2], [81.0, 16.2], [81.0, 16.8], [80.3, 16.8], [80.3, 16.2]]] } },
    { "type": "Feature", "properties": { "state": "Telangana", "district": "Hyderabad", "soil_type": "Red sandy soil", "soil_types": ["Red sandy soil", "Black cotton soil", "Laterite soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[78.2, 17.2], [78.7, 17.2], [78.7, 17.6], [78.2, 17.6], [78.2, 17.2]]] } },
    { "type": "Feature", "properties": { "state": "Telangana", "district": "Warangal", "soil_type": "Black cotton soil", "soil_types": ["Black cotton soil", "Red soil", "Sandy loam"] }, "geometry": { "type": "Polygon", "coordinates": [[[79.0, 17.5], [80.0, 17.5], [80.0, 18.5], [79.0, 18.5], [79.0, 17.5]]] } },
    { "type": "Feature", "properties": { "state": "Gujarat", "district": "Ahmedabad", "soil_type": "Alluvial soil", "soil_types": ["Alluvial soil", "Black soil", "Sandy soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[72.0, 22.5], [73.0, 22.5], [73.0, 23.5], [72.0, 23.5], [72.0, 22.5]]] } },
    { "type": "Feature", "properties": { "state": "Gujarat", "district": "Surat", "soil_type": "Black cotton soil", "soil_types": ["Black cotton soil", "Coastal alluvial soil", "Laterite soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[72.5, 20.8], [73.5, 20.8], [73.5, 21.5], [72.5, 21.5], [72.5, 20.8]]] } },
    { "type": "Feature", "properties": { "state": "Rajasthan", "district": "Jaipur", "soil_type": "Desert sandy soil", "soil_types": ["Desert sandy soil", "Alluvial soil", "Red soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[75.5, 26.5], [76.5, 26.5], [76.5, 27.5], [75.5, 27.5], [75.5, 26.5]]] } },
    { "type": "Feature", "properties": { "state": "Rajasthan", "district": "Jodhpur", "soil_type": "Desert sandy soil", "soil_types": ["Desert sandy soil", "Arid soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[72.5, 26.0], [73.5, 26.0], [73.5, 27.0], [72.5, 27.0], [72.5, 26.0]]] } },
    { "type": "Feature", "properties": { "state": "Madhya Pradesh", "district": "Bhopal", "soil_type": "Black cotton soil", "soil_types": ["Black cotton soil", "Alluvial soil", "Red soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[77.0, 23.0], [78.0, 23.0], [78.0, 23.8], [77.0, 23.8], [77.0, 23.0]]] } },
    { "type": "Feature", "properties": { "state": "Madhya Pradesh", "district": "Indore", "soil_type": "Black cotton soil", "soil_types": ["Black cotton soil", "Medium black soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[75.5, 22.5], [76.5, 22.5], [76.5, 23.3], [75.5, 23.3], [75.5, 22.5]]] } },
    { "type": "Feature", "properties": { "state": "Uttar Pradesh", "district": "Lucknow", "soil_type": "Alluvial soil", "soil_types": ["Alluvial soil", "Gangetic alluvium"] }, "geometry": { "type": "Polygon", "coordinates": [[[80.5, 26.5], [81.5, 26.5], [81.5, 27.2], [80.5, 27.2], [80.5, 26.5]]] } },
    { "type": "Feature", "properties": { "state": "Uttar Pradesh", "district": "Varanasi", "soil_type": "Gangetic alluvial soil", "soil_types": ["Gangetic alluvial soil", "Alluvial soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[82.5, 25.0], [83.5, 25.0], [83.5, 25.8], [82.5, 25.8], [82.5, 25.0]]] } },
    { "type": "Feature", "properties": { "state": "Uttar Pradesh", "district": "Agra", "soil_type": "Alluvial soil", "soil_types": ["Alluvial soil", "Sandy loam"] }, "geometry": { "type": "Polygon", "coordinates": [[[77.5, 26.8], [78.5, 26.8], [78.5, 27.5], [77.5, 27.5], [77.5, 26.8]]] } },
    { "type": "Feature", "properties": { "state": "Bihar", "district": "Patna", "soil_type": "Gangetic alluvial soil", "soil_types": ["Gangetic alluvial soil", "Calcareous soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[84.5, 25.2], [85.5, 25.2], [85.5, 26.0], [84.5, 26.0], [84.5, 25.2]]] } },
    { "type": "Feature", "properties": { "state": "Bihar", "district": "Gaya", "soil_type": "Red and yellow soil", "soil_types": ["Red and yellow soil", "Alluvial soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[84.5, 24.5], [85.5, 24.5], [85.5, 25.2], [84.5, 25.2], [84.5, 24.5]]] } },
    { "type": "Feature", "properties": { "state": "West Bengal", "district": "Kolkata", "soil_type": "Gangetic alluvial soil", "soil_types": ["Gangetic alluvial soil", "Coastal alluvial soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[88.2, 22.3], [88.6, 22.3], [88.6, 22.7], [88.2, 22.7], [88.2, 22.3]]] } },
    { "type": "Feature", "properties": { "state": "West Bengal", "district": "Darjeeling", "soil_type": "Mountain soil", "soil_types": ["Mountain soil", "Forest soil", "Terai soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[88.0, 26.5], [88.8, 26.5], [88.8, 27.2], [88.0, 27.2], [88.0, 26.5]]] } },
    { "type": "Feature", "properties": { "state": "Odisha", "district": "Bhubaneswar", "soil_type": "Red and yellow soil", "soil_types": ["Red and yellow soil", "Laterite soil", "Alluvial soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[85.5, 20.0], [86.0, 20.0], [86.0, 20.5], [85.5, 20.5], [85.5, 20.0]]] } },
    { "type": "Feature", "properties": { "state": "Odisha", "district": "Cuttack", "soil_type": "Alluvial soil", "soil_types": ["Alluvial soil", "Deltaic soil", "Laterite soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[85.5, 20.3], [86.2, 20.3], [86.2, 20.8], [85.5, 20.8], [85.5, 20.3]]] } },
    { "type": "Feature", "properties": { "state": "Punjab", "district": "Ludhiana", "soil_type": "Alluvial soil", "soil_types": ["Alluvial soil", "Sandy loam", "Clay loam"] }, "geometry": { "type": "Polygon", "coordinates": [[[75.5, 30.5], [76.2, 30.5], [76.2, 31.2], [75.5, 31.2], [75.5, 30.5]]] } },
    { "type": "Feature", "properties": { "state": "Punjab", "district": "Amritsar", "soil_type": "Alluvial soil", "soil_types": ["Alluvial soil", "Loamy soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[74.5, 31.3], [75.2, 31.3], [75.2, 32.0], [74.5, 32.0], [74.5, 31.3]]] } },
    { "type": "Feature", "properties": { "state": "Haryana", "district": "Chandigarh", "soil_type": "Alluvial soil", "soil_types": ["Alluvial soil", "Piedmont soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[76.6, 30.6], [77.0, 30.6], [77.0, 30.9], [76.6, 30.9], [76.6, 30.6]]] } },
    { "type": "Feature", "properties": { "state": "Haryana", "district": "Hisar", "soil_type": "Sandy loam", "soil_types": ["Sandy loam", "Alluvial soil", "Desert soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[75.5, 29.0], [76.5, 29.0], [76.5, 29.8], [75.5, 29.8], [75.5, 29.0]]] } },
    { "type": "Feature", "properties": { "state": "Jharkhand", "district": "Ranchi", "soil_type": "Red and yellow soil", "soil_types": ["Red and yellow soil", "Laterite soil", "Forest soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[85.0, 23.0], [86.0, 23.0], [86.0, 23.8], [85.0, 23.8], [85.0, 23.0]]] } },
    { "type": "Feature", "properties": { "state": "Chhattisgarh", "district": "Raipur", "soil_type": "Red and yellow soil", "soil_types": ["Red and yellow soil", "Laterite soil", "Black soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[81.5, 21.0], [82.5, 21.0], [82.5, 21.8], [81.5, 21.8], [81.5, 21.0]]] } },
    { "type": "Feature", "properties": { "state": "Assam", "district": "Guwahati", "soil_type": "Alluvial soil", "soil_types": ["Alluvial soil", "Red and yellow soil", "Laterite soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[91.5, 26.0], [92.0, 26.0], [92.0, 26.5], [91.5, 26.5], [91.5, 26.0]]] } },
    { "type": "Feature", "properties": { "state": "Himachal Pradesh", "district": "Shimla", "soil_type": "Mountain soil", "soil_types": ["Mountain soil", "Brown hill soil", "Forest soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[77.0, 31.0], [77.5, 31.0], [77.5, 31.5], [77.0, 31.5], [77.0, 31.0]]] } },
    { "type": "Feature", "properties": { "state": "Uttarakhand", "district": "Dehradun", "soil_type": "Mountain soil", "soil_types": ["Mountain soil", "Alluvial soil", "Forest soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[77.8, 30.0], [78.5, 30.0], [78.5, 30.8], [77.8, 30.8], [77.8, 30.0]]] } },
    { "type": "Feature", "properties": { "state": "Goa", "district": "North Goa", "soil_type": "Laterite soil", "soil_types": ["Laterite soil", "Coastal alluvial soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[73.7, 15.3], [74.0, 15.3], [74.0, 15.8], [73.7, 15.8], [73.7, 15.3]]] } },
    { "type": "Feature", "properties": { "state": "Goa", "district": "South Goa", "soil_type": "Laterite soil", "soil_types": ["Laterite soil", "Sandy soil", "Alluvial soil"] }, "geometry": { "type": "Polygon", "coordinates": [[[73.8, 15.0], [74.2, 15.0], [74.2, 15.4], [73.8, 15.4], [73.8, 15.0]]] } }
  ]
};

// Point-in-polygon using ray casting algorithm
function isPointInPolygon(lat: number, lng: number, polygon: number[][]): boolean {
  let inside = false;
  const n = polygon.length;
  
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    
    if ((yi > lat) !== (yj > lat) &&
        lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  
  return inside;
}

// Get soil properties from database
function getSoilProperties(soilType: string) {
  return soilPropertiesDB[soilType] || defaultSoilProperties;
}

// Find soil type and properties using polygon-based lookup
function findSoilData(lat: number, lng: number): {
  success: boolean;
  state?: string;
  district?: string;
  soilType?: string;
  soilTypes?: string[];
  texture?: string;
  ph?: number | string;
  phRange?: string;
  organicCarbon?: number | string;
  nValue?: number;
  pValue?: number;
  kValue?: number;
  nStatus?: "Low" | "Medium" | "High";
  pStatus?: "Low" | "Medium" | "High";
  kStatus?: "Low" | "Medium" | "High";
  confidence?: string;
  latitude?: number;
  longitude?: number;
} | null {
  console.log(`Searching for soil data at lat=${lat}, lng=${lng}`);
  
  // Check India bounds (approximate)
  if (lat < 6.0 || lat > 37.0 || lng < 68.0 || lng > 97.5) {
    console.log(`Coordinates outside India: lat=${lat}, lng=${lng}`);
    return null;
  }

  // Search through all features for point-in-polygon match
  for (const feature of indiaSoilGeoJSON.features) {
    const polygon = feature.geometry.coordinates[0];
    if (isPointInPolygon(lat, lng, polygon)) {
      console.log(`Found match in ${feature.properties.state}, ${feature.properties.district}`);
      
      const soilProps = getSoilProperties(feature.properties.soil_type);
      
      return {
        success: true,
        state: feature.properties.state,
        district: feature.properties.district,
        soilType: feature.properties.soil_type,
        soilTypes: feature.properties.soil_types,
        texture: soilProps.texture,
        ph: soilProps.ph,
        phRange: soilProps.phRange,
        organicCarbon: soilProps.organicCarbon,
        nValue: soilProps.nValue,
        pValue: soilProps.pValue,
        kValue: soilProps.kValue,
        nStatus: soilProps.nStatus,
        pStatus: soilProps.pStatus,
        kStatus: soilProps.kStatus,
        confidence: "High",
        latitude: lat,
        longitude: lng
      };
    }
  }

  // If no exact match, find nearest district
  let nearestFeature = null;
  let minDistance = Infinity;

  for (const feature of indiaSoilGeoJSON.features) {
    const polygon = feature.geometry.coordinates[0];
    let centerLng = 0, centerLat = 0;
    for (const coord of polygon) {
      centerLng += coord[0];
      centerLat += coord[1];
    }
    centerLng /= polygon.length;
    centerLat /= polygon.length;
    
    const distance = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2));
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestFeature = feature;
    }
  }

  // Return nearest if within reasonable distance (0.5 degrees ~ 55km)
  if (nearestFeature && minDistance < 0.5) {
    console.log(`Using nearest district: ${nearestFeature.properties.district} (distance: ${minDistance.toFixed(3)})`);
    
    const soilProps = getSoilProperties(nearestFeature.properties.soil_type);
    
    return {
      success: true,
      state: nearestFeature.properties.state,
      district: nearestFeature.properties.district,
      soilType: nearestFeature.properties.soil_type,
      soilTypes: nearestFeature.properties.soil_types,
      texture: soilProps.texture,
      ph: soilProps.ph,
      phRange: soilProps.phRange,
      organicCarbon: soilProps.organicCarbon,
      nValue: soilProps.nValue,
      pValue: soilProps.pValue,
      kValue: soilProps.kValue,
      nStatus: soilProps.nStatus,
      pStatus: soilProps.pStatus,
      kStatus: soilProps.kStatus,
      confidence: "Medium",
      latitude: lat,
      longitude: lng
    };
  }

  console.log(`No match found within range for lat=${lat}, lng=${lng}`);
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

    const result = findSoilData(latitude, longitude);

    if (!result) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Location not covered in soil database",
          message: "Soil type not found for this location. Please recheck location accuracy."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(result),
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
