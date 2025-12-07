-- Create soil_reports table for storing soil analysis results
CREATE TABLE public.soil_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nitrogen NUMERIC NOT NULL,
  phosphorus NUMERIC NOT NULL,
  potassium NUMERIC NOT NULL,
  ph NUMERIC NOT NULL,
  status_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.soil_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to manage their own reports
CREATE POLICY "Users can manage own soil reports"
ON public.soil_reports
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);