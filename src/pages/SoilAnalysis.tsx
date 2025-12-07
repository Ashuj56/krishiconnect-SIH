import { useState } from "react";
import { FlaskConical, Leaf, Save, Sprout, ArrowLeft, Info, Check, AlertTriangle } from "lucide-react";
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
import { SoilAnalysisChart } from "@/components/soil/SoilAnalysisChart";
import { SuitableCropsModal } from "@/components/soil/SuitableCropsModal";

interface NutrientStatus {
  level: 'Low' | 'Medium' | 'Optimal';
  levelMl: string;
  value: number;
  ideal: { min: number; max: number };
}

interface PHStatus {
  category: string;
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

interface AnalysisResult {
  nutrientStatus: {
    nitrogen: NutrientStatus;
    phosphorus: NutrientStatus;
    potassium: NutrientStatus;
  };
  phStatus: PHStatus;
  summary: { en: string; ml: string };
  recommendations: Recommendation[];
  suitableCrops: SuitableCrop[];
}

const translations = {
  pageTitle: { en: "Soil Analysis", ml: "മണ്ണ് പരിശോധന" },
  subtitle: { en: "NPK & pH Test", ml: "NPK & pH പരിശോധന" },
  enterValues: { en: "Enter NPK Values & pH", ml: "NPK മൂല്യങ്ങളും pH-ഉം നൽകുക" },
  nitrogen: { en: "Nitrogen (N)", ml: "നൈട്രജൻ (N)" },
  phosphorus: { en: "Phosphorus (P)", ml: "ഫോസ്ഫറസ് (P)" },
  potassium: { en: "Potassium (K)", ml: "പൊട്ടാസ്യം (K)" },
  phLevel: { en: "pH Level", ml: "pH ലെവൽ" },
  kgHa: { en: "kg/ha", ml: "കി.ഗ്രാം/ഹെ" },
  analyzeSoil: { en: "Analyze Soil", ml: "മണ്ണ് വിശകലനം ചെയ്യുക" },
  analyzing: { en: "Analyzing...", ml: "വിശകലനം ചെയ്യുന്നു..." },
  soilTestReport: { en: "Soil Test Report", ml: "മണ്ണ് പരിശോധന റിപ്പോർട്ട്" },
  recommendations: { en: "Recommendations", ml: "ശുപാർശകൾ" },
  saveReport: { en: "Save Report", ml: "റിപ്പോർട്ട് സേവ് ചെയ്യുക" },
  viewCrops: { en: "View Suitable Crops", ml: "അനുയോജ്യമായ വിളകൾ കാണുക" },
  saving: { en: "Saving...", ml: "സേവ് ചെയ്യുന്നു..." },
  reportSaved: { en: "Report saved successfully!", ml: "റിപ്പോർട്ട് വിജയകരമായി സേവ് ചെയ്തു!" },
  low: { en: "Low", ml: "കുറവ്" },
  medium: { en: "Medium", ml: "ഇടത്തരം" },
  optimal: { en: "Optimal", ml: "ഉചിതം" },
  ideal: { en: "Ideal", ml: "അനുയോജ്യം" },
};

export default function SoilAnalysis() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [ph, setPh] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showCropsModal, setShowCropsModal] = useState(false);

  const t = (key: keyof typeof translations) => {
    return translations[key][language === 'ml' ? 'ml' : 'en'];
  };

  const handleAnalyze = async () => {
    if (!nitrogen || !phosphorus || !potassium || !ph) {
      toast({
        title: language === 'ml' ? "എല്ലാ ഫീൽഡുകളും പൂരിപ്പിക്കുക" : "Fill all fields",
        description: language === 'ml' ? "എല്ലാ NPK, pH മൂല്യങ്ങളും ആവശ്യമാണ്" : "All NPK and pH values are required",
        variant: "destructive"
      });
      return;
    }

    const phValue = parseFloat(ph);
    if (phValue < 0 || phValue > 14) {
      toast({
        title: language === 'ml' ? "അസാധുവായ pH" : "Invalid pH",
        description: language === 'ml' ? "pH 0 നും 14 നും ഇടയിൽ ആയിരിക്കണം" : "pH must be between 0 and 14",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('soil-analysis', {
        body: {
          N: parseFloat(nitrogen),
          P: parseFloat(phosphorus),
          K: parseFloat(potassium),
          pH: phValue,
          language
        }
      });

      if (error) throw error;
      setResult(data);
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

  const handleSaveReport = async () => {
    if (!user || !result) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('soil_reports').insert([{
        user_id: user.id,
        nitrogen: parseFloat(nitrogen),
        phosphorus: parseFloat(phosphorus),
        potassium: parseFloat(potassium),
        ph: parseFloat(ph),
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

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-destructive';
      case 'Medium': return 'text-warning';
      case 'Optimal': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-destructive bg-destructive/5';
      case 'medium': return 'border-l-warning bg-warning/5';
      case 'low': return 'border-l-primary bg-primary/5';
      default: return 'border-l-border';
    }
  };

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
        {/* Input Section */}
        <Card className="animate-slide-up shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" />
              {t('enterValues')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('nitrogen')}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0"
                    value={nitrogen}
                    onChange={(e) => setNitrogen(e.target.value)}
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {t('kgHa')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('phosphorus')}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0"
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value)}
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {t('kgHa')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('potassium')}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0"
                    value={potassium}
                    onChange={(e) => setPotassium(e.target.value)}
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {t('kgHa')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('phLevel')}</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  placeholder="7.0"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full h-12 text-base font-semibold"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  {t('analyzing')}
                </>
              ) : (
                <>
                  <FlaskConical className="w-5 h-5 mr-2" />
                  {t('analyzeSoil')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <>
            {/* Soil Test Report Chart */}
            <Card className="animate-slide-up shadow-card" style={{ animationDelay: "100ms" }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-primary" />
                  {t('soilTestReport')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SoilAnalysisChart
                  nitrogen={result.nutrientStatus.nitrogen}
                  phosphorus={result.nutrientStatus.phosphorus}
                  potassium={result.nutrientStatus.potassium}
                  ph={result.phStatus}
                  language={language}
                />

                {/* Summary */}
                <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      {language === 'ml' ? result.summary.ml : result.summary.en}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="animate-slide-up shadow-card" style={{ animationDelay: "200ms" }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  {t('recommendations')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-xl border-l-4 transition-all",
                      getPriorityStyles(rec.priority)
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={cn(
                        "w-4 h-4 mt-0.5 shrink-0",
                        rec.priority === 'high' ? 'text-destructive' :
                        rec.priority === 'medium' ? 'text-warning' : 'text-primary'
                      )} />
                      <div>
                        <h4 className="font-semibold text-sm">
                          {language === 'ml' ? rec.typeMl : rec.type}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {language === 'ml' ? rec.messageMl : rec.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: "300ms" }}>
              <Button
                variant="outline"
                onClick={handleSaveReport}
                disabled={saving}
                className="h-12"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
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
        crops={result?.suitableCrops || []}
        language={language}
      />
    </div>
  );
}
