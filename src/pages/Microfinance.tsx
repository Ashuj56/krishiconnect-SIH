import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, FileText, TrendingUp, AlertTriangle, CheckCircle2, Clock, Landmark } from "lucide-react";
import { LoanRequestForm } from "@/components/microfinance/LoanRequestForm";
import { MyLoansTab } from "@/components/microfinance/MyLoansTab";
import { EligibilityCard } from "@/components/microfinance/EligibilityCard";
import { VerifiedVendorsCard } from "@/components/microfinance/VerifiedVendorsCard";
import { useMicrofinanceEligibility } from "@/hooks/useMicrofinanceEligibility";

interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  pendingLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  overdueAmount: number;
}

export default function Microfinance() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("request");
  const [stats, setStats] = useState<LoanStats>({
    totalLoans: 0,
    activeLoans: 0,
    pendingLoans: 0,
    totalBorrowed: 0,
    totalRepaid: 0,
    overdueAmount: 0,
  });

  const { eligibility, isLoading: eligibilityLoading } = useMicrofinanceEligibility();

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const { data: loans } = await supabase
        .from('farmer_loans')
        .select('*')
        .eq('user_id', user!.id);

      if (!loans) return;

      const { data: repayments } = await supabase
        .from('loan_repayments')
        .select('*')
        .eq('user_id', user!.id);

      const totalBorrowed = loans.reduce((sum, l) => sum + (l.approved_amount || 0), 0);
      const totalRepaid = (repayments || [])
        .filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + r.amount, 0);
      const overdueReps = (repayments || []).filter(r => 
        r.status === 'pending' && new Date(r.due_date) < new Date()
      );
      const overdueAmount = overdueReps.reduce((sum, r) => sum + r.amount, 0);

      setStats({
        totalLoans: loans.length,
        activeLoans: loans.filter(l => l.status === 'active').length,
        pendingLoans: loans.filter(l => l.status === 'pending').length,
        totalBorrowed,
        totalRepaid,
        overdueAmount,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLoanSuccess = () => {
    loadStats();
    setActiveTab("my-loans");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          💰 Microfinance Loans
        </h1>
        <p className="text-muted-foreground mt-1">
          Get agricultural loans disbursed directly to vendors for your farming needs
        </p>
      </div>

      {/* Eligibility Card */}
      <EligibilityCard
        category={eligibility?.category || "Loading..."}
        loanLimit={eligibility?.loan_limit || "..."}
        loanLimitAmount={eligibility?.loan_limit_amount || 0}
        vendorTypes={eligibility?.recommended_vendor_types || []}
        isLoading={eligibilityLoading}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Borrowed</p>
                <p className="text-lg font-bold">₹{stats.totalBorrowed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Repaid</p>
                <p className="text-lg font-bold text-green-600">₹{stats.totalRepaid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Loans</p>
                <p className="text-lg font-bold">{stats.activeLoans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.overdueAmount > 0 ? 'bg-destructive/10' : 'bg-yellow-500/10'}`}>
                {stats.overdueAmount > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {stats.overdueAmount > 0 ? 'Overdue' : 'Pending'}
                </p>
                <p className={`text-lg font-bold ${stats.overdueAmount > 0 ? 'text-destructive' : ''}`}>
                  {stats.overdueAmount > 0 ? `₹${stats.overdueAmount.toLocaleString()}` : stats.pendingLoans}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="request" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Request Loan</span>
            <span className="sm:hidden">Request</span>
          </TabsTrigger>
          <TabsTrigger value="my-loans" className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            <span className="hidden sm:inline">My Loans</span>
            <span className="sm:hidden">Loans</span>
            {stats.totalLoans > 0 && (
              <Badge variant="secondary" className="ml-1">{stats.totalLoans}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="money-lenders" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            <span className="hidden sm:inline">Money Lenders</span>
            <span className="sm:hidden">Lenders</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Apply for Agricultural Loan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LoanRequestForm 
                onSuccess={handleLoanSuccess} 
                maxLoanAmount={eligibility?.loan_limit_amount}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-loans">
          <MyLoansTab />
        </TabsContent>

        <TabsContent value="money-lenders">
          <VerifiedVendorsCard 
            vendors={eligibility?.verified_vendors || []}
            isLoading={eligibilityLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
