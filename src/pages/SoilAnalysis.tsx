import { useState } from "react";
import { FlaskConical, Leaf, Save, Sprout, ArrowLeft, Info, MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SuitableCropsModal } from "@/components/soil/SuitableCropsModal";
import { Badge } from "@/components/ui/badge";

interface SoilResult {
  success: boolean;
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
  district?: string;
  state?: string;
  error?: string;
  message?: string;
}

interface SuitableCrop {
  name: string;
  nameMl: string;
  icon: string;
  reason: string;
  reasonMl: string;
}

const translations = {
  pageTitle: { en: "Soil Analysis", ml: "മണ്ണ് പരിശോധന" },
  subtitle: { en: "GIS-Based Soil Intelligence", ml: "GIS അടിസ്ഥാനമാക്കിയ മണ്ണ് വിവരങ്ങൾ" },
  useMyLocation: { en: "Use My Location", ml: "എൻ്റെ ലൊക്കേഷൻ ഉപയോഗിക്കുക" },
  orEnterCoordinates: { en: "Or Enter Coordinates", ml: "അല്ലെങ്കിൽ കോർഡിനേറ്റുകൾ നൽകുക" },
  latitude: { en: "Latitude", ml: "അക്ഷാംശം" },
  longitude: { en: "Longitude", ml: "രേഖാംശം" },
  analyzeSoil: { en: "Analyze Soil", ml: "മണ്ണ് വിശകലനം ചെയ്യുക" },
  analyzing: { en: "Analyzing...", ml: "വിശകലനം ചെയ്യുന്നു..." },
  detectingLocation: { en: "Detecting Location...", ml: "ലൊക്കേഷൻ കണ്ടെത്തുന്നു..." },
  soilTestReport: { en: "Soil Analysis Report", ml: "മണ്ണ് വിശകലന റിപ്പോർട്ട്" },
  saveReport: { en: "Save Report", ml: "റിപ്പോർട്ട് സേവ് ചെയ്യുക" },
  viewCrops: { en: "View Suitable Crops", ml: "അനുയോജ്യമായ വിളകൾ കാണുക" },
  saving: { en: "Saving...", ml: "സേവ് ചെയ്യുന്നു..." },
  reportSaved: { en: "Report saved successfully!", ml: "റിപ്പോർട്ട് വിജയകരമായി സേവ് ചെയ്തു!" },
  soilType: { en: "Soil Type", ml: "മണ്ണിൻ്റെ തരം" },
  texture: { en: "Texture", ml: "ടെക്സ്ചർ" },
  phLevel: { en: "pH Level", ml: "pH ലെവൽ" },
  organicCarbon: { en: "Organic Carbon", ml: "ഓർഗാനിക് കാർബൺ" },
  nitrogen: { en: "Nitrogen (N)", ml: "നൈട്രജൻ (N)" },
  phosphorus: { en: "Phosphorus (P)", ml: "ഫോസ്ഫറസ് (P)" },
  potassium: { en: "Potassium (K)", ml: "പൊട്ടാസ്യം (K)" },
  location: { en: "Location", ml: "സ്ഥലം" },
  confidence: { en: "Confidence", ml: "വിശ്വാസ്യത" },
  low: { en: "Low", ml: "കുറവ്" },
  medium: { en: "Medium", ml: "ഇടത്തരം" },
  high: { en: "High", ml: "ഉയർന്നത്" },
  kgHa: { en: "kg/ha", ml: "കി.ഗ്രാം/ഹെ" },
  cultivationTips: { en: "Cultivation Tips", ml: "കൃഷി നുറുങ്ങുകൾ" },
};

