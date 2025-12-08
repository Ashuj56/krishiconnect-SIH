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

interface MoneyLender {
  id: string;
  business_name: string;
  license_holder: string;
  interest_rate: number | null;
  loan_term_months: number | null;
  district: string;
  contact_no: string | null;
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
  const [moneyLenders, setMoneyLenders] = useState<MoneyLender[]>([]);
  const [soilReport, setSoilReport] = useState<SoilReport | null>(null);
  const [landArea, setLandArea] = useState<number>(0);
  const [pastLoansCount, setPastLoansCount] = useState(0);
  
  // Form state
  const [cropStage, setCropStage] = useState<string>("vegetative");
  const [purpose, setPurpose] = useState<string>("");
  const [requestedAmount, setRequestedAmount] = useState<string>("");
  const [selectedLender, setSelectedLender] = useState<string>("");
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
      // Load money lenders from microfinance_vendors
      const { data: lendersData } = await supabase
        .from('microfinance_vendors')
        .select('id, business_name, license_holder, interest_rate, loan_term_months, district, contact_no')
        .eq('is_verified', true)
        .order('interest_rate');
      setMoneyLenders(lendersData || []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !eligibility?.isEligible) return;

    setSubmitting(true);
    try {
      const selectedLenderData = moneyLenders.find(l => l.id === selectedLender);
      
      const approvedAmount = Math.min(parseFloat(requestedAmount), eligibility.maxEligibleAmount);
      const interestRate = selectedLenderData?.interest_rate || eligibility.recommendedInterestRate;
      const duration = selectedLenderData?.loan_term_months || eligibility.recommendedDuration;
      const emi = calculateEMI(approvedAmount, interestRate, duration);
      
      const startDate = new Date();
      const nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      // Create loan record
      const { data: loanData, error: loanError } = await supabase
        .from('farmer_loans')
        .insert({
          user_id: user.id,
          lender_id: null,
          crop_id: null,
          purpose,
          crop_name: null,
          requested_amount: parseFloat(requestedAmount),
          approved_amount: approvedAmount,
          interest_rate: interestRate,
          duration_months: duration,
          emi,
          start_date: startDate.toISOString().split('T')[0],
          next_due_date: nextDueDate.toISOString().split('T')[0],
          status: 'pending',
          vendor_id: selectedLender || null,
          vendor_name: selectedLenderData?.business_name || null,
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
      setPurpose("");
      setRequestedAmount("");
      setSelectedLender("");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Purpose Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            Purpose
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* Money Lender Selection */}
      {eligibility?.isEligible && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Select Money Lender
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lender">Choose Money Lender</Label>
              <Select value={selectedLender} onValueChange={setSelectedLender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a money lender" />
                </SelectTrigger>
                <SelectContent>
                  {moneyLenders.map(lender => (
                    <SelectItem key={lender.id} value={lender.id}>
                      {lender.business_name} - {lender.interest_rate}% ({lender.loan_term_months} months) - {lender.district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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