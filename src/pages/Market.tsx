import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, MapPin, ArrowRight, RefreshCw, ExternalLink, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CropPrice {
  id: string;
  name: string;
  price: number;
  unit: string;
  change: number;
  market: string;
  category: string;
}

interface Market {
  id: string;
  name: string;
  distance: string;
  crops: number;
  lat: number;
  lng: number;
}

interface BestOpportunity {
  crop: string;
  change: number;
  message: string;
  advice: string;
}

interface MarketData {
  prices: CropPrice[];
  nearbyMarkets: Market[];
  bestOpportunity: BestOpportunity | null;
  lastUpdated: string;
  location: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'cereals', label: 'Cereals' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'spices', label: 'Spices' },
  { id: 'oilseeds', label: 'Oilseeds' },
  { id: 'plantation', label: 'Plantation' },
  { id: 'commercial', label: 'Commercial' },
];

export default function Market() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMarketData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      
      let location = '';
      let userCrops: any[] = [];

      // Fetch user's location and crops
      if (user) {
        const [profileResult, farmsResult, cropsResult] = await Promise.all([
          supabase.from('profiles').select('location').eq('id', user.id).single(),
          supabase.from('farms').select('location').eq('user_id', user.id).limit(1),
          supabase.from('crops').select('name').eq('user_id', user.id),
        ]);

        location = profileResult.data?.location || farmsResult.data?.[0]?.location || '';
        userCrops = cropsResult.data || [];
      }

      const { data, error } = await supabase.functions.invoke('market-prices', {
        body: { location, userCrops },
      });

      if (error) throw error;

      setMarketData(data);
      
      if (showRefreshToast) {
        toast({
          title: "Prices updated",
          description: "Market prices have been refreshed",
        });
      }
    } catch (error) {
      console.error("Error fetching market data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch market prices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [user]);

  const formatLastUpdated = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  const filteredPrices = marketData?.prices.filter(
    p => selectedCategory === 'all' || p.category === selectedCategory
  ) || [];

  const openInMaps = (market: Market) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(market.name)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </header>
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">Market Prices</h1>
            <p className="text-xs text-muted-foreground">
              {marketData?.lastUpdated ? formatLastUpdated(marketData.lastUpdated) : 'Loading...'}
              {marketData?.location && ` • ${marketData.location}`}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchMarketData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={cn("w-4 h-4 mr-1", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Best Selling Opportunity */}
        {marketData?.bestOpportunity && (
          <Card className="overflow-hidden">
            <div className="gradient-harvest p-5">
              <p className="text-sm opacity-80">Best Selling Opportunity</p>
              <h3 className="text-xl font-bold mt-1">{marketData.bestOpportunity.message}</h3>
              <p className="text-sm mt-2 opacity-90">{marketData.bestOpportunity.advice}</p>
            </div>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="shrink-0"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Current Prices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Current Crop Prices
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredPrices.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredPrices.slice(0, 15).map((crop) => (
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
                    ₹{crop.price.toLocaleString('en-IN')}
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
                    {crop.change >= 0 ? '+' : ''}{crop.change}%
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
            {marketData?.nearbyMarkets.map((market) => (
              <div
                key={market.id}
                onClick={() => openInMaps(market)}
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
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
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
