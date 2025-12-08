import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, IndianRupee, Calendar, TrendingUp, AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";

interface Loan {
  id: string;
  purpose: string;
  crop_name: string | null;
  requested_amount: number;
  approved_amount: number | null;
  interest_rate: number | null;
  duration_months: number;
  emi: number | null;
  start_date: string | null;
  next_due_date: string | null;
  status: string;
  vendor_name: string | null;
  eligibility_score: number | null;
  created_at: string;
  lenders?: { name: string } | null;
}

interface Repayment {
  id: string;
  loan_id: string;
  due_date: string;
  amount: number;
  paid_date: string | null;
  status: string;
}

export function MyLoansTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [repayments, setRepayments] = useState<Record<string, Repayment[]>>({});
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadLoans();
    }
  }, [user]);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const { data: loansData, error } = await supabase
        .from('farmer_loans')
        .select(`
          *,
          lenders (name)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoans(loansData || []);

      // Load repayments for each loan
      const repaymentMap: Record<string, Repayment[]> = {};
      for (const loan of loansData || []) {
        const { data: repData } = await supabase
          .from('loan_repayments')
          .select('*')
          .eq('loan_id', loan.id)
          .order('due_date');
        repaymentMap[loan.id] = repData || [];
      }
      setRepayments(repaymentMap);

    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayEMI = async (loanId: string, repaymentId: string) => {
    try {
      // Update repayment status
      await supabase
        .from('loan_repayments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', repaymentId);

      // Update next due date on loan
      const loanRepayments = repayments[loanId];
      const nextPending = loanRepayments.find(r => r.id !== repaymentId && r.status === 'pending');
      
      if (nextPending) {
        await supabase
          .from('farmer_loans')
          .update({ next_due_date: nextPending.due_date })
          .eq('id', loanId);
      } else {
        // All paid - mark loan as completed
        await supabase
          .from('farmer_loans')
          .update({ status: 'completed', next_due_date: null })
          .eq('id', loanId);
      }

      loadLoans();
    } catch (error) {
      console.error('Error paying EMI:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-primary/10 text-primary"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'active':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600"><TrendingUp className="h-3 w-3 mr-1" /> Active</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateProgress = (loanId: string) => {
    const loanReps = repayments[loanId] || [];
    if (loanReps.length === 0) return 0;
    const paid = loanReps.filter(r => r.status === 'paid').length;
    return Math.round((paid / loanReps.length) * 100);
  };

  const getTotalPaid = (loanId: string) => {
    const loanReps = repayments[loanId] || [];
    return loanReps.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <Card className="text-center p-8">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-semibold mb-2">No Loans Yet</h3>
        <p className="text-muted-foreground">You haven't applied for any loans. Go to "Request Loan" tab to apply.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {loans.map(loan => {
        const loanReps = repayments[loan.id] || [];
        const progress = calculateProgress(loan.id);
        const totalPaid = getTotalPaid(loan.id);
        const isExpanded = selectedLoan === loan.id;
        const overdueReps = loanReps.filter(r => r.status === 'pending' && isPast(new Date(r.due_date)));

        return (
          <Card key={loan.id} className="overflow-hidden">
            <CardHeader className="cursor-pointer" onClick={() => setSelectedLoan(isExpanded ? null : loan.id)}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {loan.purpose.charAt(0).toUpperCase() + loan.purpose.slice(1)}
                    </CardTitle>
                    {getStatusBadge(loan.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {loan.crop_name && `${loan.crop_name} • `}
                    {loan.lenders?.name || 'Pending Lender'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    ₹{(loan.approved_amount || loan.requested_amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(loan.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {loan.status === 'active' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Repayment Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {overdueReps.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{overdueReps.length} overdue EMI(s)</span>
                </div>
              )}
            </CardHeader>

            {isExpanded && (
              <CardContent className="border-t">
                {/* Loan Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Loan Amount</p>
                    <p className="font-semibold">₹{(loan.approved_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Interest Rate</p>
                    <p className="font-semibold">{loan.interest_rate}% p.a.</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">EMI Amount</p>
                    <p className="font-semibold">₹{(loan.emi || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-semibold">{loan.duration_months} months</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Paid</p>
                    <p className="font-semibold text-primary">₹{totalPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="font-semibold">₹{((loan.approved_amount || 0) - totalPaid + (totalPaid * (loan.interest_rate || 0) / 100)).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Next Due Date</p>
                    <p className="font-semibold">{loan.next_due_date ? format(new Date(loan.next_due_date), 'MMM dd, yyyy') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vendor</p>
                    <p className="font-semibold">{loan.vendor_name || '-'}</p>
                  </div>
                </div>

                {/* Repayment Timeline */}
                {loanReps.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-3">Repayment Schedule</h4>
                    <div className="space-y-2">
                      {loanReps.map((rep, idx) => {
                        const isOverdue = rep.status === 'pending' && isPast(new Date(rep.due_date));
                        const daysUntil = differenceInDays(new Date(rep.due_date), new Date());
                        
                        return (
                          <div
                            key={rep.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              rep.status === 'paid' ? 'bg-green-500/5 border-green-500/20' :
                              isOverdue ? 'bg-destructive/5 border-destructive/20' :
                              'bg-muted/30 border-border'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                rep.status === 'paid' ? 'bg-green-500 text-white' :
                                isOverdue ? 'bg-destructive text-white' :
                                'bg-yellow-500/20 text-yellow-600'
                              }`}>
                                {idx + 1}
                              </div>
                              <div>
                                <p className="font-medium">EMI #{idx + 1}</p>
                                <p className="text-xs text-muted-foreground">
                                  Due: {format(new Date(rep.due_date), 'MMM dd, yyyy')}
                                  {rep.status === 'pending' && !isOverdue && daysUntil <= 7 && (
                                    <span className="text-yellow-600 ml-2">({daysUntil} days left)</span>
                                  )}
                                  {isOverdue && (
                                    <span className="text-destructive ml-2">({Math.abs(daysUntil)} days overdue)</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">₹{rep.amount.toLocaleString()}</span>
                              {rep.status === 'paid' ? (
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Paid
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant={isOverdue ? "destructive" : "default"}
                                  onClick={() => handlePayEMI(loan.id, rep.id)}
                                >
                                  Pay Now
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
