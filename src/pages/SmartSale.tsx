import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, Factory, Store, TrendingUp, Leaf, ArrowLeft, History, Ticket, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradeQuestionnaire } from "@/components/smartsale/GradeQuestionnaire";
import { DigitalGradeTicket } from "@/components/smartsale/DigitalGradeTicket";
import { Link } from "react-router-dom";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
  "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

// District to valid pincode ranges mapping for Kerala
const DISTRICT_PINCODES: Record<string, { default: string; range: [number, number] }> = {
  "Thiruvananthapuram": { default: "695001", range: [695001, 695615] },
  "Kollam": { default: "691001", range: [691001, 691601] },
  "Pathanamthitta": { default: "689501", range: [689501, 689711] },
  "Alappuzha": { default: "688001", range: [688001, 690573] },
  "Kottayam": { default: "686001", range: [686001, 686693] },
  "Idukki": { default: "685501", range: [685501, 685621] },
  "Ernakulam": { default: "682001", range: [682001, 683594] },
  "Thrissur": { default: "680001", range: [680001, 680721] },
  "Palakkad": { default: "678001", range: [678001, 679563] },
  "Malappuram": { default: "676101", range: [676101, 676561] },
  "Kozhikode": { default: "673001", range: [673001, 673661] },
  "Wayanad": { default: "673121", range: [673121, 673596] },
  "Kannur": { default: "670001", range: [670001, 670721] },
  "Kasaragod": { default: "671121", range: [671121, 671551] }
};

const CROPS = [
  "Banana", "Coconut", "Pepper", "Cardamom", "Rubber", "Paddy", "Tapioca", 
  "Ginger", "Turmeric", "Arecanut", "Cashew", "Coffee", "Tea", "Jackfruit", 
  "Mango", "Pineapple", "Nutmeg", "Clove", "Vanilla"
];

interface BuyerOption {
  buyer_name: string;
  buyer_type: string;
  price_per_kg: number;
  expected_income: number;
  contact_info: string;
}

interface SaleRecommendation {
  harvest_batch_id: string;
  grade: string;
  crop: string;
  quantity_kg: number;
  district: string;
  factory_options: BuyerOption[];
  local_options: BuyerOption[];
  best_channel: string;
  best_channel_explanation: string;
  grade_explanation: string;
  value_added_info: string;
  expected_income_best: number;
}

interface PastRecommendation {
  id: string;
  crop: string;
  quantity_kg: number;
  grade: string;
  preliminary_grade: string | null;
  final_grade: string | null;
  district: string;
  created_at: string;
  sale_recommendations: {
    best_channel: string;
    expected_income_best: number;
  }[];
}

interface GradeTicketData {
  id: string;
  ticket_code: string;
  crop: string;
  quantity_kg: number;
  preliminary_grade: string;
  district: string;
  pincode: string;
  created_at: string;
}

type Step = "details" | "grading" | "ticket" | "recommendation";

