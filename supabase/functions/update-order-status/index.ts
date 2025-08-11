import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create a Supabase client with the user's token to verify authentication
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get user profile to check permissions
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('User profile not found')
    }

    // Check if user has permission (admin or gestor_almoxarifado)
    if (!profile.is_active || (profile.role !== 'admin' && profile.role !== 'gestor_almoxarifado')) {
      throw new Error('Insufficient permissions')
    }

    // Parse request body
    const { orderId, status } = await req.json()

    if (!orderId || !status) {
      throw new Error('Missing orderId or status')
    }

    // Validate status
    const validStatuses = ['approved', 'delivered', 'received', 'cancelled']
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status')
    }

    // Prepare update data
    const now = new Date().toISOString()
    const updateData: Record<string, any> = { status }

    if (status === 'approved') {
      updateData.approved_by = user.id
      updateData.approved_at = now
    } else if (status === 'delivered') {
      updateData.delivered_at = now
    } else if (status === 'received') {
      updateData.received_by = user.id
      updateData.received_at = now
    }

    // Update the order using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('order_requests')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})