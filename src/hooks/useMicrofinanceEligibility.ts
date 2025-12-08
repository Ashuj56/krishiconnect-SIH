import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Vendor {
  id: string;
  district: string;
  license_number: string;
  license_holder: string;
  business_name: string;
  business_address: string;
  is_verified: boolean;
}

interface EligibilityData {
  category: string;
  loan_limit: string;
  loan_limit_amount: number;
  recommended_vendor_types: string[];
  verified_vendors: Vendor[];
  verified_vendors_only: boolean;
}

export function useMicrofinanceEligibility() {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchEligibility();
    }
  }, [user]);

  const fetchEligibility = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('microfinance-eligibility');

      if (fnError) {
        console.error('Error fetching eligibility:', fnError);
        // Fallback to direct query if edge function fails
        await fetchEligibilityFallback();
        return;
      }

      setEligibility(data);
    } catch (err) {
      console.error('Error:', err);
      await fetchEligibilityFallback();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEligibilityFallback = async () => {
    try {
      // Get farm data
      const { data: farms } = await supabase
        .from('farms')
        .select('total_area, area_unit, location')
        .eq('user_id', user!.id)
        .limit(1);

      const farm = farms?.[0];
      let landSize = farm?.total_area || 1;

      if (farm?.area_unit === 'hectares') {
        landSize = landSize * 2.471;
      } else if (farm?.area_unit === 'cents') {
        landSize = landSize / 100;
      }

      // Calculate eligibility
      let category: string, loanLimit: string, loanLimitAmount: number, vendorTypes: string[];

      if (landSize < 1) {
        category = 'Small Farmer';
        loanLimit = 'Up to ₹25,000';
        loanLimitAmount = 25000;
        vendorTypes = ['Micro-loan', 'Seed vendors'];
      } else if (landSize <= 3) {
        category = 'Medium Farmer';
        loanLimit = 'Up to ₹1,00,000';
        loanLimitAmount = 100000;
        vendorTypes = ['Fertilizer vendors', 'Cooperative banks', 'KCC Loan Partners'];
      } else {
        category = 'Large Farmer';
        loanLimit = 'Up to ₹5,00,000';
        loanLimitAmount = 500000;
        vendorTypes = ['Machinery vendors', 'Large loan providers'];
      }

      // Get vendors
      const { data: vendors } = await supabase
        .from('microfinance_vendors')
        .select('*')
        .eq('is_verified', true);

      setEligibility({
        category,
        loan_limit: loanLimit,
        loan_limit_amount: loanLimitAmount,
        recommended_vendor_types: vendorTypes,
        verified_vendors: vendors || [],
        verified_vendors_only: true
      });
    } catch (err) {
      console.error('Fallback error:', err);
      setError('Failed to load eligibility data');
    }
  };

  return { eligibility, isLoading, error, refetch: fetchEligibility };
}
