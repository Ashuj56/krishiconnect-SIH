import { useState, useEffect } from "react";
import { AlertTriangle, Info, Sprout, CloudRain, Bug, Droplets, Thermometer, Loader2, RefreshCw, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface Advisory {
  id: string;
  type: "warning" | "danger" | "info";
  category: string;
  icon: string;
  title: string;
  titleMl: string;
  description: string;
  descriptionMl: string;
  priority: string;
  crop?: string;
  symptoms?: string;
  control?: string;
  daysSinceSowing?: number;
}

const iconMap: Record<string, React.ElementType> = {
  Sprout: Sprout,
  CloudRain: CloudRain,
  Bug: Bug,
  Droplets: Droplets,
  Droplet: Droplets,
  Thermometer: Thermometer,
  Info: Info,
  AlertTriangle: AlertTriangle,
  Lightbulb: Lightbulb,
};

const typeStyles = {
  warning: {
    bg: "bg-warning/5",
    border: "border-l-warning",
    iconBg: "bg-warning/20",
    iconColor: "text-warning",
  },
  danger: {
    bg: "bg-destructive/5",
    border: "border-l-destructive",
    iconBg: "bg-destructive/20",
    iconColor: "text-destructive",
  },
  info: {
    bg: "bg-primary/5",
    border: "border-l-primary",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
  },
};

export function PersonalizedAdvisory() {
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();

  const fetchAdvisories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('farm-advisory', {
        body: { userId: user.id, language },
      });

      if (error) throw error;

      if (data?.advisories) {
        setAdvisories(data.advisories);
      }
    } catch (error) {
      console.error('Error fetching advisories:', error);
      // Set default advisories if API fails
      setAdvisories([
        {
          id: 'welcome',
          type: 'info',
          category: 'general',
          icon: 'Lightbulb',
          title: 'Welcome to Smart Advisory',
          titleMl: 'സ്മാർട്ട് ഉപദേശത്തിലേക്ക് സ്വാഗതം',
          description: 'Add your crops with sowing dates to get personalized recommendations.',
          descriptionMl: 'വ്യക്തിഗത ശുപാർശകൾക്കായി നിങ്ങളുടെ വിളകൾ വിതയ്ക്കൽ തീയതികളോടെ ചേർക്കുക.',
          priority: 'low',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAdvisories();
    }
  }, [user, language]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdvisories();
  };

  const isMalayalam = language === 'ml';

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {isMalayalam ? 'സ്മാർട്ട് ഉപദേശം' : 'Smart Advisory'}
          </h2>
          <span className="text-sm text-muted-foreground font-malayalam">
            {isMalayalam ? '' : 'ഉപദേശങ്ങൾ'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-primary"
        >
          <RefreshCw className={cn("w-4 h-4 mr-1", refreshing && "animate-spin")} />
          {isMalayalam ? 'പുതുക്കുക' : 'Refresh'}
        </Button>
      </div>

      {advisories.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center">
            <Lightbulb className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              {isMalayalam 
                ? 'ഇപ്പോൾ ഉപദേശങ്ങളൊന്നുമില്ല'
                : 'No advisories at this time'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {advisories.map((advisory) => {
            const style = typeStyles[advisory.type] || typeStyles.info;
            const IconComponent = iconMap[advisory.icon] || Info;

            return (
              <Card
                key={advisory.id}
                className={cn(
                  "border-l-4 transition-all duration-200 hover:shadow-md overflow-hidden",
                  style.bg,
                  style.border
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg shrink-0", style.iconBg)}>
                      <IconComponent className={cn("w-5 h-5", style.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm">
                            {isMalayalam ? advisory.titleMl || advisory.title : advisory.title}
                          </h3>
                          {advisory.crop && (
                            <span className="text-xs text-muted-foreground">
                              {advisory.crop}
                            </span>
                          )}
                        </div>
                        {advisory.daysSinceSowing !== undefined && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                            {isMalayalam 
                              ? `ദിവസം ${advisory.daysSinceSowing}`
                              : `Day ${advisory.daysSinceSowing}`}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isMalayalam 
                          ? advisory.descriptionMl || advisory.description 
                          : advisory.description}
                      </p>
                      {advisory.symptoms && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {isMalayalam ? 'ലക്ഷണങ്ങൾ: ' : 'Symptoms: '}
                          {advisory.symptoms}
                        </p>
                      )}
                      {advisory.control && (
                        <p className="text-xs text-primary mt-1 font-medium">
                          {isMalayalam ? 'നിയന്ത്രണം: ' : 'Control: '}
                          {advisory.control}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          advisory.priority === 'high' && "bg-destructive/20 text-destructive",
                          advisory.priority === 'medium' && "bg-warning/20 text-warning",
                          advisory.priority === 'low' && "bg-muted text-muted-foreground"
                        )}>
                          {isMalayalam 
                            ? (advisory.priority === 'high' ? 'ഉയർന്ന' : advisory.priority === 'medium' ? 'മധ്യം' : 'താഴ്ന്ന')
                            : advisory.priority}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {advisory.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
