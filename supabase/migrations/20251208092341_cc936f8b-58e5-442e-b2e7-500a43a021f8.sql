-- Add area_covered column to activities table
ALTER TABLE public.activities 
ADD COLUMN area_covered numeric,
ADD COLUMN area_covered_unit text DEFAULT 'acres';