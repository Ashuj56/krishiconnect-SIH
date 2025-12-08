import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EligibilityResult {
  category: string;
  loan_limit: string;
  loan_limit_amount: number;
  recommended_vendor_types: string[];
  verified_vendors: any[];
  verified_vendors_only: boolean;
}

function calculateEligibility(landSize: number): { category: string; loanLimit: string; loanLimitAmount: number; vendorTypes: string[] } {
  if (landSize < 1) {
    return {
      category: 'Small Farmer',
      loanLimit: 'Up to ₹25,000',
      loanLimitAmount: 25000,
      vendorTypes: ['Micro-loan', 'Seed vendors']
    };
  } else if (landSize <= 3) {
    return {
      category: 'Medium Farmer',
      loanLimit: 'Up to ₹1,00,000',
      loanLimitAmount: 100000,
      vendorTypes: ['Fertilizer vendors', 'Cooperative banks', 'KCC Loan Partners']
    };
  } else {
    return {
      category: 'Large Farmer',
      loanLimit: 'Up to ₹5,00,000',
      loanLimitAmount: 500000,
      vendorTypes: ['Machinery vendors', 'Large loan providers']
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || '' } }
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching data for user:', user.id);

    // Get farmer's farm data for land size and location
    const { data: farms, error: farmError } = await supabase
      .from('farms')
      .select('total_area, area_unit, location')
      .eq('user_id', user.id)
      .limit(1);

    if (farmError) {
      console.error('Farm fetch error:', farmError);
    }

    const farm = farms?.[0];
    let landSize = farm?.total_area || 1; // Default to 1 acre if no farm data
    
    // Convert to acres if needed
    if (farm?.area_unit === 'hectares') {
      landSize = landSize * 2.471;
    } else if (farm?.area_unit === 'cents') {
      landSize = landSize / 100;
    }

    console.log('Land size (acres):', landSize);

    // Get farmer's district from location
    let district = '';
    if (farm?.location) {
      // Try to extract district from location string (format: "village, district, Kerala, India")
      const parts = farm.location.split(',').map((s: string) => s.trim().toUpperCase());
      // Check each part against known districts
      const keralaDistricts = [
        'THIRUVANANTHAPURAM', 'KOLLAM', 'PATHANAMTHITTA', 'ALAPPUZHA', 
        'KOTTAYAM', 'IDUKKI', 'ERNAKULAM', 'THRISSUR', 'PALAKKAD', 
        'MALAPPURAM', 'KOZHIKODE', 'WAYANAD', 'KANNUR', 'KASARAGOD'
      ];
      for (const part of parts) {
        if (keralaDistricts.includes(part)) {
          district = part;
          break;
        }
      }
    }

    console.log('Detected district:', district);

    // Calculate eligibility
    const eligibility = calculateEligibility(landSize);

    // Fetch verified vendors - filter by district if available
    let vendorQuery = supabase
      .from('microfinance_vendors')
      .select('*')
      .eq('is_verified', true);

    if (district) {
      vendorQuery = vendorQuery.eq('district', district);
    }

    const { data: vendors, error: vendorError } = await vendorQuery;

    if (vendorError) {
      console.error('Vendor fetch error:', vendorError);
    }

    console.log('Found vendors:', vendors?.length || 0);

    const result: EligibilityResult = {
      category: eligibility.category,
      loan_limit: eligibility.loanLimit,
      loan_limit_amount: eligibility.loanLimitAmount,
      recommended_vendor_types: eligibility.vendorTypes,
      verified_vendors: vendors || [],
      verified_vendors_only: true
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in microfinance-eligibility:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
