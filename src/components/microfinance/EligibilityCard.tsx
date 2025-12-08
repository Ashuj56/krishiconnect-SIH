import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, TrendingUp, Shield } from "lucide-react";

interface EligibilityCardProps {
  category: string;
  loanLimit: string;
  loanLimitAmount: number;
  vendorTypes: string[];
  isLoading?: boolean;
}

export function EligibilityCard({ 
  category, 
  loanLimit, 
  loanLimitAmount, 
  vendorTypes,
  isLoading 
}: EligibilityCardProps) {
  const getCategoryColor = (cat: string) => {
    if (cat.includes('Small')) return 'bg-blue-500/10 text-blue-600 border-blue-200';
    if (cat.includes('Medium')) return 'bg-green-500/10 text-green-600 border-green-200';
    return 'bg-purple-500/10 text-purple-600 border-purple-200';
  };

  const getCategoryIcon = (cat: string) => {
    if (cat.includes('Small')) return '🌱';
    if (cat.includes('Medium')) return '🌾';
    return '🚜';
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Your Loan Eligibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category and Limit */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 p-4 rounded-xl bg-background border">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Farmer Category</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getCategoryIcon(category)}</span>
              <Badge className={`${getCategoryColor(category)} border`}>
                {category}
              </Badge>
            </div>
          </div>

          <div className="flex-1 p-4 rounded-xl bg-background border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Maximum Loan Limit</span>
            </div>
            <p className="text-2xl font-bold text-primary">{loanLimit}</p>
          </div>
        </div>

        {/* Recommended Vendor Types */}
        <div className="p-4 rounded-xl bg-background border">
          <p className="text-sm text-muted-foreground mb-2">Recommended Services</p>
          <div className="flex flex-wrap gap-2">
            {vendorTypes.map((type, idx) => (
              <Badge key={idx} variant="secondary">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
