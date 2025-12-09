import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, Factory, Store, TrendingUp, Leaf, ArrowLeft, History } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
  "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

const CROPS = ["Banana", "Coconut"];

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
  district: string;
  created_at: string;
  sale_recommendations: {
    best_channel: string;
    expected_income_best: number;
  }[];
}

export default function SmartSale() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [grade, setGrade] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [recommendation, setRecommendation] = useState<SaleRecommendation | null>(null);
  const [pastRecommendations, setPastRecommendations] = useState<PastRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState("log");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!crop || !quantityKg || !grade || !district || !pincode) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    setRecommendation(null);

    try {
      const { data, error } = await supabase.functions.invoke("sale-route-recommend", {
        body: {
          farmer_id: user?.id,
          crop,
          quantity_kg: parseFloat(quantityKg),
          grade,
          district,
          pincode
        }
      });

      if (error) throw error;

      setRecommendation(data);
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
    setCrop("");
    setQuantityKg("");
    setGrade("");
    setPincode("");
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

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Smart Sale Route
        </h1>
        <p className="text-muted-foreground mt-1">
          Find the best buyer for your harvest
        </p>
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
          {recommendation ? (
            <div className="space-y-4 animate-in fade-in">
              <Button
                variant="ghost"
                onClick={handleReset}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Harvest
              </Button>

              {/* Summary Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{recommendation.crop}</span>
                    <Badge variant="outline" className="text-sm">
                      Grade {recommendation.grade}
                    </Badge>
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
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Log Your Harvest</CardTitle>
                <CardDescription>
                  Enter your harvest details to get the best selling recommendation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
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
                      type="number"
                      placeholder="Enter quantity in kg"
                      value={quantityKg}
                      onChange={(e) => setQuantityKg(e.target.value)}
                      min="1"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Grade</Label>
                    <RadioGroup value={grade} onValueChange={setGrade} className="space-y-2">
                      <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="A" id="gradeA" className="mt-0.5" />
                        <div>
                          <Label htmlFor="gradeA" className="font-medium cursor-pointer">
                            Grade A - Good Quality
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Clean, uniform, no major damage
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="B" id="gradeB" className="mt-0.5" />
                        <div>
                          <Label htmlFor="gradeB" className="font-medium cursor-pointer">
                            Grade B - Medium Quality
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Minor defects, acceptable condition
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="C" id="gradeC" className="mt-0.5" />
                        <div>
                          <Label htmlFor="gradeC" className="font-medium cursor-pointer">
                            Grade C - Low Quality
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Damaged, overripe, or uneven
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Select value={district} onValueChange={setDistrict}>
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
                        placeholder="6-digit pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        maxLength={6}
                        pattern="[0-9]{6}"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finding Best Option...
                      </>
                    ) : (
                      "Get Best Selling Option"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
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
                            Grade {rec.grade}
                          </Badge>
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
