import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Star, 
  Truck, 
  Package, 
  Filter,
  X,
  Clock,
  ShieldCheck,
  Leaf,
  Droplets,
  Bug,
  Sprout,
  ChevronRight,
  Wrench,
  Navigation
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getVendorsByCategory,
  getCategoryTitle,
  filterOptions,
  priceRanges,
  ratingFilters,
  availabilityFilters,
  keralaLocations,
  getLocationCoordinates,
  calculateDistance,
  Vendor,
} from '@/data/agroMarketplaceData';

type CategoryType = 'pesticides' | 'fertilizers' | 'seeds' | 'equipment';

const PesticideDistribution = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Thrissur, Kerala");
  const [activeTab, setActiveTab] = useState<CategoryType>("pesticides");
  
  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSecondary, setSelectedSecondary] = useState<string[]>([]); // crops/brands/varieties
  const [selectedTertiary, setSelectedTertiary] = useState<string[]>([]); // compositions/forms/features
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  
  // Sort state
  const [sortBy, setSortBy] = useState("relevance");

  // Get user coordinates based on selected location
  const userCoords = useMemo(() => getLocationCoordinates(location), [location]);

  // Get current category filter options
  const currentFilters = useMemo(() => {
    return filterOptions[activeTab];
  }, [activeTab]);

  // Get filter labels based on category
  const getFilterLabels = useCallback(() => {
    switch (activeTab) {
      case 'pesticides':
        return { primary: 'Pesticide Type', secondary: 'Crop Type', tertiary: 'Composition' };
      case 'fertilizers':
        return { primary: 'Fertilizer Type', secondary: 'Brand', tertiary: 'Form' };
      case 'seeds':
        return { primary: 'Seed Type', secondary: 'Variety', tertiary: 'Brand' };
      case 'equipment':
        return { primary: 'Equipment Type', secondary: 'Brand', tertiary: 'Features' };
      default:
        return { primary: 'Type', secondary: 'Category', tertiary: 'Other' };
    }
  }, [activeTab]);

  // Clear filters when changing tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as CategoryType);
    setSelectedTypes([]);
    setSelectedSecondary([]);
    setSelectedTertiary([]);
    setSelectedPriceRange(null);
    setSelectedRating(null);
    setSelectedAvailability([]);
    setSearchQuery("");
  };

  // Active filters count
  const activeFiltersCount = 
    selectedTypes.length + 
    selectedSecondary.length + 
    selectedTertiary.length + 
    (selectedPriceRange ? 1 : 0) + 
    (selectedRating ? 1 : 0) + 
    selectedAvailability.length +
    (maxDistance ? 1 : 0);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedSecondary([]);
    setSelectedTertiary([]);
    setSelectedPriceRange(null);
    setSelectedRating(null);
    setSelectedAvailability([]);
    setMaxDistance(null);
  };

  // Filter and sort vendors with distance calculation
  const filteredVendors = useMemo(() => {
    let vendors = getVendorsByCategory(activeTab);
    
    // Calculate distance for each vendor
    let result = vendors.map(vendor => ({
      ...vendor,
      calculatedDistance: calculateDistance(
        userCoords.lat,
        userCoords.lng,
        vendor.coordinates.lat,
        vendor.coordinates.lng
      )
    }));

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(vendor => 
        vendor.name.toLowerCase().includes(query) ||
        vendor.products.some(p => 
          p.name.toLowerCase().includes(query) || 
          p.type.toLowerCase().includes(query) ||
          (p.brand && p.brand.toLowerCase().includes(query))
        )
      );
    }

    // Type filter
    if (selectedTypes.length > 0) {
      result = result.filter(vendor => 
        vendor.products.some(p => selectedTypes.includes(p.type))
      );
    }

    // Secondary filter (crops/brands/varieties based on category)
    if (selectedSecondary.length > 0) {
      result = result.filter(vendor => 
        vendor.products.some(p => {
          if (activeTab === 'pesticides') {
            return selectedSecondary.includes(p.crop || '') || p.crop === "All Crops";
          } else {
            return selectedSecondary.includes(p.brand || '');
          }
        })
      );
    }

    // Price range filter
    if (selectedPriceRange) {
      const range = priceRanges.find(r => r.label === selectedPriceRange);
      if (range) {
        result = result.filter(vendor => 
          vendor.products.some(p => p.price >= range.min && p.price < range.max)
        );
      }
    }

    // Rating filter
    if (selectedRating) {
      const minRating = parseFloat(selectedRating.replace("+", ""));
      result = result.filter(vendor => vendor.rating >= minRating);
    }

    // Availability filter
    if (selectedAvailability.includes("In Stock")) {
      result = result.filter(vendor => vendor.products.some(p => p.inStock));
    }
    if (selectedAvailability.includes("Fast Delivery")) {
      result = result.filter(vendor => vendor.tags.includes("Fast Delivery"));
    }
    if (selectedAvailability.includes("Bulk Order")) {
      result = result.filter(vendor => 
        vendor.tags.includes("Bulk Orders") || vendor.tags.includes("Bulk Order")
      );
    }

    // Distance filter
    if (maxDistance) {
      result = result.filter(vendor => vendor.calculatedDistance <= maxDistance);
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "distance":
        result.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
        break;
      case "delivery":
        result.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
        break;
      case "price-low":
        result.sort((a, b) => {
          const aMin = Math.min(...a.products.map(p => p.price));
          const bMin = Math.min(...b.products.map(p => p.price));
          return aMin - bMin;
        });
        break;
      case "price-high":
        result.sort((a, b) => {
          const aMax = Math.max(...a.products.map(p => p.price));
          const bMax = Math.max(...b.products.map(p => p.price));
          return bMax - aMax;
        });
        break;
      default:
        // Relevance: promoted first, then by rating, then by distance
        result.sort((a, b) => {
          if (a.isPromoted && !b.isPromoted) return -1;
          if (!a.isPromoted && b.isPromoted) return 1;
          if (b.rating !== a.rating) return b.rating - a.rating;
          return a.calculatedDistance - b.calculatedDistance;
        });
    }

    return result;
  }, [searchQuery, selectedTypes, selectedSecondary, selectedPriceRange, selectedRating, selectedAvailability, maxDistance, sortBy, activeTab, userCoords]);

  const toggleFilter = (
    item: string, 
    selected: string[], 
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const filterLabels = getFilterLabels();

  // Get secondary options based on category
  const getSecondaryOptions = (): string[] => {
    switch (activeTab) {
      case 'pesticides':
        return filterOptions.pesticides.crops;
      case 'fertilizers':
        return filterOptions.fertilizers.brands;
      case 'seeds':
        return filterOptions.seeds.varieties;
      case 'equipment':
        return filterOptions.equipment.brands;
      default:
        return [];
    }
  };

  // Get tertiary options based on category
  const getTertiaryOptions = (): string[] => {
    switch (activeTab) {
      case 'pesticides':
        return filterOptions.pesticides.compositions;
      case 'fertilizers':
        return filterOptions.fertilizers.forms;
      case 'seeds':
        return filterOptions.seeds.brands;
      case 'equipment':
        return filterOptions.equipment.features;
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          {/* Location & Search Row */}
          <div className="flex items-center gap-3">
            {/* Location Selector */}
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-auto min-w-[160px] border-0 bg-transparent hover:bg-muted">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Select location" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {keralaLocations.map(loc => (
                  <SelectItem key={loc} value={loc}>
                    <div className="flex items-center gap-2">
                      <Navigation className="h-3 w-3 text-muted-foreground" />
                      {loc}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}, vendor or brand...`}
                className="pl-10 h-10 bg-muted border-0 focus-visible:ring-1"
              />
            </div>

            {/* Login Button - Hidden on mobile */}
            <Button variant="outline" className="hidden md:flex gap-2 h-10">
              Login
            </Button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-card border-b border-border">
        <div className="container max-w-6xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="h-12 bg-transparent border-0 gap-1 p-0 w-full justify-start">
              <TabsTrigger 
                value="pesticides" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-4 py-3 data-[state=active]:shadow-none"
              >
                <Bug className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Pesticides</span>
                <span className="sm:hidden">Pest</span>
              </TabsTrigger>
              <TabsTrigger 
                value="fertilizers" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-4 py-3 data-[state=active]:shadow-none"
              >
                <Droplets className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Fertilizers</span>
                <span className="sm:hidden">Fert</span>
              </TabsTrigger>
              <TabsTrigger 
                value="seeds" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-4 py-3 data-[state=active]:shadow-none"
              >
                <Sprout className="h-4 w-4 mr-2" />
                Seeds
              </TabsTrigger>
              <TabsTrigger 
                value="equipment" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-4 py-3 data-[state=active]:shadow-none"
              >
                <Wrench className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Equipment</span>
                <span className="sm:hidden">Equip</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-card border-b border-border py-3">
        <div className="container max-w-6xl mx-auto px-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-center gap-2">
              {/* Sort & Filter Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 shrink-0">
                    <Filter className="h-4 w-4" />
                    Sort
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-popover">
                  <div className="p-2 text-sm font-medium text-muted-foreground">Sort By</div>
                  {[
                    { value: "relevance", label: "Relevance" },
                    { value: "rating", label: "Rating" },
                    { value: "distance", label: "Distance" },
                    { value: "delivery", label: "Delivery Time" },
                    { value: "price-low", label: "Price: Low to High" },
                    { value: "price-high", label: "Price: High to Low" }
                  ].map(option => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={sortBy === option.value}
                      onCheckedChange={() => setSortBy(option.value)}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Primary Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={selectedTypes.length > 0 ? "default" : "outline"} 
                    size="sm" 
                    className="gap-1 shrink-0"
                  >
                    {filterLabels.primary}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 bg-popover max-h-64 overflow-y-auto">
                  {currentFilters.types.map(type => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => toggleFilter(type, selectedTypes, setSelectedTypes)}
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Secondary Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={selectedSecondary.length > 0 ? "default" : "outline"} 
                    size="sm" 
                    className="gap-1 shrink-0"
                  >
                    {filterLabels.secondary}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-popover max-h-64 overflow-y-auto">
                  {getSecondaryOptions().map(item => (
                    <DropdownMenuCheckboxItem
                      key={item}
                      checked={selectedSecondary.includes(item)}
                      onCheckedChange={() => toggleFilter(item, selectedSecondary, setSelectedSecondary)}
                    >
                      {item}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tertiary Filter (hide on seeds to avoid duplicate brand filter) */}
              {activeTab !== 'seeds' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant={selectedTertiary.length > 0 ? "default" : "outline"} 
                      size="sm" 
                      className="gap-1 shrink-0"
                    >
                      {filterLabels.tertiary}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 bg-popover max-h-64 overflow-y-auto">
                    {getTertiaryOptions().map(item => (
                      <DropdownMenuCheckboxItem
                        key={item}
                        checked={selectedTertiary.includes(item)}
                        onCheckedChange={() => toggleFilter(item, selectedTertiary, setSelectedTertiary)}
                      >
                        {item}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Price Range Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={selectedPriceRange ? "default" : "outline"} 
                    size="sm" 
                    className="gap-1 shrink-0"
                  >
                    Price
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44 bg-popover">
                  {priceRanges.map(range => (
                    <DropdownMenuCheckboxItem
                      key={range.label}
                      checked={selectedPriceRange === range.label}
                      onCheckedChange={() => setSelectedPriceRange(selectedPriceRange === range.label ? null : range.label)}
                    >
                      {range.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Rating Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={selectedRating ? "default" : "outline"} 
                    size="sm" 
                    className="gap-1 shrink-0"
                  >
                    <Star className="h-3 w-3" />
                    Rating
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-36 bg-popover">
                  {ratingFilters.map(rating => (
                    <DropdownMenuCheckboxItem
                      key={rating}
                      checked={selectedRating === rating}
                      onCheckedChange={() => setSelectedRating(selectedRating === rating ? null : rating)}
                    >
                      {rating}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Distance Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={maxDistance ? "default" : "outline"} 
                    size="sm" 
                    className="gap-1 shrink-0"
                  >
                    <Navigation className="h-3 w-3" />
                    Distance
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40 bg-popover">
                  {[5, 10, 25, 50, 100].map(dist => (
                    <DropdownMenuCheckboxItem
                      key={dist}
                      checked={maxDistance === dist}
                      onCheckedChange={() => setMaxDistance(maxDistance === dist ? null : dist)}
                    >
                      Within {dist} km
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Availability Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={selectedAvailability.length > 0 ? "default" : "outline"} 
                    size="sm" 
                    className="gap-1 shrink-0"
                  >
                    Availability
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40 bg-popover">
                  {availabilityFilters.map(avail => (
                    <DropdownMenuCheckboxItem
                      key={avail}
                      checked={selectedAvailability.includes(avail)}
                      onCheckedChange={() => toggleFilter(avail, selectedAvailability, setSelectedAvailability)}
                    >
                      {avail}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Section Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {getCategoryTitle(activeTab)} Available Near You
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredVendors.length} vendors found in {location}
          </p>
        </div>

        {/* Vendor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} category={activeTab} />
          ))}
        </div>

        {/* No Results */}
        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <CategoryIcon category={activeTab} className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No vendors found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Category Icon Component
const CategoryIcon: React.FC<{ category: CategoryType; className?: string }> = ({ category, className }) => {
  switch (category) {
    case 'pesticides':
      return <Bug className={className} />;
    case 'fertilizers':
      return <Droplets className={className} />;
    case 'seeds':
      return <Sprout className={className} />;
    case 'equipment':
      return <Wrench className={className} />;
    default:
      return <Package className={className} />;
  }
};

// Vendor Card Component
interface VendorCardProps {
  vendor: Vendor & { calculatedDistance: number };
  category: CategoryType;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor, category }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
      {/* Image Section */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={vendor.image}
          alt={vendor.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {vendor.isPromoted && (
          <Badge className="absolute top-2 left-2 bg-harvest-gold text-foreground text-xs">
            Promoted
          </Badge>
        )}
        <div className="absolute bottom-2 right-2 bg-card/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium">{vendor.deliveryTime}</span>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Vendor Name & Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground text-lg leading-tight">{vendor.name}</h3>
          <div className="flex items-center gap-1 bg-primary text-primary-foreground rounded px-1.5 py-0.5 shrink-0">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-xs font-semibold">{vendor.rating}</span>
          </div>
        </div>

        {/* Location & Distance */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" />
          <span>{vendor.location}</span>
          <span>•</span>
          <span className="text-primary font-medium">{vendor.calculatedDistance} km</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {vendor.tags.slice(0, 3).map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs font-normal px-2 py-0.5"
            >
              {tag === "Verified" && <ShieldCheck className="h-3 w-3 mr-1" />}
              {tag === "Fast Delivery" && <Truck className="h-3 w-3 mr-1" />}
              {(tag === "100% Organic" || tag === "Organic Specialist" || tag === "Eco-Friendly") && <Leaf className="h-3 w-3 mr-1" />}
              {tag}
            </Badge>
          ))}
        </div>

        {/* Featured Products */}
        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted-foreground mb-2">Featured Products:</p>
          <div className="space-y-1.5">
            {vendor.products.slice(0, 2).map((product, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${product.inStock ? 'bg-success' : 'bg-destructive'}`} />
                  <span className="truncate text-foreground">{product.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {product.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
                  )}
                  <span className="font-semibold text-primary">₹{product.price}</span>
                </div>
              </div>
            ))}
          </div>
          <Button variant="link" className="p-0 h-auto mt-2 text-primary text-sm">
            View All Products <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PesticideDistribution;
