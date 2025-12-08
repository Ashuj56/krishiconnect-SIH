import { useState, useEffect } from "react";
import { MapPin, Droplets, Edit2, Plus, Leaf, Mountain, Save, X, Loader2, Trash2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { keralaDistricts, getSoilTypesForDistrict, getPrimarySoilType } from "@/data/keralaSoilMapping";

interface Farm {
  id: string;
  name: string;
  location: string | null;
  total_area: number | null;
  area_unit: string | null;
  soil_type: string | null;
  water_source: string | null;
}

interface Crop {
  id: string;
  name: string;
  variety: string | null;
  area: number | null;
  area_unit: string | null;
  current_stage: string | null;
  health_status: string | null;
}

const waterSources = ["Well", "Canal", "Borewell", "River", "Rainwater", "Mixed"];
const cropStages = ["Seedling", "Growing", "Flowering", "Fruiting", "Mature", "Harvesting"];

export default function FarmProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Farm>>({});
  const [availableSoilTypes, setAvailableSoilTypes] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [newCrop, setNewCrop] = useState({ name: "", variety: "", area: "", stage: "", health: "good" });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [soilDetectedByGPS, setSoilDetectedByGPS] = useState(false);

  // Handle district change and auto-fill soil type
  const handleDistrictChange = (selectedDistrict: string) => {
    setEditForm({ ...editForm, location: selectedDistrict });
    setSoilDetectedByGPS(false);
    if (selectedDistrict) {
      const soilTypes = getSoilTypesForDistrict(selectedDistrict);
      setAvailableSoilTypes(soilTypes);
      // Auto-fill soil type only if not already set or different district
      if (!editForm.soil_type || !soilTypes.includes(editForm.soil_type)) {
        const primarySoil = getPrimarySoilType(selectedDistrict);
        setEditForm(prev => ({ ...prev, location: selectedDistrict, soil_type: primarySoil }));
      }
    } else {
      setAvailableSoilTypes([]);
    }
  };

  // Detect location and soil type using GPS
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser does not support location services.",
        variant: "destructive",
      });
      return;
    }

    setIsDetectingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const { data, error } = await supabase.functions.invoke('get-soil-type', {
            body: { latitude, longitude }
          });

          if (error) throw error;

          if (data?.success) {
            setEditForm(prev => ({
              ...prev,
              location: data.district,
              soil_type: data.soil_type
            }));
            setAvailableSoilTypes(data.soil_types || []);
            setSoilDetectedByGPS(true);
            
            toast({
              title: "Location Detected",
              description: `District: ${data.district}, Soil: ${data.soil_type}`,
            });
          } else {
            toast({
              title: "Detection Failed",
              description: data?.message || "Could not detect soil type for this location.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Soil detection error:", error);
          toast({
            title: "Detection Failed",
            description: "Unable to detect soil type. Please select manually.",
            variant: "destructive",
          });
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        let message = "Unable to get your location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission denied. Please enable location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (user) {
      fetchFarmData();
    }
  }, [user]);

  const fetchFarmData = async () => {
    if (!user) return;

    try {
      // Fetch farm
      const { data: farmData } = await supabase
        .from("farms")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (farmData) {
        setFarm(farmData);
        setEditForm(farmData);

        // Fetch crops for this farm
        const { data: cropsData } = await supabase
          .from("crops")
          .select("*")
          .eq("farm_id", farmData.id);

        if (cropsData) {
          setCrops(cropsData);
        }
      }
    } catch (error) {
      console.error("Error fetching farm data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFarm = async () => {
    if (!farm) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("farms")
        .update({
          name: editForm.name,
          location: editForm.location,
          total_area: editForm.total_area,
          soil_type: editForm.soil_type,
          water_source: editForm.water_source,
        })
        .eq("id", farm.id);

      if (error) throw error;

      setFarm({ ...farm, ...editForm });
      setIsEditing(false);
      toast({ title: "Farm updated successfully" });
    } catch (error) {
      toast({ title: "Error updating farm", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCrop = async () => {
    if (!farm || !newCrop.name) return;

    try {
      const { data, error } = await supabase
        .from("crops")
        .insert({
          user_id: user!.id,
          farm_id: farm.id,
          name: newCrop.name,
          variety: newCrop.variety || null,
          area: newCrop.area ? parseFloat(newCrop.area) : null,
          area_unit: "acres",
          current_stage: newCrop.stage || null,
          health_status: newCrop.health,
        })
        .select()
        .single();

      if (error) throw error;

      setCrops([...crops, data]);
      setShowAddCrop(false);
      setNewCrop({ name: "", variety: "", area: "", stage: "", health: "good" });
      toast({ title: "Crop added successfully" });
    } catch (error) {
      toast({ title: "Error adding crop", variant: "destructive" });
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    try {
      const { error } = await supabase
        .from("crops")
        .delete()
        .eq("id", cropId);

      if (error) throw error;

      setCrops(crops.filter(c => c.id !== cropId));
      toast({ title: "Crop deleted" });
    } catch (error) {
      toast({ title: "Error deleting crop", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="p-8 text-center">
          <Leaf className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Farm Found</h2>
          <p className="text-muted-foreground mb-4">Create your farm profile to get started</p>
          <Button onClick={() => setIsEditing(true)}>Create Farm Profile</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">Farm Profile</h1>
            <p className="text-xs text-muted-foreground">Manage your farm details</p>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditForm(farm); }}>
                <X className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleSaveFarm} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                Save
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => {
              setIsEditing(true);
              // Initialize available soil types for current district
              if (farm?.location) {
                setAvailableSoilTypes(getSoilTypesForDistrict(farm.location));
              }
            }}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Farm Overview Card */}
        <Card className="overflow-hidden">
          <div className="gradient-primary p-6 text-primary-foreground">
            <div className="flex items-start justify-between">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-2xl font-bold bg-transparent border-b border-primary-foreground/50 outline-none w-full"
                  />
                ) : (
                  <h2 className="text-2xl font-bold">{farm.name}</h2>
                )}
                <div className="flex items-center gap-1 mt-1 opacity-90">
                  <MapPin className="w-4 h-4" />
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={editForm.location || ""}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="text-sm bg-primary-foreground/10 border border-primary-foreground/30 rounded-lg px-2 py-1 outline-none text-primary-foreground"
                      >
                        <option value="" className="text-foreground bg-background">Select District</option>
                        {keralaDistricts.map((district) => (
                          <option key={district} value={district} className="text-foreground bg-background">
                            {district}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isDetectingLocation}
                        className="p-1.5 rounded-lg bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
                        title="Detect location via GPS"
                      >
                        {isDetectingLocation ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Navigation className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm">{farm.location ? `${farm.location}, Kerala` : "No location set"}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.total_area || ""}
                    onChange={(e) => setEditForm({ ...editForm, total_area: parseFloat(e.target.value) })}
                    className="text-3xl font-bold bg-transparent border-b border-primary-foreground/50 outline-none w-24 text-right"
                  />
                ) : (
                  <p className="text-3xl font-bold">{farm.total_area || 0}</p>
                )}
                <p className="text-sm opacity-80">{farm.area_unit || "acres"}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-soil/10 flex items-center justify-center">
                  <Mountain className="w-5 h-5 text-soil" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Soil Type</p>
                  {isEditing ? (
                    <select
                      value={editForm.soil_type || ""}
                      onChange={(e) => setEditForm({ ...editForm, soil_type: e.target.value })}
                      className="font-medium text-sm bg-transparent outline-none w-full"
                    >
                      <option value="">Select</option>
                      {(availableSoilTypes.length > 0 ? availableSoilTypes : getSoilTypesForDistrict(editForm.location || farm.location || "")).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-medium text-sm">{farm.soil_type || "Not set"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-water/10 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-water" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Water Source</p>
                  {isEditing ? (
                    <select
                      value={editForm.water_source || ""}
                      onChange={(e) => setEditForm({ ...editForm, water_source: e.target.value })}
                      className="font-medium text-sm bg-transparent outline-none w-full"
                    >
                      <option value="">Select</option>
                      {waterSources.map((source) => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-medium text-sm">{farm.water_source || "Not set"}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crops Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                My Crops
              </CardTitle>
              <Dialog open={showAddCrop} onOpenChange={setShowAddCrop}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Crop</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <input
                      type="text"
                      placeholder="Crop name (e.g., Rice, Banana)"
                      value={newCrop.name}
                      onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-transparent focus:border-primary/50 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Variety (optional)"
                      value={newCrop.variety}
                      onChange={(e) => setNewCrop({ ...newCrop, variety: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-transparent focus:border-primary/50 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Area in acres"
                      value={newCrop.area}
                      onChange={(e) => setNewCrop({ ...newCrop, area: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-transparent focus:border-primary/50 outline-none"
                    />
                    <select
                      value={newCrop.stage}
                      onChange={(e) => setNewCrop({ ...newCrop, stage: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-muted border-2 border-transparent focus:border-primary/50 outline-none"
                    >
                      <option value="">Select growth stage</option>
                      {cropStages.map((stage) => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                    <Button className="w-full" onClick={handleAddCrop}>
                      Add Crop
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {crops.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Leaf className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No crops added yet</p>
              </div>
            ) : (
              crops.map((crop) => (
                <div
                  key={crop.id}
                  className="p-4 rounded-xl border bg-card hover:shadow-card transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{crop.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {crop.area ? `${crop.area} ${crop.area_unit || "acres"}` : "Area not set"}
                        {crop.variety && ` • ${crop.variety}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs px-3 py-1 rounded-full font-medium",
                        crop.health_status === "good" && "bg-crop-green/10 text-crop-green",
                        crop.health_status === "moderate" && "bg-harvest-gold/10 text-harvest-gold",
                        crop.health_status === "poor" && "bg-destructive/10 text-destructive"
                      )}>
                        {crop.current_stage || "Growing"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteCrop(crop.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
