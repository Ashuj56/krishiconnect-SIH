-- Create lenders table
CREATE TABLE public.lenders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  interest_rate numeric NOT NULL DEFAULT 7.5,
  loan_limit numeric NOT NULL DEFAULT 50000,
  min_credit_score integer NOT NULL DEFAULT 300,
  processing_fee numeric NOT NULL DEFAULT 1.2,
  logo_url text,
  description text,
  contact_info text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create farmer_loans table
CREATE TABLE public.farmer_loans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lender_id uuid REFERENCES public.lenders(id),
  crop_id uuid REFERENCES public.crops(id),
  purpose text NOT NULL,
  crop_name text,
  requested_amount numeric NOT NULL,
  approved_amount numeric,
  interest_rate numeric,
  duration_months integer NOT NULL DEFAULT 6,
  emi numeric,
  start_date date,
  next_due_date date,
  status text NOT NULL DEFAULT 'pending',
  vendor_id text,
  vendor_name text,
  proof_url text,
  eligibility_score integer,
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create loan_repayments table
CREATE TABLE public.loan_repayments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id uuid NOT NULL REFERENCES public.farmer_loans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  due_date date NOT NULL,
  amount numeric NOT NULL,
  paid_date date,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;

-- Lenders are publicly viewable
CREATE POLICY "Anyone can view lenders" ON public.lenders FOR SELECT USING (true);

-- Farmers can manage their own loans
CREATE POLICY "Users can view own loans" ON public.farmer_loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own loans" ON public.farmer_loans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loans" ON public.farmer_loans FOR UPDATE USING (auth.uid() = user_id);

-- Farmers can manage their own repayments
CREATE POLICY "Users can view own repayments" ON public.loan_repayments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own repayments" ON public.loan_repayments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own repayments" ON public.loan_repayments FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample lenders
INSERT INTO public.lenders (name, interest_rate, loan_limit, min_credit_score, processing_fee, description) VALUES
('Kerala Gramin Bank', 7.5, 50000, 300, 1.2, 'Government-backed rural cooperative bank with farmer-friendly terms'),
('State Bank of India - Kisan Credit', 8.0, 100000, 350, 1.5, 'SBI agricultural credit facility with flexible repayment'),
('Kerala State Cooperative Bank', 6.5, 40000, 280, 1.0, 'Low-interest loans for small and marginal farmers'),
('NABARD Partner - Agri Finance', 7.0, 75000, 320, 1.3, 'NABARD-affiliated microfinance for agricultural inputs'),
('Canara Bank Kisan Seva', 7.8, 60000, 310, 1.4, 'Quick disbursement agricultural loans');

-- Add trigger for updated_at
CREATE TRIGGER update_farmer_loans_updated_at
BEFORE UPDATE ON public.farmer_loans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();