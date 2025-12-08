import React, { useState, useMemo } from 'react';
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
  ChevronRight
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

// Dummy data for vendors
const vendorsData = [
  {
    id: 1,
    name: "Kerala Agro Chemicals",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 342,
    location: "Thrissur, Kerala",
    distance: "2.3 km",
    deliveryTime: "30-45 min",
    tags: ["Verified", "Fast Delivery", "Bulk Orders"],
    isPromoted: true,
    products: [
      { name: "Neem Oil Organic", price: 280, originalPrice: 350, type: "Bio-Pesticide", crop: "Vegetables", inStock: true },
      { name: "Chlorpyrifos 20% EC", price: 450, type: "Insecticide", crop: "Paddy", inStock: true },
      { name: "Mancozeb 75% WP", price: 320, type: "Fungicide", crop: "Coconut", inStock: false },
    ]
  },
  {
    id: 2,
    name: "Green Shield Agri Store",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop",
    rating: 4.3,
    reviews: 189,
    location: "Ernakulam, Kerala",
    distance: "4.1 km",
    deliveryTime: "45-60 min",
    tags: ["Organic Specialist", "Bulk Orders"],
    isPromoted: false,
    products: [
      { name: "Trichoderma Powder", price: 180, type: "Bio-Pesticide", crop: "All Crops", inStock: true },
      { name: "Copper Oxychloride 50%", price: 290, originalPrice: 340, type: "Fungicide", crop: "Spices", inStock: true },
      { name: "Glyphosate 41% SL", price: 520, type: "Herbicide", crop: "All Crops", inStock: true },
    ]
  },
  {
    id: 3,
    name: "Farmer's Choice Pesticides",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 567,
    location: "Palakkad, Kerala",
    distance: "1.8 km",
    deliveryTime: "20-30 min",
    tags: ["Top Rated", "Verified", "Fast Delivery"],
    isPromoted: true,
    products: [
      { name: "Imidacloprid 17.8%", price: 380, type: "Insecticide", crop: "Banana", inStock: true },
      { name: "Carbendazim 50% WP", price: 260, type: "Fungicide", crop: "Paddy", inStock: true },
      { name: "2,4-D Amine Salt", price: 195, originalPrice: 250, type: "Herbicide", crop: "Paddy", inStock: true },
    ]
  },
  {
    id: 4,
    name: "Bio Agri Solutions",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
    rating: 4.5,
    reviews: 234,
    location: "Kottayam, Kerala",
    distance: "5.6 km",
    deliveryTime: "50-70 min",
    tags: ["100% Organic", "Eco-Friendly"],
    isPromoted: false,
    products: [
      { name: "Beauveria Bassiana", price: 220, type: "Bio-Pesticide", crop: "Coconut", inStock: true },
      { name: "Pseudomonas fluorescens", price: 195, type: "Bio-Pesticide", crop: "Vegetables", inStock: true },
      { name: "Neem Cake Powder", price: 150, originalPrice: 180, type: "Bio-Pesticide", crop: "All Crops", inStock: true },
    ]
  },
  {
    id: 5,
    name: "Agri Max Traders",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop",
    rating: 4.1,
    reviews: 156,
    location: "Kozhikode, Kerala",
    distance: "3.2 km",
    deliveryTime: "35-50 min",
    tags: ["Wide Range", "Competitive Prices"],
    isPromoted: false,
    products: [
      { name: "Malathion 50% EC", price: 310, type: "Insecticide", crop: "Vegetables", inStock: true },
      { name: "Hexaconazole 5% EC", price: 420, type: "Fungicide", crop: "Spices", inStock: false },
      { name: "Pendimethalin 30% EC", price: 480, type: "Herbicide", crop: "Paddy", inStock: true },
    ]
  },
  {
    id: 6,
    name: "Kerala Organic Agro",
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 423,
    location: "Alappuzha, Kerala",
    distance: "6.8 km",
    deliveryTime: "60-80 min",
    tags: ["Premium Quality", "Organic Certified"],
    isPromoted: true,
    products: [
      { name: "Azadirachtin 0.03%", price: 340, type: "Bio-Pesticide", crop: "All Crops", inStock: true },
      { name: "Bacillus thuringiensis", price: 280, type: "Bio-Pesticide", crop: "Vegetables", inStock: true },
      { name: "Fish Amino Acid", price: 190, originalPrice: 230, type: "Bio-Pesticide", crop: "All Crops", inStock: true },
    ]
  }
];

// Filter options
const pesticideTypes = ["Insecticide", "Fungicide", "Herbicide", "Bio-Pesticide"];
const cropTypes = ["Paddy", "Coconut", "Banana", "Vegetables", "Spices", "All Crops"];
const compositions = ["Neem Based", "Chlorpyrifos", "Mancozeb", "Glyphosate", "Copper Oxychloride"];
const priceRanges = [
  { label: "Below ₹300", min: 0, max: 300 },
  { label: "₹300 - ₹700", min: 300, max: 700 },
  { label: "Above ₹700", min: 700, max: Infinity }
];
const ratingFilters = ["4.5+", "4.0+", "3.5+"];
const availabilityFilters = ["In Stock", "Bulk Order", "Fast Delivery"];

