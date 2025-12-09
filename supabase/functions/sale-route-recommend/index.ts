import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SaleRequest {
  farmer_id: string;
  crop: string;
  quantity_kg: number;
  grade: string;
  district: string;
  pincode: string;
}

interface BuyerOption {
  buyer_name: string;
  buyer_type: string;
  price_per_kg: number;
  expected_income: number;
  contact_info: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: SaleRequest = await req.json();
    const { farmer_id, crop, quantity_kg, grade, district, pincode } = body;

    console.log('Received request:', { farmer_id, crop, quantity_kg, grade, district, pincode });

    // Validate input
    if (!farmer_id || !crop || !quantity_kg || !grade || !district || !pincode) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['A', 'B', 'C'].includes(grade)) {
      return new Response(
        JSON.stringify({ error: 'Invalid grade. Must be A, B, or C' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert harvest batch
    const { data: harvestBatch, error: harvestError } = await supabase
      .from('harvest_batches')
      .insert({
        farmer_id,
        crop,
        quantity_kg,
        grade,
        district,
        pincode,
        harvest_date: new Date().toISOString()
      })
      .select()
      .single();

    if (harvestError) {
      console.error('Error inserting harvest batch:', harvestError);
      return new Response(
        JSON.stringify({ error: 'Failed to log harvest batch' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Harvest batch created:', harvestBatch.id);

    // Grade ranking for comparison: A=1, B=2, C=3
    const gradeRank: Record<string, number> = { 'A': 1, 'B': 2, 'C': 3 };
    const inputGradeRank = gradeRank[grade];

    let factoryOptions: BuyerOption[] = [];
    let localOptions: BuyerOption[] = [];

    // Fetch factory/oil_mill options only for grade A or B
    if (grade === 'A' || grade === 'B') {
      const { data: factories, error: factoryError } = await supabase
        .from('buyers')
        .select('*')
        .in('type', ['factory', 'oil_mill'])
        .contains('crops_accepted', [crop])
        .eq('district', district);

      if (factoryError) {
        console.error('Error fetching factories:', factoryError);
      } else if (factories) {
        factoryOptions = factories
          .filter(buyer => gradeRank[buyer.min_grade] >= inputGradeRank)
          .map(buyer => ({
            buyer_name: buyer.name,
            buyer_type: buyer.type,
            price_per_kg: Number(buyer.price_per_kg),
            expected_income: Number(quantity_kg) * Number(buyer.price_per_kg),
            contact_info: buyer.contact_info || ''
          }))
          .sort((a, b) => b.expected_income - a.expected_income);
      }
    }

    // Fetch local vendor options (always available)
    const { data: localVendors, error: localError } = await supabase
      .from('buyers')
      .select('*')
      .eq('type', 'local_vendor')
      .contains('crops_accepted', [crop])
      .eq('district', district);

    if (localError) {
      console.error('Error fetching local vendors:', localError);
    } else if (localVendors) {
      localOptions = localVendors
        .filter(buyer => gradeRank[buyer.min_grade] >= inputGradeRank)
        .map(buyer => ({
          buyer_name: buyer.name,
          buyer_type: buyer.type,
          price_per_kg: Number(buyer.price_per_kg),
          expected_income: Number(quantity_kg) * Number(buyer.price_per_kg),
          contact_info: buyer.contact_info || ''
        }))
        .sort((a, b) => b.expected_income - a.expected_income);
    }

    // Determine best channel
    const bestFactoryIncome = factoryOptions.length > 0 ? factoryOptions[0].expected_income : 0;
    const bestLocalIncome = localOptions.length > 0 ? localOptions[0].expected_income : 0;

    let bestChannel: string;
    let bestChannelExplanation: string;
    let gradeExplanation: string;
    let expectedIncomeBest: number;

    if (grade === 'C') {
      bestChannel = 'local';
      expectedIncomeBest = bestLocalIncome;
      bestChannelExplanation = `Because your ${crop.toLowerCase()} is Grade C, factories will not pay a premium. Best option is to sell locally.`;
      gradeExplanation = 'Lower-grade produce typically goes to local vendors or small food stalls.';
    } else {
      if (factoryOptions.length > 0 && bestFactoryIncome > bestLocalIncome) {
        bestChannel = factoryOptions[0].buyer_type === 'oil_mill' ? 'oil_mill' : 'factory';
        expectedIncomeBest = bestFactoryIncome;
        const channelName = factoryOptions[0].buyer_type === 'oil_mill' ? 'oil mill' : 'factory';
        bestChannelExplanation = `Selling to ${factoryOptions[0].buyer_name} (${channelName}) gives ₹${bestFactoryIncome.toLocaleString('en-IN')} vs ₹${bestLocalIncome.toLocaleString('en-IN')} from local vendors.`;
      } else {
        bestChannel = 'local';
        expectedIncomeBest = bestLocalIncome;
        if (localOptions.length > 0) {
          bestChannelExplanation = `Best option is local vendor ${localOptions[0].buyer_name} offering ₹${bestLocalIncome.toLocaleString('en-IN')}.`;
        } else {
          bestChannelExplanation = 'No buyers found in your area for this crop.';
        }
      }
      gradeExplanation = `Your ${crop.toLowerCase()} is Grade ${grade}, so it is suitable for both factories and local vendors.`;
    }

    // Insert sale recommendation
    const { error: recError } = await supabase
      .from('sale_recommendations')
      .insert({
        harvest_batch_id: harvestBatch.id,
        best_channel: bestChannel,
        expected_income_best: expectedIncomeBest
      });

    if (recError) {
      console.error('Error inserting recommendation:', recError);
    }

    // Fetch value-added info for explanation
    let valueAddedInfo = '';
    if (grade !== 'C' && factoryOptions.length > 0) {
      const { data: valueAdded } = await supabase
        .from('value_added_options')
        .select('*')
        .eq('crop', crop)
        .limit(1)
        .single();

      if (valueAdded) {
        valueAddedInfo = `Factories convert your ${crop.toLowerCase()} into ${valueAdded.product}, which sells for ₹${valueAdded.selling_price_per_kg}/kg. This is why they can afford to pay farmers more for good quality produce.`;
      }
    }

    const response = {
      harvest_batch_id: harvestBatch.id,
      grade,
      crop,
      quantity_kg,
      district,
      factory_options: factoryOptions,
      local_options: localOptions,
      best_channel: bestChannel,
      best_channel_explanation: bestChannelExplanation,
      grade_explanation: gradeExplanation,
      value_added_info: valueAddedInfo,
      expected_income_best: expectedIncomeBest
    };

    console.log('Sending response:', response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