// Kerala-specific suitable crops based on soil type
const getSuitableCropsForSoil = (soilType: string): SuitableCrop[] => {
  const cropDatabase: Record<string, SuitableCrop[]> = {
    "Laterite soil": [
      { name: "Coconut", nameMl: "തെങ്ങ്", icon: "🥥", reason: "Thrives in acidic laterite soil", reasonMl: "അസിഡിക് ലാറ്ററൈറ്റ് മണ്ണിൽ നന്നായി വളരുന്നു" },
      { name: "Cashew", nameMl: "കശുമാവ്", icon: "🥜", reason: "Well-suited for laterite terrain", reasonMl: "ലാറ്ററൈറ്റ് ഭൂപ്രദേശത്തിന് അനുയോജ്യം" },
      { name: "Rubber", nameMl: "റബ്ബർ", icon: "🌳", reason: "Excellent for laterite soil with good drainage", reasonMl: "നല്ല ഡ്രെയിനേജുള്ള ലാറ്ററൈറ്റ് മണ്ണിന് മികച്ചത്" },
      { name: "Pepper", nameMl: "കുരുമുളക്", icon: "🌶️", reason: "Grows well in shaded laterite areas", reasonMl: "തണലുള്ള ലാറ്ററൈറ്റ് പ്രദേശങ്ങളിൽ നന്നായി വളരുന്നു" },
    ],
    "Sandy loam": [
      { name: "Banana", nameMl: "വാഴ", icon: "🍌", reason: "Excellent drainage for bananas", reasonMl: "വാഴയ്ക്ക് മികച്ച ഡ്രെയിനേജ്" },
      { name: "Tapioca", nameMl: "മരച്ചീനി", icon: "🥔", reason: "Easy root penetration", reasonMl: "എളുപ്പത്തിൽ വേര് ഇറങ്ങും" },
      { name: "Vegetables", nameMl: "പച്ചക്കറികൾ", icon: "🥬", reason: "Good for short-duration vegetables", reasonMl: "ഹ്രസ്വകാല പച്ചക്കറികൾക്ക് നല്ലത്" },
      { name: "Groundnut", nameMl: "നിലക്കടല", icon: "🥜", reason: "Ideal sandy loam conditions", reasonMl: "അനുയോജ്യമായ മണൽ ലോം അവസ്ഥ" },
    ],
    "Clay soil": [
      { name: "Paddy", nameMl: "നെല്ല്", icon: "🌾", reason: "Water retention is ideal for paddy", reasonMl: "വെള്ളം നിലനിർത്തൽ നെല്ലിന് അനുയോജ്യം" },
      { name: "Coconut", nameMl: "തെങ്ങ്", icon: "🥥", reason: "Grows well with proper drainage", reasonMl: "ശരിയായ ഡ്രെയിനേജോടെ നന്നായി വളരുന്നു" },
      { name: "Arecanut", nameMl: "അടക്ക", icon: "🌴", reason: "Suitable for clay with moisture", reasonMl: "ഈർപ്പമുള്ള കളിമണ്ണിന് അനുയോജ്യം" },
    ],
    "Alluvial soil": [
      { name: "Paddy", nameMl: "നെല്ല്", icon: "🌾", reason: "Highly fertile alluvial plains", reasonMl: "അത്യധികം ഫലഭൂയിഷ്ഠമായ എക്കൽ സമതലങ്ങൾ" },
      { name: "Banana", nameMl: "വാഴ", icon: "🍌", reason: "Rich nutrients support bananas", reasonMl: "സമ്പന്നമായ പോഷകങ്ങൾ വാഴയെ പിന്തുണയ്ക്കുന്നു" },
      { name: "Vegetables", nameMl: "പച്ചക്കറികൾ", icon: "🥬", reason: "Excellent for all vegetables", reasonMl: "എല്ലാ പച്ചക്കറികൾക്കും മികച്ചത്" },
      { name: "Sugarcane", nameMl: "കരിമ്പ്", icon: "🎋", reason: "Thrives in alluvial conditions", reasonMl: "എക്കൽ അവസ്ഥകളിൽ തഴച്ചുവളരുന്നു" },
    ],
    "Sandy soil": [
      { name: "Cashew", nameMl: "കശുമാവ്", icon: "🥜", reason: "Drought tolerant in sandy areas", reasonMl: "മണൽ പ്രദേശങ്ങളിൽ വരൾച്ച സഹിഷ്ണുത" },
      { name: "Coconut", nameMl: "തെങ്ങ്", icon: "🥥", reason: "Good root development", reasonMl: "നല്ല വേര് വികസനം" },
      { name: "Groundnut", nameMl: "നിലക്കടല", icon: "🥜", reason: "Prefers sandy conditions", reasonMl: "മണൽ അവസ്ഥകൾ ഇഷ്ടപ്പെടുന്നു" },
    ],
    "Black cotton soil": [
      { name: "Cotton", nameMl: "പരുത്തി", icon: "☁️", reason: "Named after its suitability for cotton", reasonMl: "കോട്ടണിന് അനുയോജ്യത കാരണം പേര്" },
      { name: "Sorghum", nameMl: "ജോവർ", icon: "🌾", reason: "Drought resistant in black soil", reasonMl: "കറുത്ത മണ്ണിൽ വരൾച്ച പ്രതിരോധം" },
      { name: "Wheat", nameMl: "ഗോതമ്പ്", icon: "🌾", reason: "Good moisture retention", reasonMl: "നല്ല ഈർപ്പം നിലനിർത്തൽ" },
    ],
    "Red soil": [
      { name: "Millets", nameMl: "തിന", icon: "🌾", reason: "Thrives in red soil conditions", reasonMl: "ചുവന്ന മണ്ണിൽ തഴച്ചുവളരുന്നു" },
      { name: "Groundnut", nameMl: "നിലക്കടല", icon: "🥜", reason: "Well adapted to red soil", reasonMl: "ചുവന്ന മണ്ണിന് നന്നായി പൊരുത്തപ്പെടുന്നു" },
      { name: "Pulses", nameMl: "പയർ വർഗ്ഗങ്ങൾ", icon: "🫘", reason: "Suitable for pulse cultivation", reasonMl: "പയർ കൃഷിക്ക് അനുയോജ്യം" },
    ],
  };

  // Default crops if soil type not in database
  const defaultCrops: SuitableCrop[] = [
    { name: "Coconut", nameMl: "തെങ്ങ്", icon: "🥥", reason: "Versatile crop for most soils", reasonMl: "മിക്ക മണ്ണിനും അനുയോജ്യമായ വിള" },
    { name: "Banana", nameMl: "വാഴ", icon: "🍌", reason: "Grows in various conditions", reasonMl: "വിവിധ സാഹചര്യങ്ങളിൽ വളരുന്നു" },
    { name: "Vegetables", nameMl: "പച്ചക്കറികൾ", icon: "🥬", reason: "Can be adapted to soil", reasonMl: "മണ്ണുമായി പൊരുത്തപ്പെടാം" },
  ];

  return cropDatabase[soilType] || defaultCrops;
};

