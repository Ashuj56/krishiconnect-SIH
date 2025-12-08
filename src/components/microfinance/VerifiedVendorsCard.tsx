import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, 
  MapPin, 
  FileText, 
  Building2, 
  Search,
  Phone,
  Mail,
  Percent,
  Calendar
} from "lucide-react";

interface Vendor {
  id: string;
  district: string;
  license_number: string;
  license_holder: string;
  business_name: string;
  business_address: string;
  is_verified: boolean;
  interest_rate?: number;
  loan_term_months?: number;
  contact_no?: string;
  email?: string;
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
            Showing lenders in {userDistrict} and other districts
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lenders..."
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
            <p>No lenders found matching your criteria</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-3">
                  {/* Header */}
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
                    </div>
                  </div>

                  {/* Interest Rate & Loan Term Badges */}
                  <div className="flex flex-wrap gap-2">
                    {vendor.interest_rate && (
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1">
                        <Percent className="h-3 w-3" />
                        {vendor.interest_rate}% Interest
                      </Badge>
                    )}
                    {vendor.loan_term_months && (
                      <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-200 gap-1">
                        <Calendar className="h-3 w-3" />
                        {vendor.loan_term_months} Months Term
                      </Badge>
                    )}
                  </div>

                  {/* License & Location */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {vendor.license_number}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {vendor.district}
                    </span>
                  </div>

                  {/* Address */}
                  <p className="text-sm text-muted-foreground">
                    📍 {vendor.business_address}
                  </p>

                  {/* Contact Details */}
                  <div className="flex flex-wrap gap-3 pt-2 border-t">
                    {vendor.contact_no && (
                      <a 
                        href={`tel:${vendor.contact_no}`}
                        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {vendor.contact_no}
                      </a>
                    )}
                    {vendor.email && (
                      <a 
                        href={`mailto:${vendor.email}`}
                        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        {vendor.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}