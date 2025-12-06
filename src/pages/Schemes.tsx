import { useState, useEffect } from "react";
import { FileText, CheckCircle, Clock, ArrowRight, Filter, ExternalLink, Loader2, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DocumentManager from "@/components/documents/DocumentManager";

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
  status?: "applied" | "approved" | "pending";
  nextBenefit?: string;
}

interface SchemeStats {
  approved: number;
  pending: number;
  eligible: number;
  total: number;
}

const eligibilityStyles = {
  eligible: { bg: "bg-success/10", text: "text-success", label: "Eligible" },
  check: { bg: "bg-warning/10", text: "text-warning", label: "Check Eligibility" },
  "not-eligible": { bg: "bg-muted", text: "text-muted-foreground", label: "Not Eligible" },
};

const categoryColors: Record<string, string> = {
  "Income Support": "bg-primary/10 text-primary",
  "Insurance": "bg-blue-500/10 text-blue-600",
  "Credit": "bg-green-500/10 text-green-600",
  "Organic Farming": "bg-emerald-500/10 text-emerald-600",
  "Irrigation": "bg-cyan-500/10 text-cyan-600",
  "Mechanization": "bg-orange-500/10 text-orange-600",
  "Soil Health": "bg-amber-500/10 text-amber-600",
  "Solar Energy": "bg-yellow-500/10 text-yellow-600",
  "State Scheme": "bg-purple-500/10 text-purple-600",
  "default": "bg-muted text-muted-foreground",
};

export default function Schemes() {
  const { user } = useAuth();
  const [appliedSchemes, setAppliedSchemes] = useState<Scheme[]>([]);
  const [availableSchemes, setAvailableSchemes] = useState<Scheme[]>([]);
  const [stats, setStats] = useState<SchemeStats>({ approved: 0, pending: 0, eligible: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [farmerLocation, setFarmerLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSchemes();
    }
  }, [user]);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      
      // Fetch farmer context
      const [profileResult, farmResult, cropsResult] = await Promise.all([
        supabase.from("profiles").select("location").eq("id", user?.id).maybeSingle(),
        supabase.from("farms").select("total_area, area_unit, soil_type, location").eq("user_id", user?.id).maybeSingle(),
        supabase.from("crops").select("name").eq("user_id", user?.id),
      ]);

      const location = profileResult.data?.location || farmResult.data?.location || "";
      setFarmerLocation(location);
      
      const farmerContext = {
        location,
        landArea: farmResult.data?.total_area || 0,
        areaUnit: farmResult.data?.area_unit || "acres",
        soilType: farmResult.data?.soil_type || "",
        crops: cropsResult.data?.map(c => c.name) || [],
      };

      // Fetch personalized schemes from edge function
      const { data, error } = await supabase.functions.invoke("government-schemes", {
        body: { farmerContext },
      });

      if (error) throw error;

      setAppliedSchemes(data.appliedSchemes || []);
      setAvailableSchemes(data.availableSchemes || []);
      setStats(data.stats || { approved: 0, pending: 0, eligible: 0, total: 0 });
    } catch (error) {
      console.error("Error fetching schemes:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(availableSchemes.map(s => s.category)));
  
  const filteredSchemes = selectedCategory
    ? availableSchemes.filter(s => s.category === selectedCategory)
    : availableSchemes;

  const handleApply = (scheme: Scheme) => {
    if (scheme.applicationUrl) {
      window.open(scheme.applicationUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">Government Schemes</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{farmerLocation || "Set location in profile"}</span>
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in pb-24">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-success">{stats.approved}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{stats.eligible}</p>
            <p className="text-xs text-muted-foreground">Eligible</p>
          </Card>
        </div>

        {/* Your Applications */}
        {appliedSchemes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Your Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appliedSchemes.map((scheme) => (
                <div key={scheme.id} className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{scheme.name}</h4>
                      <p className="text-sm text-muted-foreground">{scheme.department}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-success text-success-foreground font-medium">
                      {scheme.status === "approved" ? "Approved" : "Pending"}
                    </span>
                  </div>
                  {scheme.nextBenefit && (
                    <p className="text-sm mt-2">
                      Next installment: <span className="font-medium">{scheme.nextBenefit}</span>
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="whitespace-nowrap"
          >
            All ({availableSchemes.length})
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Available Schemes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Available Schemes ({filteredSchemes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredSchemes.map((scheme) => {
              const style = eligibilityStyles[scheme.eligibility];
              const isExpanded = expandedScheme === scheme.id;
              const categoryColor = categoryColors[scheme.category] || categoryColors.default;
              
              return (
                <div
                  key={scheme.id}
                  className="p-4 rounded-xl border bg-card transition-all"
                >
                  <div 
                    className="cursor-pointer"
                    onClick={() => setExpandedScheme(isExpanded ? null : scheme.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{scheme.name}</h4>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", categoryColor)}>
                            {scheme.category}
                          </span>
                        </div>
                        {scheme.nameHindi && (
                          <p className="text-xs text-muted-foreground">{scheme.nameHindi}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{scheme.department}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          style.bg, style.text
                        )}>
                          {style.label}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-primary font-medium">{scheme.benefit}</p>
                    {scheme.deadline && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Deadline: {scheme.deadline}
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                      <p className="text-sm text-muted-foreground">{scheme.description}</p>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2">Documents Required:</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {scheme.documents.map((doc, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          onClick={() => handleApply(scheme)}
                          disabled={scheme.eligibility === "not-eligible"}
                        >
                          {scheme.applicationUrl ? (
                            <>
                              Apply Online <ExternalLink className="w-4 h-4 ml-1" />
                            </>
                          ) : (
                            <>
                              Learn More <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Document Manager */}
        <DocumentManager />
      </div>
    </div>
  );
}
