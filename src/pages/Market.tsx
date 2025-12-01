import { TrendingUp, TrendingDown, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CropPrice {
  id: string;
  name: string;
  price: number;
  unit: string;
  change: number;
  market: string;
}

interface Market {
  id: string;
  name: string;
  distance: string;
  crops: number;
}

const cropPrices: CropPrice[] = [
  { id: "1", name: "Rice (Paddy)", price: 2150, unit: "quintal", change: 2.5, market: "Thrissur" },
  { id: "2", name: "Banana (Nendran)", price: 45, unit: "kg", change: -1.2, market: "Ernakulam" },
  { id: "3", name: "Coconut", price: 32, unit: "piece", change: 5.0, market: "Thrissur" },
  { id: "4", name: "Tomato", price: 28, unit: "kg", change: -8.5, market: "Local" },
  { id: "5", name: "Pepper", price: 520, unit: "kg", change: 3.2, market: "Kochi" },
];

const nearbyMarkets: Market[] = [
  { id: "1", name: "Thrissur APMC", distance: "12 km", crops: 45 },
  { id: "2", name: "Ernakulam Market", distance: "35 km", crops: 62 },
  { id: "3", name: "Palakkad Mandi", distance: "48 km", crops: 38 },
];

export default function Market() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">Market Prices</h1>
            <p className="text-xs text-muted-foreground">Updated 2 hours ago</p>
          </div>
          <Button variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Price Summary Card */}
        <Card className="overflow-hidden">
          <div className="gradient-harvest p-5">
            <p className="text-sm opacity-80">Best Selling Opportunity</p>
            <h3 className="text-xl font-bold mt-1">Coconut prices up 5%</h3>
            <p className="text-sm mt-2 opacity-90">
              Consider selling within next 3-5 days for maximum profit
            </p>
          </div>
        </Card>

        {/* Current Prices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Current Crop Prices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cropPrices.map((crop) => (
              <div
                key={crop.id}
                className="flex items-center justify-between p-3 rounded-xl border bg-card hover:shadow-card transition-all"
              >
                <div>
                  <h4 className="font-medium">{crop.name}</h4>
                  <p className="text-xs text-muted-foreground">{crop.market}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ₹{crop.price}
                    <span className="text-xs font-normal text-muted-foreground">/{crop.unit}</span>
                  </p>
                  <div className={cn(
                    "flex items-center justify-end gap-1 text-xs font-medium",
                    crop.change >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {crop.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(crop.change)}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Nearby Markets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Nearby Markets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearbyMarkets.map((market) => (
              <div
                key={market.id}
                className="flex items-center justify-between p-3 rounded-xl border bg-card hover:shadow-card transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{market.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {market.distance} • {market.crops} crops listed
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Price Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Price Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Get notified when prices reach your target
            </p>
            <Button variant="outline" className="w-full">
              Set Price Alert
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
