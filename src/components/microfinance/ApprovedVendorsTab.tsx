import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Clock, Phone, Package, ExternalLink } from "lucide-react";
import { vendors, vendorProducts } from "@/data/agroMarketplaceData";
import { useNavigate } from "react-router-dom";

export function ApprovedVendorsTab() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { value: 'all', label: 'All Vendors' },
    { value: 'Pesticides', label: 'Pesticides' },
    { value: 'Fertilizers', label: 'Fertilizers' },
    { value: 'Seeds', label: 'Seeds' },
    { value: 'Equipment', label: 'Equipment' },
  ];

  const filteredVendors = selectedCategory === 'all' 
    ? vendors 
    : vendors.filter(v => v.category === selectedCategory);

  const getVendorProducts = (vendorId: string) => {
    return vendorProducts.filter(p => p.vendorId === vendorId).slice(0, 3);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Approved Vendors</h2>
          <p className="text-sm text-muted-foreground">
            These vendors are eligible for loan-based product purchases
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/pesticides')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Full Marketplace
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-5 w-full">
          {categories.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredVendors.map(vendor => {
              const products = getVendorProducts(vendor.id);
              
              return (
                <Card key={vendor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{vendor.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{vendor.category}</Badge>
                          <div className="flex items-center text-sm">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                            {vendor.rating}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        Loan Eligible
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {vendor.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {vendor.deliveryTime}
                      </div>
                    </div>

                    {/* Product Preview */}
                    {products.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Available Products:</p>
                        <div className="space-y-1">
                          {products.map(product => (
                            <div key={product.id} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span>{product.name}</span>
                              </div>
                              <span className="font-medium text-primary">₹{product.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1" 
                        variant="outline"
                        onClick={() => navigate('/pesticides')}
                      >
                        View Products
                      </Button>
                      <Button className="flex-1">
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredVendors.length === 0 && (
            <Card className="text-center p-8">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-lg font-semibold mb-2">No Vendors Found</h3>
              <p className="text-muted-foreground">No vendors available in this category.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