// Get cultivation tips based on soil properties
const getCultivationTips = (result: SoilResult, language: string): string[] => {
  const tips: string[] = [];
  
  if (result.nStatus === "Low") {
    tips.push(language === "ml" 
      ? "നൈട്രജൻ കുറവാണ്: യൂറിയ അല്ലെങ്കിൽ ജൈവ വളങ്ങൾ ചേർക്കുക"
      : "Nitrogen is low: Add urea or organic manure");
  }
  if (result.pStatus === "Low") {
    tips.push(language === "ml"
      ? "ഫോസ്ഫറസ് കുറവാണ്: DAP അല്ലെങ്കിൽ SSP ചേർക്കുക"
      : "Phosphorus is low: Add DAP or SSP");
  }
  if (result.kStatus === "Low") {
    tips.push(language === "ml"
      ? "പൊട്ടാസ്യം കുറവാണ്: MOP അല്ലെങ്കിൽ ചാരം ചേർക്കുക"
      : "Potassium is low: Add MOP or wood ash");
  }
  
  const ph = typeof result.ph === "number" ? result.ph : parseFloat(result.ph as string);
  if (ph < 6.0) {
    tips.push(language === "ml"
      ? "മണ്ണ് അസിഡിക് ആണ്: നാരങ്ങ ചേർത്ത് pH ക്രമീകരിക്കുക"
      : "Soil is acidic: Add lime to adjust pH");
  } else if (ph > 7.5) {
    tips.push(language === "ml"
      ? "മണ്ണ് ആൽക്കലൈൻ ആണ്: ജിപ്സം അല്ലെങ്കിൽ സൾഫർ ചേർക്കുക"
      : "Soil is alkaline: Add gypsum or sulfur");
  }

  if (tips.length === 0) {
    tips.push(language === "ml"
      ? "മണ്ണ് നല്ല അവസ്ഥയിലാണ്. പതിവ് കൃഷി രീതികൾ തുടരുക"
      : "Soil is in good condition. Continue regular farming practices");
  }

  return tips;
};

