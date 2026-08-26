import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  const url = new URL(req.url);
  const orgId = url.searchParams.get('organization_id');
  const search = url.searchParams.get('search');

  if (req.method === 'GET') {
    let query = supabaseClient.from('challan_invoices').select('*').order('created_at', { ascending: false });
    if (orgId && orgId !== 'ALL') query = query.eq('organization_id', orgId);
    if (search) query = query.or(`customer_name.ilike.%${search}%,challan_no.ilike.%${search}%,invoice_no.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return new Response(JSON.stringify({ success: false, error: { message: error.message } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify({ success: true, data: data || [], meta: { total: data?.length || 0 } }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (req.method === 'POST') {
    const body = await req.json();
    const items = body.records || body.challans || [body];
    const { data, error } = await supabaseClient.from('challan_invoices').upsert(items, { onConflict: 'challan_no' }).select();
    if (error) return new Response(JSON.stringify({ success: false, error: { message: error.message } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify({ success: true, data }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
});
