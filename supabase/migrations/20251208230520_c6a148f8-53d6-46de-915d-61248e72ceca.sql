
-- Create microfinance_vendors table
CREATE TABLE public.microfinance_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_holder TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_address TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.microfinance_vendors ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view verified vendors
CREATE POLICY "Anyone can view verified vendors" 
ON public.microfinance_vendors 
FOR SELECT 
USING (is_verified = true);

-- Insert verified vendor dataset
INSERT INTO public.microfinance_vendors (district, license_number, license_holder, business_name, business_address, is_verified) VALUES
('THIRUVANANTHAPURAM', '32010535754', 'SANTHOSH', 'S.K. FINANCE', 'T.C.10/1564, Kovilnada, Mannanthala', true),
('KOLLAM', '32020475332', 'C. RAJENDRAN PILLAI', 'AMBADI FINANCE', 'Ambadi Finance, Mynagappally, Kollam', true),
('PATHANAMTHITTA', '32030265611', 'ASHA NAIR', 'DHANASREE FINANCE', 'Chippi Building, Thengamam, Anayadi', true),
('ALAPPUZHA', '32040429513', 'BAIJU K.P', 'BEENA TRUST', 'SNDP Building, Kaithavana, Sanathanapuram', true),
('KOTTAYAM', '32050397463', 'LANMARK FINANCIERS', 'LANMARK FINANCIERS RAMAPURAM', 'Porunnakottu Building, Ramapuram Bazar PO', true),
('IDUKKI', '32060454557', 'SAHIYA HILL BANKERS', 'SAHAYA HILL BANKERS', 'Puthenpurackal, Vagamon', true),
('ERNAKULAM', '32070690224', 'DARLY', 'MALIEKAL FINANCIERS', 'Pavakulam Building, Kaloor Junction', true),
('THRISSUR', '32080367384', 'ANALIPARAMBIL', 'ANALEES FINANCE', 'Mattathur Panchayat, Kodaly', true),
('PALAKKAD', '32090342488', 'BALAKRISHNAN C.T', 'CHORAKKODE FINANCE', 'Pattathalachi, Vadavannur', true),
('MALAPPURAM', '32100394577', 'GOLDEN ENTERPRISES', 'M/S GOLDEN ENTERPRISES', 'Jinnans Building, Veliancode', true),
('KOZHIKODE', '32110515371', 'JIDHIN ROOP K.P', 'KANJANA FINANCE', 'Palam Junction, Thurayur, Payyoli Angadi', true),
('KANNUR', '32120349006', 'BINOJ M K', 'NANDANA FINANCE', 'Plavila Puthanveettil Building, Edakom', true);
