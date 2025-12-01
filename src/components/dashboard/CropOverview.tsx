import { TrendingUp, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Crop {
  id: string;
  name: string;
  area: string;
  stage: string;
  progress: number;
  health: "good" | "moderate" | "poor";
  daysToHarvest?: number;
}

const mockCrops: Crop[] = [
  { id: "1", name: "Rice (Paddy)", area: "2 acres", stage: "Flowering", progress: 65, health: "good", daysToHarvest: 45 },
  { id: "2", name: "Banana", area: "1 acre", stage: "Fruiting", progress: 80, health: "good", daysToHarvest: 30 },
  { id: "3", name: "Coconut", area: "3 acres", stage: "Mature", progress: 100, health: "moderate" },
  { id: "4", name: "Vegetables", area: "0.5 acres", stage: "Growing", progress: 40, health: "good", daysToHarvest: 20 },
];

const healthColors = {
  good: "text-success",
  moderate: "text-warning",
  poor: "text-destructive",
};

const progressColors = {
  good: "bg-success",
  moderate: "bg-warning",
  poor: "bg-destructive",
};

export function CropOverview() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            Crop Status
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {mockCrops.length} active crops
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockCrops.map((crop) => (
          <div
            key={crop.id}
            className="p-3 rounded-xl border bg-card hover:shadow-card transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium">{crop.name}</h4>
                <p className="text-xs text-muted-foreground">{crop.area} • {crop.stage}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-xs font-medium capitalize ${healthColors[crop.health]}`}>
                  {crop.health}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Growth Progress</span>
                <span className="font-medium">{crop.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressColors[crop.health]}`}
                  style={{ width: `${crop.progress}%` }}
                />
              </div>
            </div>

            {crop.daysToHarvest && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                <span>~{crop.daysToHarvest} days to harvest</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
