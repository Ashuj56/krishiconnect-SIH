import { useState } from "react";
import { Camera, Upload, Leaf, Bug, Droplets, ChevronLeft, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type ScanType = "pest" | "disease" | "nutrient" | "health";

const scanTypes = [
  { id: "pest" as ScanType, icon: Bug, label: "Pest Detection", color: "bg-destructive" },
  { id: "disease" as ScanType, icon: Leaf, label: "Disease Analysis", color: "bg-warning" },
  { id: "nutrient" as ScanType, icon: Droplets, label: "Nutrient Check", color: "bg-accent" },
  { id: "health" as ScanType, icon: Zap, label: "Health Score", color: "bg-success" },
];

interface ScanResult {
  confidence: number;
  issue: string;
  severity?: string;
  description: string;
  recommendations: string[];
}

export default function Scanner() {
  const [selectedType, setSelectedType] = useState<ScanType>("health");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleScan = async () => {
    if (!previewImage) return;
    
    setIsScanning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-crop', {
        body: { 
          image: previewImage,
          scanType: selectedType 
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const scanResult: ScanResult = {
        confidence: data.confidence || 70,
        issue: data.issue || "Analysis Complete",
        severity: data.severity,
        description: data.description || "Analysis completed successfully.",
        recommendations: data.recommendations || ["No specific recommendations at this time."],
      };

      setResult(scanResult);

      // Save scan result to database
      if (user) {
        await supabase.from('scan_results').insert({
          user_id: user.id,
          scan_type: selectedType,
          confidence: scanResult.confidence,
          result_data: {
            issue: scanResult.issue,
            severity: scanResult.severity,
            description: scanResult.description,
          },
          recommendations: scanResult.recommendations,
        });
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 4MB for base64)
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 4MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
    setResult(null);
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-destructive/10 border-destructive/20 text-destructive';
      case 'medium': return 'bg-warning/10 border-warning/20 text-warning';
      case 'low': return 'bg-accent/10 border-accent/20 text-accent';
      default: return 'bg-success/10 border-success/20 text-success';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="md:hidden">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Crop Scanner</h1>
              <p className="text-xs text-muted-foreground">AI-powered analysis</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Scan Type Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">What do you want to check?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {scanTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                    selectedType === type.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-2", type.color)}>
                    <type.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <p className="font-medium text-sm">{type.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Camera/Upload Area */}
        <Card className="overflow-hidden">
          <div className="aspect-[4/3] bg-muted relative">
            {previewImage ? (
              <>
                <img
                  src={previewImage}
                  alt="Uploaded crop"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-3 right-3"
                  onClick={clearImage}
                >
                  <X className="w-4 h-4" />
                </Button>
                {isScanning && (
                  <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                    <div className="text-center text-primary-foreground">
                      <div className="w-16 h-16 border-4 border-primary-foreground border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="font-medium">Analyzing...</p>
                      <p className="text-sm opacity-80">AI is scanning your crop</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <Camera className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-medium">Take or upload a photo</p>
                <p className="text-sm">For best results, capture the affected area clearly</p>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <label>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <label>
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </Button>
            </div>
            {previewImage && !result && (
              <Button
                className="w-full mt-3"
                onClick={handleScan}
                disabled={isScanning}
              >
                {isScanning ? "Analyzing..." : "Analyze Image"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="animate-slide-up">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Analysis Results</CardTitle>
                <span className="text-sm font-medium text-success">
                  {result.confidence}% Confidence
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn("p-3 rounded-xl border", getSeverityColor(result.severity))}>
                <h4 className="font-semibold">{result.issue}</h4>
                {result.severity && result.severity !== 'none' && (
                  <p className="text-xs mt-1 opacity-80">Severity: {result.severity}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">{result.description}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-medium">
                        {index + 1}
                      </span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={clearImage}>
                  Scan Another
                </Button>
                <Button className="flex-1" onClick={() => navigate('/chat')}>
                  Ask AI for More Help
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
