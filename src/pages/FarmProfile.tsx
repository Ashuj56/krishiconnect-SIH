import { MapPin, Droplets, Thermometer, Edit2, Plus, Leaf, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FarmData {
  name: string;
  location: string;
  totalArea: string;
  soilType: string;
  waterSource: string;
  crops: { name: string; area: string; status: string }[];
}

const farmData: FarmData = {
  name: "Kumar Farm",
  location: "Thrissur, Kerala",
  totalArea: "6.5 acres",
  soilType: "Alluvial Soil",
  waterSource: "Well + Canal",
  crops: [
    { name: "Rice (Paddy)", area: "2 acres", status: "Flowering" },
    { name: "Banana", area: "1 acre", status: "Fruiting" },
    { name: "Coconut", area: "3 acres", status: "Mature" },
    { name: "Vegetables", area: "0.5 acres", status: "Growing" },
  ],
};

export default function FarmProfile() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">Farm Profile</h1>
            <p className="text-xs text-muted-foreground">Manage your farm details</p>
          </div>
          <Button variant="outline" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Farm Overview Card */}
        <Card className="overflow-hidden">
          <div className="gradient-primary p-6 text-primary-foreground">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{farmData.name}</h2>
                <div className="flex items-center gap-1 mt-1 opacity-90">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{farmData.location}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{farmData.totalArea}</p>
                <p className="text-sm opacity-80">Total Area</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-soil/10 flex items-center justify-center">
                  <Mountain className="w-5 h-5 text-soil" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Soil Type</p>
                  <p className="font-medium text-sm">{farmData.soilType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-water/10 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-water" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Water Source</p>
                  <p className="font-medium text-sm">{farmData.waterSource}</p>
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
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {farmData.crops.map((crop, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border bg-card hover:shadow-card transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{crop.name}</h4>
                    <p className="text-sm text-muted-foreground">{crop.area}</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {crop.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Soil Health Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-primary" />
              Soil Health Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Nitrogen (N)</span>
                <span className="font-medium">Good</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Phosphorus (P)</span>
                <span className="font-medium">Moderate</span>
              </div>
              <Progress value={55} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Potassium (K)</span>
                <span className="font-medium">Good</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>pH Level</span>
                <span className="font-medium">6.5 (Optimal)</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <Button variant="outline" className="w-full mt-2">
              Request Soil Test
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
