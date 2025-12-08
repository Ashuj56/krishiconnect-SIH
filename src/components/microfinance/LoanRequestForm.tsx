import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, IndianRupee, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { loanPurposes, cropStageFactors, calculateEligibility, calculateEMI, generateRepaymentSchedule, type EligibilityResult } from "@/data/microfinanceData";
import { vendors } from "@/data/agroMarketplaceData";

interface Crop {
  id: string;
  name: string;
  current_stage: string | null;
  area: number | null;
}

interface Lender {
  id: string;
  name: string;
  interest_rate: number;
  loan_limit: number;
  processing_fee: number;
  description: string | null;
}

interface SoilReport {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export function LoanRequestForm({ onSuccess, maxLoanAmount }: { onSuccess?: () => void; maxLoanAmount?: number }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [soilReport, setSoilReport] = useState<SoilReport | null>(null);
  const [landArea, setLandArea] = useState<number>(0);
  const [pastLoansCount, setPastLoansCount] = useState(0);
  
  // Form state
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [cropStage, setCropStage] = useState<string>("vegetative");
  const [purpose, setPurpose] = useState<string>("");
  const [requestedAmount, setRequestedAmount] = useState<string>("");
  const [selectedLender, setSelectedLender] = useState<string>("");
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  // Eligibility result
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load crops
      const { data: cropsData } = await supabase
        .from('crops')
        .select('id, name, current_stage, area')
        .eq('user_id', user!.id);
      setCrops(cropsData || []);

      // Load lenders
      const { data: lendersData } = await supabase
        .from('lenders')
        .select('*')
        .order('interest_rate');
      setLenders(lendersData || []);

      // Load latest soil report
      const { data: soilData } = await supabase
        .from('soil_reports')
        .select('ph, nitrogen, phosphorus, potassium')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setSoilReport(soilData);

      // Load farm area
      const { data: farmData } = await supabase
        .from('farms')
        .select('total_area')
        .eq('user_id', user!.id)
        .maybeSingle();
      setLandArea(farmData?.total_area || 0);

      // Count past loans
      const { count } = await supabase
        .from('farmer_loans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);
      setPastLoansCount(count || 0);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate eligibility when inputs change
  useEffect(() => {
    if (requestedAmount && parseFloat(requestedAmount) > 0) {
      const result = calculateEligibility({
        cropStage,
        soilPh: soilReport?.ph,
        soilNitrogen: soilReport?.nitrogen,
        soilPhosphorus: soilReport?.phosphorus,
        soilPotassium: soilReport?.potassium,
        landArea,
        requestedAmount: parseFloat(requestedAmount),
        pastLoansCount,
        pastDefaultsCount: 0,
      });
      setEligibility(result);
    } else {
      setEligibility(null);
    }
  }, [requestedAmount, cropStage, soilReport, landArea, pastLoansCount]);

  // Auto-set crop stage when crop is selected
  useEffect(() => {
    if (selectedCrop) {
      const crop = crops.find(c => c.id === selectedCrop);
      if (crop?.current_stage) {
        setCropStage(crop.current_stage.toLowerCase());
      }
    }
  }, [selectedCrop, crops]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !eligibility?.isEligible) return;

    setSubmitting(true);
    try {
      const selectedCropData = crops.find(c => c.id === selectedCrop);
      const selectedLenderData = lenders.find(l => l.id === selectedLender);
      const selectedVendorData = vendors.find(v => v.id === selectedVendor);
      
      const approvedAmount = Math.min(parseFloat(requestedAmount), eligibility.maxEligibleAmount);
      const interestRate = selectedLenderData?.interest_rate || eligibility.recommendedInterestRate;
      const duration = eligibility.recommendedDuration;
      const emi = calculateEMI(approvedAmount, interestRate, duration);
      
      const startDate = new Date();
      const nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      // Create loan record
      const { data: loanData, error: loanError } = await supabase
        .from('farmer_loans')
        .insert({
          user_id: user.id,
          lender_id: selectedLender || null,
          crop_id: selectedCrop || null,
          purpose,
          crop_name: selectedCropData?.name || null,
          requested_amount: parseFloat(requestedAmount),
          approved_amount: approvedAmount,
          interest_rate: interestRate,
          duration_months: duration,
          emi,
          start_date: startDate.toISOString().split('T')[0],
          next_due_date: nextDueDate.toISOString().split('T')[0],
          status: 'pending',
          vendor_id: selectedVendor || null,
          vendor_name: selectedVendorData?.name || null,
          eligibility_score: eligibility.eligibilityScore,
        })
        .select()
        .single();

      if (loanError) throw loanError;

      // Generate repayment schedule
      const schedule = generateRepaymentSchedule(approvedAmount, interestRate, duration, startDate);
      
      const repayments = schedule.map(item => ({
        loan_id: loanData.id,
        user_id: user.id,
        due_date: item.dueDate.toISOString().split('T')[0],
        amount: item.amount,
        status: 'pending',
      }));

      const { error: repaymentError } = await supabase
        .from('loan_repayments')
        .insert(repayments);

      if (repaymentError) throw repaymentError;

      toast({
        title: "Loan Request Submitted",
        description: `Your loan request for ₹${approvedAmount.toLocaleString()} has been submitted for approval.`,
      });

      // Reset form
      setSelectedCrop("");
      setPurpose("");
      setRequestedAmount("");
      setSelectedLender("");
      setSelectedVendor("");
      setNotes("");
      
      onSuccess?.();

    } catch (error) {
      console.error('Error submitting loan:', error);
      toast({
        title: "Error",
        description: "Failed to submit loan request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter vendors based on purpose
  const filteredVendors = vendors.filter(v => {
    if (purpose === 'fertilizers') return v.category === 'Fertilizers';
    if (purpose === 'pesticides') return v.category === 'Pesticides';
    if (purpose === 'seeds') return v.category === 'Seeds';
    if (purpose === 'equipment' || purpose === 'irrigation') return v.category === 'Equipment';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Crop Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            Crop & Purpose
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="crop">Select Crop (Optional)</Label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your crop" />
                </SelectTrigger>
                <SelectContent>
                  {crops.map(crop => (
                    <SelectItem key={crop.id} value={crop.id}>
                      {crop.name} {crop.current_stage && `(${crop.current_stage})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">Crop Stage</Label>
              <Select value={cropStage} onValueChange={setCropStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crop stage" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(cropStageFactors).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label} - {value.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Loan Purpose *</Label>
            <Select value={purpose} onValueChange={setPurpose} required>
              <SelectTrigger>
                <SelectValue placeholder="Why do you need the loan?" />
              </SelectTrigger>
              <SelectContent>
                {loanPurposes.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.icon} {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loan Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Loan Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Requested Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
              min="1000"
              max="100000"
              required
            />
          </div>

          {/* Eligibility Display */}
          {eligibility && (
            <div className={`p-4 rounded-lg border-2 ${eligibility.isEligible ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5'}`}>
              <div className="flex items-start gap-3">
                {eligibility.isEligible ? (
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{eligibility.message}</p>
                  {eligibility.isEligible && (
                    <div className="mt-3 grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Eligibility Score:</span>
                        <span className="font-semibold">{eligibility.eligibilityScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Eligible:</span>
                        <span className="font-semibold text-primary">₹{eligibility.maxEligibleAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interest Rate:</span>
                        <span className="font-semibold">{eligibility.recommendedInterestRate}% p.a.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-semibold">{eligibility.recommendedDuration} months</span>
                      </div>
                      {parseFloat(requestedAmount) > 0 && (
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-muted-foreground">Estimated EMI:</span>
                          <span className="font-semibold text-primary">
                            ₹{calculateEMI(
                              Math.min(parseFloat(requestedAmount), eligibility.maxEligibleAmount),
                              eligibility.recommendedInterestRate,
                              eligibility.recommendedDuration
                            ).toLocaleString()}/month
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lender & Vendor Selection */}
      {eligibility?.isEligible && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Lender & Vendor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lender">Select Lender</Label>
              <Select value={selectedLender} onValueChange={setSelectedLender}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lender" />
                </SelectTrigger>
                <SelectContent>
                  {lenders.map(lender => (
                    <SelectItem key={lender.id} value={lender.id}>
                      {lender.name} - {lender.interest_rate}% (Up to ₹{lender.loan_limit.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {purpose && filteredVendors.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="vendor">Select Vendor (Loan will be disbursed to vendor)</Label>
                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredVendors.map(vendor => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name} - ⭐ {vendor.rating} ({vendor.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The loan amount will be directly disbursed to the selected vendor for your purchase.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={submitting || !purpose || !requestedAmount || !eligibility?.isEligible}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Submit Loan Request
          </>
        )}
      </Button>
    </form>
  );
}
