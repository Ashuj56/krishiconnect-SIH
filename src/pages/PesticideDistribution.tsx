import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  FileText,
  X,
  ShieldCheck,
  Building2,
  User,
  Calendar,
  Package
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  searchDealers,
  getDistrictNames,
  productTypes,
  DealerWithDistrict
} from '@/data/agriDistributorsData';

const PesticideDistribution = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  const districts = useMemo(() => getDistrictNames(), []);

  // Filter dealers based on search, district and product
  const filteredDealers = useMemo(() => {
    return searchDealers(searchQuery, selectedDistrict, selectedProduct);
  }, [searchQuery, selectedDistrict, selectedProduct]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDistrict("all");
    setSelectedProduct("all");
  };

  const hasActiveFilters = searchQuery || selectedDistrict !== "all" || selectedProduct !== "all";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* District Selector */}
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-auto min-w-[140px] border-0 bg-muted/50 hover:bg-muted">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="All Districts" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map(district => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Product Filter */}
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-auto min-w-[140px] border-0 bg-muted/50 hover:bg-muted">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="All Products" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Products</SelectItem>
                {productTypes.map(product => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Bar */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search distributors..."
                className="pl-10 h-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="shrink-0 text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Section Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Agri Distributors
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredDealers.length} licensed distributors found
            {selectedDistrict !== "all" && ` in ${selectedDistrict}`}
            {selectedProduct !== "all" && ` with ${selectedProduct}`}
          </p>
        </div>

        {/* Dealer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDealers.map((dealer, index) => (
            <DealerCard key={`${dealer.district}-${dealer.sn}-${index}`} dealer={dealer} />
          ))}
        </div>

        {/* No Results */}
        {filteredDealers.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No distributors found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Dealer Card Component
interface DealerCardProps {
  dealer: DealerWithDistrict;
}

const DealerCard: React.FC<DealerCardProps> = ({ dealer }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Banner Image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={dealer.bannerImage}
          alt={dealer.unit_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs">
          {dealer.district}
        </Badge>
        <Badge className="absolute top-2 right-2 bg-success/90 text-white text-xs flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Licensed
        </Badge>
      </div>

      <CardContent className="p-4">
        {/* Dealer Name */}
        <h3 className="font-semibold text-foreground text-lg leading-tight mb-2 line-clamp-2">
          {dealer.unit_name}
        </h3>

        {/* Owner Name */}
        {dealer.owner_name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{dealer.owner_name}</span>
          </div>
        )}

        {/* Address */}
        {dealer.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{dealer.address}</span>
          </div>
        )}

        {/* Products */}
        <div className="flex flex-wrap gap-1 mb-3">
          {dealer.products.slice(0, 3).map((product) => (
            <Badge key={product} variant="secondary" className="text-xs">
              {product}
            </Badge>
          ))}
          {dealer.products.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{dealer.products.length - 3} more
            </Badge>
          )}
        </div>

        {/* License Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <FileText className="h-3 w-3 shrink-0" />
          <span className="truncate">{dealer.license_number}</span>
        </div>

        {/* Validity */}
        {dealer.validity && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>Valid: {dealer.validity}</span>
          </div>
        )}

        {/* Contact Button */}
        {dealer.phone && (
          <a href={`tel:${dealer.phone}`} className="w-full">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Phone className="h-4 w-4" />
              {dealer.phone}
            </Button>
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default PesticideDistribution;
