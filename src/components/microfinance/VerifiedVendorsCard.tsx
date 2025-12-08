import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, 
  MapPin, 
  FileText, 
  Building2, 
  Search,
  Phone
} from "lucide-react";

interface Vendor {
  id: string;
  district: string;
  license_number: string;
  license_holder: string;
  business_name: string;
  business_address: string;
  is_verified: boolean;
}

interface VerifiedVendorsCardProps {
  vendors: Vendor[];
  isLoading?: boolean;
  userDistrict?: string;
}

export function VerifiedVendorsCard({ vendors, isLoading, userDistrict }: VerifiedVendorsCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  const districts = [...new Set(vendors.map(v => v.district))].sort();

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.license_holder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.business_address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDistrict = selectedDistrict === "all" || vendor.district === selectedDistrict;
    
    return matchesSearch && matchesDistrict;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Licensed Money Lenders
          <Badge variant="secondary" className="ml-auto">
            {vendors.length} Lenders
          </Badge>
        </CardTitle>
        {userDistrict && (
          <p className="text-sm text-muted-foreground">
            Showing vendors in {userDistrict} and other districts
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All Districts</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Vendor List */}
        {filteredVendors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No vendors found matching your criteria</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base">
                        {vendor.business_name}
                      </h3>
                      {vendor.is_verified && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-200 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">License Holder:</span> {vendor.license_holder}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {vendor.license_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {vendor.district}
                      </span>
                    </div>

                    <p className="text-sm mt-2 text-muted-foreground">
                      📍 {vendor.business_address}
                    </p>
                  </div>

                  <Button variant="outline" size="sm" className="shrink-0">
                    <Phone className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
