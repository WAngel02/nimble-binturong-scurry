import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Solo los administradores pueden crear doctores' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { email, password, full_name, specialties, phone, address } = await req.json()

    if (!email || !password || !full_name) {
      return new Response(JSON.stringify({ error: 'Email, contraseña y nombre son requeridos' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'doctor' }
    })

    if (authCreateError) {
      return new Response(JSON.stringify({ error: 'Error al crear usuario: ' + authCreateError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const profileData = {
      full_name,
      specialties: specialties || [],
      role: 'doctor',
      phone: phone || null,
      address: address || null
    };

    const { data: existingProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', authData.user.id).single()

    if (existingProfile) {
      const { error: updateError } = await supabaseAdmin.from('profiles').update(profileData).eq('id', authData.user.id)
      if (updateError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return new Response(JSON.stringify({ error: 'Error al actualizar perfil del doctor: ' + updateError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    } else {
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({ id: authData.user.id, ...profileData })
      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return new Response(JSON.stringify({ error: 'Error al crear perfil del doctor: ' + profileError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    return new Response(JSON.stringify({ success: true, doctor: { id: authData.user.id, email: authData.user.email, ...profileData } }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error interno del servidor: ' + error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})