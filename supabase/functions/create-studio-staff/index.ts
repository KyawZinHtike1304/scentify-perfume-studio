import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405, headers: corsHeaders });
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return Response.json({ error: 'Sign in as an administrator to add staff.' }, {
      status: 401,
      headers: corsHeaders,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY function secret.');
    return Response.json({ error: 'Staff account provisioning is not configured.' }, {
      status: 500,
      headers: corsHeaders,
    });
  }

  const token = authorization.slice('Bearer '.length);
  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || serviceRoleKey);
  const { data: requester, error: requesterError } = await userClient.auth.getUser(token);
  if (requesterError || requester.user?.app_metadata?.role !== 'admin') {
    return Response.json({ error: 'Only an administrator can add staff accounts.' }, {
      status: 403,
      headers: corsHeaders,
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400, headers: corsHeaders });
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';
  const action = payload.action === 'update' ? 'update' : 'create';
  const userId = typeof payload.userId === 'string' ? payload.userId : '';
  const role = payload.role;
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Enter a valid staff name and email address.' }, {
      status: 400,
      headers: corsHeaders,
    });
  }
  if ((action === 'create' || password.length > 0) && password.length < 6) {
    return Response.json({ error: 'Staff passwords must be at least 6 characters.' }, {
      status: 400,
      headers: corsHeaders,
    });
  }
  if (role !== 'admin' && role !== 'staff' && role !== 'perfumer') {
    return Response.json({ error: 'Invalid staff role.' }, { status: 400, headers: corsHeaders });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = action === 'create'
    ? await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role },
        user_metadata: { display_name: name, title, phone },
      })
    : userId
    ? await adminClient.auth.admin.updateUserById(userId, {
        email,
        email_confirm: true,
        ...(password ? { password } : {}),
        app_metadata: { role },
        user_metadata: { display_name: name, title, phone },
      })
    : { data: null, error: new Error('A Supabase user ID is required to update a staff account.') };

  if (error) {
    console.error(`Failed to ${action} Supabase staff account:`, error);
    return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
  }

  return Response.json(
    { userId: data.user.id },
    { status: action === 'create' ? 201 : 200, headers: corsHeaders }
  );
});
