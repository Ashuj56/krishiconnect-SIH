import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, harvest_batch_id, ticket_code, final_grade } = await req.json();

    if (action === 'create') {
      // Fetch harvest batch details
      const { data: batch, error: batchError } = await supabase
        .from('harvest_batches')
        .select('*')
        .eq('id', harvest_batch_id)
        .single();

      if (batchError || !batch) {
        console.error('Batch fetch error:', batchError);
        return new Response(
          JSON.stringify({ error: 'Harvest batch not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate unique ticket code
      const ticketCode = generateTicketCode();

      // Create grade ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('grade_tickets')
        .insert({
          harvest_batch_id: batch.id,
          crop: batch.crop,
          quantity_kg: batch.quantity_kg,
          preliminary_grade: batch.preliminary_grade,
          district: batch.district,
          pincode: batch.pincode,
          ticket_code: ticketCode,
        })
        .select()
        .single();

      if (ticketError) {
        console.error('Ticket creation error:', ticketError);
        return new Response(
          JSON.stringify({ error: 'Failed to create ticket' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Grade ticket created:', ticket);
      return new Response(
        JSON.stringify({ ticket }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get') {
      // Fetch ticket by code
      const { data: ticket, error: ticketError } = await supabase
        .from('grade_tickets')
        .select('*, harvest_batches(*)')
        .eq('ticket_code', ticket_code.toUpperCase())
        .single();

      if (ticketError || !ticket) {
        console.error('Ticket fetch error:', ticketError);
        return new Response(
          JSON.stringify({ error: 'Ticket not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ ticket }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify') {
      // Update final grade on harvest batch
      const { data: ticket, error: ticketError } = await supabase
        .from('grade_tickets')
        .select('harvest_batch_id')
        .eq('ticket_code', ticket_code.toUpperCase())
        .single();

      if (ticketError || !ticket) {
        console.error('Ticket not found for verification:', ticketError);
        return new Response(
          JSON.stringify({ error: 'Ticket not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: updateError } = await supabase
        .from('harvest_batches')
        .update({ final_grade })
        .eq('id', ticket.harvest_batch_id);

      if (updateError) {
        console.error('Grade update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update final grade' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Final grade updated:', { ticket_code, final_grade });
      return new Response(
        JSON.stringify({ success: true, final_grade }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