const PesticideDistribution = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Thrissur, Kerala");
  const [activeTab, setActiveTab] = useState("pesticides");
  const [showLocationInput, setShowLocationInput] = useState(false);
  
  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedCompositions, setSelectedCompositions] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  
  // Sort state
  const [sortBy, setSortBy] = useState("relevance");

  // Active filters count
  const activeFiltersCount = 
    selectedTypes.length + 
    selectedCrops.length + 
    selectedCompositions.length + 
    (selectedPriceRange ? 1 : 0) + 
    (selectedRating ? 1 : 0) + 
    selectedAvailability.length;

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedCrops([]);
    setSelectedCompositions([]);
    setSelectedPriceRange(null);
    setSelectedRating(null);
    setSelectedAvailability([]);
  };

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    let result = [...vendorsData];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(vendor => 
        vendor.name.toLowerCase().includes(query) ||
        vendor.products.some(p => p.name.toLowerCase().includes(query) || p.type.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (selectedTypes.length > 0) {
      result = result.filter(vendor => 
        vendor.products.some(p => selectedTypes.includes(p.type))
      );
    }

    // Crop filter
    if (selectedCrops.length > 0) {
      result = result.filter(vendor => 
        vendor.products.some(p => selectedCrops.includes(p.crop) || p.crop === "All Crops")
      );
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
      result = result.filter(vendor => vendor.tags.includes("Bulk Orders"));
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "distance":
        result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      case "delivery":
        result.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
        break;
      default:
        // Relevance: promoted first, then by rating
        result.sort((a, b) => {
          if (a.isPromoted && !b.isPromoted) return -1;
          if (!a.isPromoted && b.isPromoted) return 1;
          return b.rating - a.rating;
        });
    }

    return result;
  }, [searchQuery, selectedTypes, selectedCrops, selectedRating, selectedAvailability, sortBy]);

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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          {/* Location & Search Row */}
          <div className="flex items-center gap-3">
            {/* Location Selector */}
            <div className="relative">
              {showLocationInput ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-48 h-10 text-sm"
                    placeholder="Enter location..."
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setShowLocationInput(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-1 text-foreground hover:bg-muted px-2"
                  onClick={() => setShowLocationInput(true)}
                >
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm max-w-[120px] truncate">{location}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pesticide, vendor or chemical..."
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-12 bg-transparent border-0 gap-1 p-0">
              <TabsTrigger 
                value="pesticides" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-4 py-3 data-[state=active]:shadow-none"
              >
                <Bug className="h-4 w-4 mr-2" />
                Pesticides
              </TabsTrigger>
              <TabsTrigger 
                value="fertilizers" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:shadow-none text-muted-foreground"
                disabled
              >
                <Droplets className="h-4 w-4 mr-2" />
                Fertilizers
              </TabsTrigger>
              <TabsTrigger 
                value="seeds" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:shadow-none text-muted-foreground"
                disabled
              >
                <Sprout className="h-4 w-4 mr-2" />
                Seeds
              </TabsTrigger>
              <TabsTrigger 
                value="equipment" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 data-[state=active]:shadow-none text-muted-foreground"
                disabled
              >
                <Package className="h-4 w-4 mr-2" />
                Equipment
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
              {/* Filter Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 shrink-0">
                    <Filter className="h-4 w-4" />
                    Filters
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
                    { value: "delivery", label: "Delivery Time" }
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

              {/* Pesticide Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={selectedTypes.length > 0 ? "default" : "outline"} 
                    size="sm" 
                    className="gap-1 shrink-0"
                  >
                    Pesticide Type
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-popover">
                  {pesticideTypes.map(type => (
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

              {/* Crop Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={selectedCrops.length > 0 ? "default" : "outline"} 
                    size="sm" 
                    className="gap-1 shrink-0"
                  >
                    Crop Type
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-popover">
                  {cropTypes.map(crop => (
                    <DropdownMenuCheckboxItem
                      key={crop}
                      checked={selectedCrops.includes(crop)}
                      onCheckedChange={() => toggleFilter(crop, selectedCrops, setSelectedCrops)}
                    >
                      {crop}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Chemical Composition Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={selectedCompositions.length > 0 ? "default" : "outline"} 
                    size="sm" 
                    className="gap-1 shrink-0"
                  >
                    Composition
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-popover">
                  {compositions.map(comp => (
                    <DropdownMenuCheckboxItem
                      key={comp}
                      checked={selectedCompositions.includes(comp)}
                      onCheckedChange={() => toggleFilter(comp, selectedCompositions, setSelectedCompositions)}
                    >
                      {comp}
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
                  Clear All
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
            Pesticides Available Near You
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredVendors.length} vendors found in {location}
          </p>
        </div>

        {/* Vendor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>

        {/* No Results */}
        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <Bug className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
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

// Vendor Card Component
interface VendorCardProps {
  vendor: typeof vendorsData[0];
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor }) => {
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
          <span>{vendor.distance}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {vendor.tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs font-normal px-2 py-0.5"
            >
              {tag === "Verified" && <ShieldCheck className="h-3 w-3 mr-1" />}
              {tag === "Fast Delivery" && <Truck className="h-3 w-3 mr-1" />}
              {tag === "100% Organic" && <Leaf className="h-3 w-3 mr-1" />}
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
