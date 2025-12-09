import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X, 
  Bell, 
  Loader2,
  Cloud,
  Leaf,
  Calendar,
  TrendingUp,
  FileText,
  Activity,
  RefreshCw,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface SmartAlert {
  id: string;
  title: string;
  message: string;
  category: 'weather' | 'crop' | 'season' | 'market' | 'scheme' | 'activity' | 'general';
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

const categoryConfig = {
  weather: {
    icon: Cloud,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-800",
    label: "Weather"
  },
  crop: {
    icon: Leaf,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-800",
    label: "Crop"
  },
  season: {
    icon: Calendar,
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    border: "border-orange-200 dark:border-orange-800",
    label: "Season"
  },
  market: {
    icon: TrendingUp,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-200 dark:border-purple-800",
    label: "Market"
  },
  scheme: {
    icon: FileText,
    color: "text-indigo-500",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    border: "border-indigo-200 dark:border-indigo-800",
    label: "Scheme"
  },
  activity: {
    icon: Activity,
    color: "text-teal-500",
    bg: "bg-teal-100 dark:bg-teal-900/30",
    border: "border-teal-200 dark:border-teal-800",
    label: "Activity"
  },
  general: {
    icon: Bell,
    color: "text-gray-500",
    bg: "bg-gray-100 dark:bg-gray-900/30",
    border: "border-gray-200 dark:border-gray-800",
    label: "General"
  }
};

export function SmartAlertsCard() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchAlerts();
    generateSmartAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAlerts((data as SmartAlert[]) || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartAlerts = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase.functions.invoke('smart-alerts', {
        body: { farmer_id: user.id }
      });

      if (error) {
        console.error('Error generating alerts:', error);
      } else {
        // Refetch alerts after generation
        await fetchAlerts();
      }
    } catch (error) {
      console.error('Error invoking smart-alerts:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await generateSmartAlerts();
    setRefreshing(false);
    toast.success('Alerts refreshed');
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      
      setAlerts(prev => 
        prev.map(a => a.id === id ? { ...a, is_read: true } : a)
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const dismissAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('farmer_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      toast.success('All alerts marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const filteredAlerts = activeCategory === 'all' 
    ? alerts 
    : alerts.filter(a => a.category === activeCategory);

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const categories = ['all', 'weather', 'crop', 'market', 'scheme', 'season', 'activity'];

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
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Smart Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const config = cat === 'all' ? null : categoryConfig[cat as keyof typeof categoryConfig];
            const count = cat === 'all' 
              ? alerts.length 
              : alerts.filter(a => a.category === cat).length;
            
            return (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                className={cn(
                  "text-xs capitalize whitespace-nowrap",
                  activeCategory === cat && "bg-primary"
                )}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? <Filter className="w-3 h-3 mr-1" /> : null}
                {config?.label || 'All'}
                {count > 0 && (
                  <span className="ml-1 text-xs opacity-70">({count})</span>
                )}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No alerts in this category</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const config = categoryConfig[alert.category] || categoryConfig.general;
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                  config.bg,
                  config.border,
                  !alert.is_read && "ring-2 ring-primary/20"
                )}
                onClick={() => !alert.is_read && markAsRead(alert.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 p-1.5 rounded-full", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        {!alert.is_read && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <button 
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-xs capitalize">
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