export default function SoilAnalysis() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SoilResult | null>(null);
  const [showCropsModal, setShowCropsModal] = useState(false);

  const t = (key: keyof typeof translations) => {
    return translations[key][language === 'ml' ? 'ml' : 'en'];
  };

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: language === 'ml' ? "ലൊക്കേഷൻ ലഭ്യമല്ല" : "Location not available",
        description: language === 'ml' ? "നിങ്ങളുടെ ബ്രൗസർ ലൊക്കേഷൻ പിന്തുണയ്ക്കുന്നില്ല" : "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return;
    }

    setDetectingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        
        // Auto-analyze after getting location
        await analyzeSoil(lat, lng);
        setDetectingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setDetectingLocation(false);
        toast({
          title: language === 'ml' ? "ലൊക്കേഷൻ പിശക്" : "Location Error",
          description: language === 'ml' ? "ലൊക്കേഷൻ കണ്ടെത്താനായില്ല. ദയവായി കോർഡിനേറ്റുകൾ നേരിട്ട് നൽകുക" : "Could not detect location. Please enter coordinates manually",
          variant: "destructive"
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const analyzeSoil = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-soil-type', {
        body: { latitude: lat, longitude: lng }
      });

      if (error) throw error;

      if (!data.success) {
        toast({
          title: language === 'ml' ? "സോയിൽ ഡാറ്റ ലഭ്യമല്ല" : "Soil Data Not Found",
          description: data.message || (language === 'ml' ? "ഈ ലൊക്കേഷനായി സോയിൽ ഡാറ്റ കണ്ടെത്താനായില്ല" : "Could not find soil data for this location"),
          variant: "destructive"
        });
        return;
      }

      setResult(data);
      toast({
        title: language === 'ml' ? "വിശകലനം പൂർത്തിയായി" : "Analysis Complete",
        description: language === 'ml' ? "മണ്ണ് വിവരങ്ങൾ വിജയകരമായി കണ്ടെത്തി" : "Soil data successfully retrieved"
      });
    } catch (error: any) {
      console.error('Error analyzing soil:', error);
      toast({
        title: language === 'ml' ? "വിശകലന പിശക്" : "Analysis Error",
        description: error.message || (language === 'ml' ? "മണ്ണ് വിശകലനം പരാജയപ്പെട്ടു" : "Failed to analyze soil"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!latitude || !longitude) {
      toast({
        title: language === 'ml' ? "കോർഡിനേറ്റുകൾ ആവശ്യമാണ്" : "Coordinates Required",
        description: language === 'ml' ? "അക്ഷാംശവും രേഖാംശവും നൽകുക" : "Please enter latitude and longitude",
        variant: "destructive"
      });
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: language === 'ml' ? "അസാധുവായ കോർഡിനേറ്റുകൾ" : "Invalid Coordinates",
        description: language === 'ml' ? "സാധുവായ അക്ഷാംശവും രേഖാംശവും നൽകുക" : "Please enter valid latitude and longitude",
        variant: "destructive"
      });
      return;
    }

    await analyzeSoil(lat, lng);
  };

  const handleSaveReport = async () => {
    if (!user || !result) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('soil_reports').insert([{
        user_id: user.id,
        nitrogen: result.nValue || 0,
        phosphorus: result.pValue || 0,
        potassium: result.kValue || 0,
        ph: typeof result.ph === 'number' ? result.ph : parseFloat(result.ph as string) || 0,
        status_json: result as any
      }]);

      if (error) throw error;

      toast({
        title: t('reportSaved'),
        description: language === 'ml' ? "നിങ്ങളുടെ മണ്ണ് റിപ്പോർട്ട് സേവ് ചെയ്തു" : "Your soil report has been saved"
      });
    } catch (error: any) {
      console.error('Error saving report:', error);
      toast({
        title: language === 'ml' ? "സേവ് പിശക്" : "Save Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Low': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'Medium': return 'bg-warning/10 text-warning border-warning/30';
      case 'High': return 'bg-primary/10 text-primary border-primary/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'Low') return t('low');
    if (status === 'Medium') return t('medium');
    if (status === 'High') return t('high');
    return status;
  };

  const suitableCrops = result?.soilType ? getSuitableCropsForSoil(result.soilType) : [];
  const cultivationTips = result ? getCultivationTips(result, language) : [];

  return (
    <div className="min-h-screen bg-background kerala-pattern">
      {/* Header */}
      <header className="sticky top-0 z-40 gradient-kerala text-primary-foreground safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                {t('pageTitle')}
              </h1>
              <p className="text-xs text-primary-foreground/80 font-malayalam">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>
        <div className="h-4 wavy-divider" />
      </header>

      {/* Main Content */}
      <div className="px-4 pb-24 space-y-5 -mt-2">
        {/* Location Input Section */}
        <Card className="animate-slide-up shadow-card">
          <CardContent className="pt-5 space-y-4">
            {/* Use My Location Button */}
            <Button
              onClick={handleUseMyLocation}
              disabled={detectingLocation || loading}
              className="w-full h-14 text-base font-semibold"
              variant="default"
            >
              {detectingLocation ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('detectingLocation')}
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5 mr-2" />
                  {t('useMyLocation')}
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{t('orEnterCoordinates')}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Manual Coordinate Entry */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('latitude')}</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="10.8505"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('longitude')}</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="76.2711"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading || detectingLocation}
              className="w-full h-12 text-base font-semibold"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('analyzing')}
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 mr-2" />
                  {t('analyzeSoil')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && result.success && (
          <>
            {/* Soil Analysis Report */}
            <Card className="animate-slide-up shadow-card" style={{ animationDelay: "100ms" }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-primary" />
                  {t('soilTestReport')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location Info */}
                <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">{t('location')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.district}, {result.state}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.latitude?.toFixed(6)}, {result.longitude?.toFixed(6)}
                  </p>
                  {result.confidence && (
                    <Badge variant="outline" className="mt-2">
                      {t('confidence')}: {result.confidence}
                    </Badge>
                  )}
                </div>

                {/* Soil Type & Texture */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">{t('soilType')}</p>
                    <p className="font-semibold text-sm">{result.soilType}</p>
                  </div>
                  {result.texture && (
                    <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">{t('texture')}</p>
                      <p className="font-semibold text-sm">{result.texture}</p>
                    </div>
                  )}
                </div>

                {/* pH & Organic Carbon */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">{t('phLevel')}</p>
                    <p className="font-semibold text-sm">
                      {result.ph} {result.phRange && <span className="text-xs text-muted-foreground">({result.phRange})</span>}
                    </p>
                  </div>
                  {result.organicCarbon && (
                    <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">{t('organicCarbon')}</p>
                      <p className="font-semibold text-sm">{result.organicCarbon}%</p>
                    </div>
                  )}
                </div>

                {/* NPK Values */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">NPK Levels</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl border text-center">
                      <p className="text-xs text-muted-foreground mb-1">{t('nitrogen')}</p>
                      {result.nValue !== undefined ? (
                        <p className="font-bold text-lg">{result.nValue}</p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">{t('kgHa')}</p>
                      {result.nStatus && (
                        <Badge className={cn("mt-2", getStatusColor(result.nStatus))} variant="outline">
                          {getStatusText(result.nStatus)}
                        </Badge>
                      )}
                    </div>
                    <div className="p-3 rounded-xl border text-center">
                      <p className="text-xs text-muted-foreground mb-1">{t('phosphorus')}</p>
                      {result.pValue !== undefined ? (
                        <p className="font-bold text-lg">{result.pValue}</p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">{t('kgHa')}</p>
                      {result.pStatus && (
                        <Badge className={cn("mt-2", getStatusColor(result.pStatus))} variant="outline">
                          {getStatusText(result.pStatus)}
                        </Badge>
                      )}
                    </div>
                    <div className="p-3 rounded-xl border text-center">
                      <p className="text-xs text-muted-foreground mb-1">{t('potassium')}</p>
                      {result.kValue !== undefined ? (
                        <p className="font-bold text-lg">{result.kValue}</p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">{t('kgHa')}</p>
                      {result.kStatus && (
                        <Badge className={cn("mt-2", getStatusColor(result.kStatus))} variant="outline">
                          {getStatusText(result.kStatus)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cultivation Tips */}
                <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm mb-2">{t('cultivationTips')}</h4>
                      <ul className="space-y-1">
                        {cultivationTips.map((tip, index) => (
                          <li key={index} className="text-sm text-muted-foreground">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Button
                variant="outline"
                onClick={handleSaveReport}
                disabled={saving}
                className="h-12"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('saveReport')}
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowCropsModal(true)}
                className="h-12"
              >
                <Sprout className="w-4 h-4 mr-2" />
                {t('viewCrops')}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Suitable Crops Modal */}
      <SuitableCropsModal
        open={showCropsModal}
        onOpenChange={setShowCropsModal}
        crops={suitableCrops}
        language={language}
      />
    </div>
  );
}