export default function SmartSale() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [preliminaryGrade, setPreliminaryGrade] = useState("");
  const [gradeTicket, setGradeTicket] = useState<GradeTicketData | null>(null);
  const [recommendation, setRecommendation] = useState<SaleRecommendation | null>(null);
  const [pastRecommendations, setPastRecommendations] = useState<PastRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState("log");
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchFarmerProfile();
      fetchPastRecommendations();
    }
  }, [user]);

  const fetchFarmerProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("location")
        .eq("id", user?.id)
        .maybeSingle();

      if (profile?.location) {
        const parts = profile.location.split(",").map((p: string) => p.trim());
        if (parts.length >= 2) {
          setDistrict(parts[1] || "");
        }
      }

      const { data: farm } = await supabase
        .from("farms")
        .select("location")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (farm?.location) {
        const parts = farm.location.split(",").map((p: string) => p.trim());
        if (parts.length >= 2) {
          setDistrict(parts[1] || "");
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchPastRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from("harvest_batches")
        .select(`
          id,
          crop,
          quantity_kg,
          grade,
          preliminary_grade,
          final_grade,
          district,
          created_at,
          sale_recommendations (
            best_channel,
            expected_income_best
          )
        `)
        .eq("farmer_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setPastRecommendations(data || []);
    } catch (error) {
      console.error("Error fetching past recommendations:", error);
    }
  };

  // Handle district change - auto-fill pincode
  const handleDistrictChange = (selectedDistrict: string) => {
    setDistrict(selectedDistrict);
    const districtData = DISTRICT_PINCODES[selectedDistrict];
    if (districtData) {
      setPincode(districtData.default);
    }
  };

  // Validate quantity input - only positive real numbers
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string for clearing, or valid positive numbers
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      // Prevent leading zeros unless it's a decimal
      if (value.length > 1 && value.startsWith("0") && !value.startsWith("0.")) {
        setQuantityKg(value.slice(1));
      } else {
        setQuantityKg(value);
      }
    }
  };

  // Block invalid characters in quantity input
  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block e, E, +, - and other non-numeric characters except decimal point
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Validate pincode for selected district
  const validatePincode = (pincodeValue: string): boolean => {
    if (!district || !pincodeValue || pincodeValue.length !== 6) return false;
    const districtData = DISTRICT_PINCODES[district];
    if (!districtData) return false;
    const pincodeNum = parseInt(pincodeValue, 10);
    return pincodeNum >= districtData.range[0] && pincodeNum <= districtData.range[1];
  };

  // Handle pincode change with validation
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(value);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!crop || !quantityKg || !district || !pincode) {
      toast.error("Please fill all fields");
      return;
    }

    const qty = parseFloat(quantityKg);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid positive quantity");
      return;
    }

    if (pincode.length !== 6 || !validatePincode(pincode)) {
      toast.error(`Please enter a valid pincode for ${district}`);
      return;
    }

    setCurrentStep("grading");
  };

  const handleGradeCalculated = async (grade: string, _answers: Record<string, number>) => {
    setPreliminaryGrade(grade);
    setLoading(true);

    try {
      // Create harvest batch with preliminary grade
      const { data: batch, error: batchError } = await supabase
        .from("harvest_batches")
        .insert({
          farmer_id: user?.id,
          crop,
          quantity_kg: parseFloat(quantityKg),
          grade, // Keep for backward compatibility
          preliminary_grade: grade,
          district,
          pincode,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      setCurrentBatchId(batch.id);

      // Generate grade ticket
      const { data: ticketData, error: ticketError } = await supabase.functions.invoke("grade-ticket", {
        body: { action: "create", harvest_batch_id: batch.id }
      });

      if (ticketError || ticketData.error) throw new Error(ticketData?.error || "Failed to create ticket");

      setGradeTicket(ticketData.ticket);
      setCurrentStep("ticket");
      toast.success("Grade ticket generated!");
    } catch (error) {
      console.error("Error creating batch:", error);
      toast.error("Failed to create harvest batch");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToRecommendation = async () => {
    if (!currentBatchId) return;
    setLoading(true);

    try {
      // Fetch the latest batch data to get final_grade if it exists
      const { data: batch } = await supabase
        .from("harvest_batches")
        .select("final_grade, preliminary_grade")
        .eq("id", currentBatchId)
        .single();

      const gradeToUse = batch?.final_grade || batch?.preliminary_grade || preliminaryGrade;

      const { data, error } = await supabase.functions.invoke("sale-route-recommend", {
        body: {
          farmer_id: user?.id,
          crop,
          quantity_kg: parseFloat(quantityKg),
          grade: gradeToUse,
          district,
          pincode,
          harvest_batch_id: currentBatchId
        }
      });

      if (error) throw error;

      setRecommendation(data);
      setCurrentStep("recommendation");
      fetchPastRecommendations();
      toast.success("Recommendation generated!");
    } catch (error) {
      console.error("Error getting recommendation:", error);
      toast.error("Failed to get recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRecommendation(null);
    setGradeTicket(null);
    setPreliminaryGrade("");
    setCurrentBatchId(null);
    setCrop("");
    setQuantityKg("");
    setPincode("");
    setCurrentStep("details");
  };

  const getChannelBadgeColor = (channel: string) => {
    switch (channel) {
      case "factory":
        return "bg-blue-500";
      case "oil_mill":
        return "bg-amber-500";
      case "local":
        return "bg-green-500";
      default:
        return "bg-muted";
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case "factory":
        return "Factory";
      case "oil_mill":
        return "Oil Mill";
      case "local":
        return "Local Market";
      default:
        return channel;
    }
  };

  const getEffectiveGrade = (rec: PastRecommendation) => {
    return rec.final_grade || rec.preliminary_grade || rec.grade;
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 pb-24">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Smart Sale Route
            </h1>
            <p className="text-muted-foreground mt-1">
              Find the best buyer for your harvest
            </p>
          </div>
          <Link to="/verify-grade">
            <Button variant="outline" size="sm">
              <Ticket className="h-4 w-4 mr-2" />
              Verify Grade
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="log" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Log Harvest
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          {currentStep === "details" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Log Your Harvest</CardTitle>
                <CardDescription>
                  Enter your harvest details, then answer quality questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDetailsSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="crop">Crop</Label>
                    <Select value={crop} onValueChange={setCrop}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select crop" />
                      </SelectTrigger>
                      <SelectContent>
                        {CROPS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity (kg)</Label>
                    <Input
                      id="quantity"
                      type="text"
                      inputMode="decimal"
                      placeholder="Enter quantity in kg"
                      value={quantityKg}
                      onChange={handleQuantityChange}
                      onKeyDown={handleQuantityKeyDown}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Select value={district} onValueChange={handleDistrictChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {KERALA_DISTRICTS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        type="text"
                        inputMode="numeric"
                        placeholder="6-digit pincode"
                        value={pincode}
                        onChange={handlePincodeChange}
                        maxLength={6}
                        className={pincode.length === 6 && !validatePincode(pincode) ? "border-destructive" : ""}
                      />
                      {pincode.length === 6 && !validatePincode(pincode) && (
                        <p className="text-xs text-destructive">Invalid pincode for {district}</p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Continue to Quality Assessment
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {currentStep === "grading" && (
            <div className="space-y-4">
              <Button variant="ghost" onClick={() => setCurrentStep("details")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Details
              </Button>

              <Card className="mb-4">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Crop: <span className="font-medium text-foreground">{crop}</span></span>
                    <span className="text-muted-foreground">Qty: <span className="font-medium text-foreground">{quantityKg} kg</span></span>
                    <span className="text-muted-foreground">District: <span className="font-medium text-foreground">{district}</span></span>
                  </div>
                </CardContent>
              </Card>

              <GradeQuestionnaire onGradeCalculated={handleGradeCalculated} />

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Creating grade ticket...</span>
                </div>
              )}
            </div>
          )}

          {currentStep === "ticket" && gradeTicket && (
            <div className="space-y-4">
              <Button variant="ghost" onClick={handleReset}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Harvest
              </Button>

              <DigitalGradeTicket 
                ticket={gradeTicket} 
                onClose={handleContinueToRecommendation}
              />

              {loading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Getting recommendations...</span>
                </div>
              )}
            </div>
          )}

          {currentStep === "recommendation" && recommendation && (
            <div className="space-y-4 animate-in fade-in">
              <Button variant="ghost" onClick={handleReset} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Harvest
              </Button>

              {/* Summary Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{recommendation.crop}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">
                        Grade {recommendation.grade}
                      </Badge>
                      {gradeTicket && (
                        <Badge variant="secondary" className="text-xs font-mono">
                          {gradeTicket.ticket_code}
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {recommendation.quantity_kg} kg • {recommendation.district}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {recommendation.grade_explanation}
                  </p>
                </CardContent>
              </Card>

              {/* Recommended Channel Banner */}
              <Card className="border-primary bg-primary/5">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getChannelBadgeColor(recommendation.best_channel)} text-white`}>
                      Recommended
                    </Badge>
                    <span className="font-semibold">
                      {getChannelLabel(recommendation.best_channel)}
                    </span>
                  </div>
                  <p className="text-sm mt-2 text-foreground">
                    {recommendation.best_channel_explanation}
                  </p>
                  <p className="text-lg font-bold text-primary mt-2">
                    Expected: ₹{recommendation.expected_income_best.toLocaleString('en-IN')}
                  </p>
                </CardContent>
              </Card>

              {/* Factory/Oil Mill Options */}
              {recommendation.factory_options.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Factory className="h-5 w-5 text-blue-500" />
                      Factory / Oil Mill Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recommendation.factory_options.map((option, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{option.buyer_name}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{option.price_per_kg}/kg • ₹{option.expected_income.toLocaleString('en-IN')} total
                          </p>
                        </div>
                        <a href={`tel:${option.contact_info}`}>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        </a>
                      </div>
                    ))}
                    {recommendation.value_added_info && (
                      <p className="text-xs text-muted-foreground italic mt-2">
                        {recommendation.value_added_info}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Local Market Options */}
              {recommendation.local_options.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Store className="h-5 w-5 text-green-500" />
                      Local Market Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recommendation.local_options.map((option, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{option.buyer_name}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{option.price_per_kg}/kg • ₹{option.expected_income.toLocaleString('en-IN')} total
                          </p>
                        </div>
                        <a href={`tel:${option.contact_info}`}>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        </a>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {recommendation.factory_options.length === 0 && recommendation.local_options.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No buyers found for {recommendation.crop} in {recommendation.district}.
                    Try a nearby district.
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Past Recommendations</CardTitle>
              <CardDescription>
                Your recent harvest sale recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pastRecommendations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No past recommendations yet. Log your first harvest!
                </p>
              ) : (
                <div className="space-y-3">
                  {pastRecommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rec.crop}</span>
                          <Badge variant="outline" className="text-xs">
                            Grade {getEffectiveGrade(rec)}
                          </Badge>
                          {rec.final_grade && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rec.quantity_kg} kg • {rec.district}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rec.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      {rec.sale_recommendations?.[0] && (
                        <div className="text-right">
                          <Badge className={`${getChannelBadgeColor(rec.sale_recommendations[0].best_channel)} text-white text-xs`}>
                            {getChannelLabel(rec.sale_recommendations[0].best_channel)}
                          </Badge>
                          <p className="text-sm font-medium text-primary mt-1">
                            ₹{rec.sale_recommendations[0].expected_income_best.toLocaleString('en-IN')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
