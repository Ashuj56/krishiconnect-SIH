-- Add new columns to microfinance_vendors table
ALTER TABLE public.microfinance_vendors 
ADD COLUMN IF NOT EXISTS interest_rate numeric DEFAULT 12.0,
ADD COLUMN IF NOT EXISTS loan_term_months integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS contact_no text,
ADD COLUMN IF NOT EXISTS email text;

-- Update existing vendors with contact details
UPDATE public.microfinance_vendors SET 
  interest_rate = 10.5,
  loan_term_months = 12,
  contact_no = '9876543210',
  email = 'skfinance@gmail.com'
WHERE license_number = '32010535754';

UPDATE public.microfinance_vendors SET 
  interest_rate = 11.0,
  loan_term_months = 18,
  contact_no = '9876543211',
  email = 'ambadifinance@gmail.com'
WHERE license_number = '32020475332';

UPDATE public.microfinance_vendors SET 
  interest_rate = 10.0,
  loan_term_months = 12,
  contact_no = '9876543212',
  email = 'dhanasreefinance@gmail.com'
WHERE license_number = '32030265611';

UPDATE public.microfinance_vendors SET 
  interest_rate = 11.5,
  loan_term_months = 24,
  contact_no = '9876543213',
  email = 'beenatrust@gmail.com'
WHERE license_number = '32040429513';

UPDATE public.microfinance_vendors SET 
  interest_rate = 10.5,
  loan_term_months = 18,
  contact_no = '9876543214',
  email = 'lanmarkfinanciers@gmail.com'
WHERE license_number = '32050397463';

UPDATE public.microfinance_vendors SET 
  interest_rate = 12.0,
  loan_term_months = 12,
  contact_no = '9876543215',
  email = 'sahayahillbankers@gmail.com'
WHERE license_number = '32060454557';

UPDATE public.microfinance_vendors SET 
  interest_rate = 11.0,
  loan_term_months = 24,
  contact_no = '9876543216',
  email = 'maliekalfinanciers@gmail.com'
WHERE license_number = '32070690224';

UPDATE public.microfinance_vendors SET 
  interest_rate = 10.5,
  loan_term_months = 12,
  contact_no = '9876543217',
  email = 'analeesfinance@gmail.com'
WHERE license_number = '32080367384';

UPDATE public.microfinance_vendors SET 
  interest_rate = 11.5,
  loan_term_months = 18,
  contact_no = '9876543218',
  email = 'chorakkodefinance@gmail.com'
WHERE license_number = '32090342488';

UPDATE public.microfinance_vendors SET 
  interest_rate = 10.0,
  loan_term_months = 12,
  contact_no = '9876543219',
  email = 'goldenenterprises@gmail.com'
WHERE license_number = '32100394577';

UPDATE public.microfinance_vendors SET 
  interest_rate = 11.0,
  loan_term_months = 24,
  contact_no = '9876543220',
  email = 'kanjanafinance@gmail.com'
WHERE license_number = '32110515371';

UPDATE public.microfinance_vendors SET 
  interest_rate = 10.5,
  loan_term_months = 18,
  contact_no = '9876543221',
  email = 'nandanafinance@gmail.com'
WHERE license_number = '32120349006';