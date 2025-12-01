import { FileText, CheckCircle, Clock, ArrowRight, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Scheme {
  id: string;
  name: string;
  department: string;
  benefit: string;
  eligibility: "eligible" | "check" | "not-eligible";
  deadline?: string;
  status?: "applied" | "approved" | "pending";
}

const schemes: Scheme[] = [
  {
    id: "1",
    name: "PM-KISAN",
    department: "Ministry of Agriculture",
    benefit: "₹6,000/year direct transfer",
    eligibility: "eligible",
    status: "approved",
  },
  {
    id: "2",
    name: "Crop Insurance (PMFBY)",
    department: "Agriculture Insurance",
    benefit: "Up to ₹2 lakh coverage",
    eligibility: "eligible",
    deadline: "Dec 31, 2024",
  },
  {
    id: "3",
    name: "KCC Loan",
    department: "Banks/Cooperatives",
    benefit: "Low interest crop loan",
    eligibility: "check",
  },
  {
    id: "4",
    name: "Organic Farming Scheme",
    department: "State Agriculture Dept",
    benefit: "₹50,000/ha subsidy",
    eligibility: "eligible",
    deadline: "Jan 15, 2025",
  },
  {
    id: "5",
    name: "Drip Irrigation Subsidy",
    department: "Horticulture Dept",
    benefit: "55-75% subsidy",
    eligibility: "check",
  },
];

const eligibilityStyles = {
  eligible: { bg: "bg-success/10", text: "text-success", label: "Eligible" },
  check: { bg: "bg-warning/10", text: "text-warning", label: "Check Eligibility" },
  "not-eligible": { bg: "bg-muted", text: "text-muted-foreground", label: "Not Eligible" },
};

export default function Schemes() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">Government Schemes</h1>
            <p className="text-xs text-muted-foreground">Benefits & subsidies for farmers</p>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Applied Schemes Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-success">1</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-warning">0</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">4</p>
            <p className="text-xs text-muted-foreground">Eligible</p>
          </Card>
        </div>

        {/* Your Applications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Your Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">PM-KISAN</h4>
                  <p className="text-sm text-muted-foreground">Ministry of Agriculture</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-success text-success-foreground font-medium">
                  Approved
                </span>
              </div>
              <p className="text-sm mt-2">
                Next installment: <span className="font-medium">₹2,000 in January 2025</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Available Schemes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Available Schemes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {schemes.filter(s => !s.status).map((scheme) => {
              const style = eligibilityStyles[scheme.eligibility];
              return (
                <div
                  key={scheme.id}
                  className="p-4 rounded-xl border bg-card hover:shadow-card transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{scheme.name}</h4>
                      <p className="text-xs text-muted-foreground">{scheme.department}</p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      style.bg, style.text
                    )}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm text-primary font-medium">{scheme.benefit}</p>
                  {scheme.deadline && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Deadline: {scheme.deadline}
                    </div>
                  )}
                  <div className="flex items-center justify-end mt-2">
                    <Button variant="ghost" size="sm" className="text-primary group-hover:translate-x-1 transition-transform">
                      Apply Now <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Document Repository */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Documents Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Keep these documents ready for scheme applications
            </p>
            <div className="space-y-2">
              {["Aadhaar Card", "Land Records", "Bank Passbook", "Caste Certificate"].map((doc) => (
                <div key={doc} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">{doc}</span>
                  <Button variant="ghost" size="sm">Upload</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
