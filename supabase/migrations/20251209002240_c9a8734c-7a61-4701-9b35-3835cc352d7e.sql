-- Create harvest_batches table
CREATE TABLE public.harvest_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  grade TEXT NOT NULL CHECK (grade IN ('A', 'B', 'C')),
  harvest_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  district TEXT NOT NULL,
  pincode TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create buyers table
CREATE TABLE public.buyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('factory', 'oil_mill', 'local_vendor')),
  crops_accepted TEXT[] NOT NULL,
  min_grade TEXT NOT NULL CHECK (min_grade IN ('A', 'B', 'C')),
  price_per_kg NUMERIC NOT NULL,
  district TEXT NOT NULL,
  pincodes_served TEXT[] NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create value_added_options table
CREATE TABLE public.value_added_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop TEXT NOT NULL,
  product TEXT NOT NULL,
  conversion_ratio NUMERIC NOT NULL,
  processing_cost_per_kg NUMERIC NOT NULL,
  selling_price_per_kg NUMERIC NOT NULL,
  min_grade_required TEXT NOT NULL CHECK (min_grade_required IN ('A', 'B'))
);

-- Create sale_recommendations table
CREATE TABLE public.sale_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  harvest_batch_id UUID NOT NULL REFERENCES public.harvest_batches(id) ON DELETE CASCADE,
  best_channel TEXT NOT NULL,
  expected_income_best NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.harvest_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.value_added_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for harvest_batches
CREATE POLICY "Users can view own harvest batches"
ON public.harvest_batches FOR SELECT
USING (auth.uid() = farmer_id);

CREATE POLICY "Users can create own harvest batches"
ON public.harvest_batches FOR INSERT
WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Users can update own harvest batches"
ON public.harvest_batches FOR UPDATE
USING (auth.uid() = farmer_id);

CREATE POLICY "Users can delete own harvest batches"
ON public.harvest_batches FOR DELETE
USING (auth.uid() = farmer_id);

-- RLS Policies for buyers (public read)
CREATE POLICY "Anyone can view buyers"
ON public.buyers FOR SELECT
USING (true);

-- RLS Policies for value_added_options (public read)
CREATE POLICY "Anyone can view value added options"
ON public.value_added_options FOR SELECT
USING (true);

-- RLS Policies for sale_recommendations
CREATE POLICY "Users can view own recommendations"
ON public.sale_recommendations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.harvest_batches hb
  WHERE hb.id = harvest_batch_id AND hb.farmer_id = auth.uid()
));

CREATE POLICY "System can insert recommendations"
ON public.sale_recommendations FOR INSERT
WITH CHECK (true);

-- Seed buyers data for Kerala
INSERT INTO public.buyers (name, type, crops_accepted, min_grade, price_per_kg, district, pincodes_served, contact_info) VALUES
-- Banana Factories
('Palakkad Banana Chips Factory', 'factory', ARRAY['Banana'], 'B', 28, 'Palakkad', ARRAY['678001', '678002', '678003', '678004', '678005'], '+91-9847123456'),
('Thrissur Nendran Processing Unit', 'factory', ARRAY['Banana'], 'A', 32, 'Thrissur', ARRAY['680001', '680002', '680003', '680004', '680005'], '+91-9847234567'),
('Kozhikode Banana Export Ltd', 'factory', ARRAY['Banana'], 'B', 26, 'Kozhikode', ARRAY['673001', '673002', '673003', '673004', '673005'], '+91-9847345678'),

-- Coconut Oil Mills
('Kochi Coconut Oil Mill', 'oil_mill', ARRAY['Coconut'], 'B', 35, 'Ernakulam', ARRAY['682001', '682002', '682003', '682004', '682005'], '+91-9847456789'),
('Alappuzha Premium Copra Factory', 'oil_mill', ARRAY['Coconut'], 'A', 42, 'Alappuzha', ARRAY['688001', '688002', '688003', '688004', '688005'], '+91-9847567890'),
('Kollam Coconut Processing', 'oil_mill', ARRAY['Coconut'], 'B', 33, 'Kollam', ARRAY['691001', '691002', '691003', '691004', '691005'], '+91-9847678901'),

-- Local Vendors - Banana
('Palakkad Pazham Kadai', 'local_vendor', ARRAY['Banana'], 'C', 18, 'Palakkad', ARRAY['678001', '678002', '678003', '678004', '678005'], '+91-9847789012'),
('Thrissur Fruit Market', 'local_vendor', ARRAY['Banana'], 'C', 16, 'Thrissur', ARRAY['680001', '680002', '680003', '680004', '680005'], '+91-9847890123'),
('Kozhikode Mandi Vendor', 'local_vendor', ARRAY['Banana'], 'C', 15, 'Kozhikode', ARRAY['673001', '673002', '673003', '673004', '673005'], '+91-9847901234'),
('Ernakulam Local Market', 'local_vendor', ARRAY['Banana'], 'C', 17, 'Ernakulam', ARRAY['682001', '682002', '682003', '682004', '682005'], '+91-9848012345'),

-- Local Vendors - Coconut
('Ernakulam Thenga Kadai', 'local_vendor', ARRAY['Coconut'], 'C', 22, 'Ernakulam', ARRAY['682001', '682002', '682003', '682004', '682005'], '+91-9848123456'),
('Alappuzha Coconut Vendor', 'local_vendor', ARRAY['Coconut'], 'C', 20, 'Alappuzha', ARRAY['688001', '688002', '688003', '688004', '688005'], '+91-9848234567'),
('Kollam Local Thenga Market', 'local_vendor', ARRAY['Coconut'], 'C', 19, 'Kollam', ARRAY['691001', '691002', '691003', '691004', '691005'], '+91-9848345678'),
('Thiruvananthapuram Coconut Market', 'local_vendor', ARRAY['Coconut'], 'C', 21, 'Thiruvananthapuram', ARRAY['695001', '695002', '695003', '695004', '695005'], '+91-9848456789');

-- Seed value_added_options
INSERT INTO public.value_added_options (crop, product, conversion_ratio, processing_cost_per_kg, selling_price_per_kg, min_grade_required) VALUES
('Banana', 'Banana Chips', 0.25, 15, 180, 'B'),
('Banana', 'Banana Powder', 0.15, 20, 250, 'A'),
('Coconut', 'Coconut Oil', 0.65, 8, 180, 'B'),
('Coconut', 'Virgin Coconut Oil', 0.55, 12, 350, 'A'),
('Coconut', 'Desiccated Coconut', 0.45, 10, 220, 'B');