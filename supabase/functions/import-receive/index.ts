import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: corsHeaders,
    })
  }

  const url = new URL(req.url)
  const token = url.pathname.split('/').pop()

  if (!token || token.length < 10) {
    return new Response(JSON.stringify({ error: 'Missing or invalid token' }), {
      status: 400, headers: corsHeaders,
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: importToken, error: tokenError } = await supabase
    .from('import_tokens')
    .select('id, status, expires_at')
    .eq('id', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single()

  if (tokenError || !importToken) {
    return new Response(JSON.stringify({ error: 'Invalid or expired import token' }), {
      status: 404, headers: corsHeaders,
    })
  }

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Request body must be valid JSON' }), {
      status: 400, headers: corsHeaders,
    })
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('version' in payload) ||
    !('name' in payload)
  ) {
    return new Response(JSON.stringify({ error: 'Payload missing required fields (version, name)' }), {
      status: 422, headers: corsHeaders,
    })
  }

  const { error: updateError } = await supabase
    .from('import_tokens')
    .update({ status: 'received', payload })
    .eq('id', token)

  if (updateError) {
    return new Response(JSON.stringify({ error: 'Failed to store payload' }), {
      status: 500, headers: corsHeaders,
    })
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Schema received. Return to Atelier to complete the import.' }),
    { status: 200, headers: corsHeaders },
  )
})
