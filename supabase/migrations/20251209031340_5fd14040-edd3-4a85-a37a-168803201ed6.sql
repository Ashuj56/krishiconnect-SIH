-- Create alerts table for farmer-specific alerts
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB
);

-- Enable RLS on alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for alerts
CREATE POLICY "Users can view own alerts" ON public.alerts
  FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Users can update own alerts" ON public.alerts
  FOR UPDATE USING (auth.uid() = farmer_id);

CREATE POLICY "Users can delete own alerts" ON public.alerts
  FOR DELETE USING (auth.uid() = farmer_id);

CREATE POLICY "System can insert alerts" ON public.alerts
  FOR INSERT WITH CHECK (true);

-- Create reminders table for scheduled reminders
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL,
  message TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  trigger_source TEXT NOT NULL DEFAULT 'schedule',
  category TEXT NOT NULL DEFAULT 'crop',
  crop_id UUID,
  activity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reminders
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies for reminders
CREATE POLICY "Users can view own reminders" ON public.reminders
  FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Users can update own reminders" ON public.reminders
  FOR UPDATE USING (auth.uid() = farmer_id);

CREATE POLICY "Users can delete own reminders" ON public.reminders
  FOR DELETE USING (auth.uid() = farmer_id);

CREATE POLICY "System can insert reminders" ON public.reminders
  FOR INSERT WITH CHECK (true);

-- Create crop_schedules table for crop operation schedules
CREATE TABLE IF NOT EXISTS public.crop_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL UNIQUE,
  schedule JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on crop_schedules (read-only for all)
ALTER TABLE public.crop_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view crop schedules" ON public.crop_schedules
  FOR SELECT USING (true);

-- Create market_price_history table for tracking price changes
CREATE TABLE IF NOT EXISTS public.market_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop TEXT NOT NULL,
  district TEXT NOT NULL,
  price NUMERIC NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(crop, district, recorded_date)
);

-- Enable RLS on market_price_history
ALTER TABLE public.market_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view market prices" ON public.market_price_history
  FOR SELECT USING (true);

CREATE POLICY "System can insert market prices" ON public.market_price_history
  FOR INSERT WITH CHECK (true);

-- Create scheme_deadlines table for government scheme tracking
CREATE TABLE IF NOT EXISTS public.scheme_deadlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  deadline_date DATE NOT NULL,
  state TEXT DEFAULT 'Kerala',
  district TEXT,
  scheme_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on scheme_deadlines
ALTER TABLE public.scheme_deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scheme deadlines" ON public.scheme_deadlines
  FOR SELECT USING (true);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_alerts_farmer_id ON public.alerts(farmer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_category ON public.alerts(category);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON public.alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_reminders_farmer_id ON public.reminders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON public.reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_market_price_history_crop_district ON public.market_price_history(crop, district);

-- Update notifications table to add more categories
ALTER TABLE public.notifications 
  DROP CONSTRAINT IF EXISTS notifications_category_check;

-- Insert default crop schedules for Kerala crops
INSERT INTO public.crop_schedules (crop_name, schedule) VALUES
('Banana', '{"0-7": ["Light irrigation", "Mulching around base"], "8-15": ["Weeding", "First fertilizer application"], "16-30": ["Pest inspection", "Desuckering"], "31-60": ["Second fertilizer", "Propping if needed"], "61-120": ["Bunch emergence care", "Pest management"], "120-180": ["Harvest preparation", "Monitor ripening"]}'),
('Coconut', '{"0-30": ["Irrigation setup", "Basin preparation"], "31-90": ["Regular watering", "First manuring"], "91-180": ["Pest inspection", "Crown cleaning"], "181-365": ["Annual fertilizer", "Harvest coconuts"]}'),
('Paddy', '{"0-7": ["Transplanting", "Water management"], "8-21": ["Weed control", "First top dressing"], "22-45": ["Tillering stage care", "Pest monitoring"], "46-70": ["Panicle initiation", "Second top dressing"], "71-90": ["Grain filling", "Water management"], "91-120": ["Harvest preparation", "Drain water"]}'),
('Pepper', '{"0-30": ["Stake preparation", "Mulching"], "31-90": ["Training vines", "First fertilizer"], "91-180": ["Pest management", "Nutrient spray"], "181-270": ["Flowering care", "Support strengthening"], "271-365": ["Harvest spikes", "Post-harvest pruning"]}'),
('Rubber', '{"0-90": ["Shade management", "Weeding"], "91-180": ["First fertilizer", "Pest inspection"], "181-365": ["Annual maintenance", "Growth monitoring"], "2555-2920": ["Tapping preparation", "Panel marking"]}'),
('Cardamom', '{"0-30": ["Shade regulation", "Mulching"], "31-90": ["First manuring", "Weed control"], "91-180": ["Pest management", "Irrigation"], "181-270": ["Flowering care", "Pollination support"], "271-365": ["Harvest capsules", "Drying preparation"]}'),
('Ginger', '{"0-15": ["Seed rhizome planting", "Mulching"], "16-45": ["First weeding", "Earthing up"], "46-90": ["Second earthing", "Fertilizer application"], "91-150": ["Pest monitoring", "Irrigation management"], "151-240": ["Harvest preparation", "Cure rhizomes"]}'),
('Turmeric', '{"0-15": ["Rhizome planting", "Mulching"], "16-45": ["First weeding", "Earthing up"], "46-90": ["Second fertilizer", "Pest inspection"], "91-180": ["Growth monitoring", "Irrigation"], "181-270": ["Harvest preparation", "Curing"]}'),
('Tapioca', '{"0-30": ["Stem planting", "Gap filling"], "31-60": ["First weeding", "Earthing up"], "61-120": ["Fertilizer application", "Pest management"], "121-240": ["Tuber development", "Weed control"], "241-365": ["Harvest tubers", "Process immediately"]}'),
('Arecanut', '{"0-90": ["Shade management", "Irrigation"], "91-180": ["First fertilizer", "Basin preparation"], "181-365": ["Annual maintenance", "Pest inspection"], "730-1095": ["Harvest nuts", "Sun drying"]}'),
('Tea', '{"0-30": ["Shade regulation", "Mulching"], "31-90": ["First pruning", "Weed control"], "91-180": ["Fertilizer schedule", "Pest management"], "181-365": ["Harvest flush", "Processing preparation"]}'),
('Coffee', '{"0-30": ["Shade planting", "Mulching"], "31-90": ["First fertilizer", "Weed control"], "91-180": ["Pest management", "Nutrient spray"], "181-270": ["Flowering care", "Irrigation"], "271-365": ["Harvest berries", "Processing"]}')
ON CONFLICT (crop_name) DO NOTHING;

-- Insert sample scheme deadlines
INSERT INTO public.scheme_deadlines (title, description, deadline_date, state, scheme_url) VALUES
('PM-KISAN eKYC', 'Complete eKYC for PM-KISAN installment', CURRENT_DATE + INTERVAL '30 days', 'Kerala', 'https://pmkisan.gov.in'),
('Crop Insurance Registration', 'PMFBY crop insurance registration deadline', CURRENT_DATE + INTERVAL '45 days', 'Kerala', 'https://pmfby.gov.in'),
('Kisan Credit Card Renewal', 'KCC renewal for agricultural credit', CURRENT_DATE + INTERVAL '60 days', 'Kerala', 'https://www.nabard.org')
ON CONFLICT DO NOTHING;