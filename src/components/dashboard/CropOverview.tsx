import { useState, useEffect } from "react";
import { TrendingUp, Leaf, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { differenceInDays } from "date-fns";

interface Crop {
  id: string;
  name: string;
  area: string;
  stage: string;
  progress: number;
  health: "good" | "moderate" | "poor";
  daysToHarvest?: number;
}

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
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const loadCrops = async () => {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (data) {
        setCrops(data.map(crop => {
          const today = new Date();
          const plantingDate = crop.planting_date ? new Date(crop.planting_date) : null;
          const harvestDate = crop.expected_harvest_date ? new Date(crop.expected_harvest_date) : null;
          
          let progress = 50;
          let daysToHarvest: number | undefined;

          if (plantingDate && harvestDate) {
            const totalDays = differenceInDays(harvestDate, plantingDate);
            const daysPassed = differenceInDays(today, plantingDate);
            progress = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));
            daysToHarvest = Math.max(0, differenceInDays(harvestDate, today));
          }

          return {
            id: crop.id,
            name: crop.variety ? `${crop.name} (${crop.variety})` : crop.name,
            area: `${crop.area || 0} ${crop.area_unit || 'acres'}`,
            stage: crop.current_stage || 'Growing',
            progress,
            health: (crop.health_status as "good" | "moderate" | "poor") || "good",
            daysToHarvest: daysToHarvest && daysToHarvest > 0 ? daysToHarvest : undefined,
          };
        }));
      }
      setLoading(false);
    };

    loadCrops();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            Crop Status
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {crops.length} active crop{crops.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {crops.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Leaf className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No crops added yet</p>
            <Button variant="link" size="sm" className="mt-1" onClick={() => navigate('/farm')}>
              Add your first crop
            </Button>
          </div>
        ) : (
          crops.map((crop) => (
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
          ))
        )}
      </CardContent>
    </Card>
  );
}
