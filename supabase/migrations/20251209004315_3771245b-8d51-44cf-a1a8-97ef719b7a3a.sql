-- Add preliminary_grade and final_grade columns to harvest_batches
ALTER TABLE public.harvest_batches 
ADD COLUMN preliminary_grade text,
ADD COLUMN final_grade text;

-- Create grade_tickets table
CREATE TABLE public.grade_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  harvest_batch_id UUID NOT NULL REFERENCES public.harvest_batches(id) ON DELETE CASCADE,
  crop text NOT NULL,
  quantity_kg numeric NOT NULL,
  preliminary_grade text NOT NULL,
  district text NOT NULL,
  pincode text NOT NULL,
  ticket_code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grade_tickets ENABLE ROW LEVEL SECURITY;

-- Anyone can view tickets (buyers need to verify)
CREATE POLICY "Anyone can view grade tickets" 
ON public.grade_tickets 
FOR SELECT 
USING (true);

-- Only system can insert tickets (via edge function)
CREATE POLICY "System can insert grade tickets" 
ON public.grade_tickets 
FOR INSERT 
WITH CHECK (true);

-- Create index for ticket lookup
CREATE INDEX idx_grade_tickets_code ON public.grade_tickets(ticket_code);
CREATE INDEX idx_grade_tickets_batch ON public.grade_tickets(harvest_batch_id);