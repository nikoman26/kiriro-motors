import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && serviceKey);

export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl!, serviceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export const supabaseAuth = supabaseUrl && publicKey
  ? createClient(supabaseUrl, publicKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export function getCookie(req: any, name: string) {
  const cookie = String(req.headers.cookie ?? '');
  const found = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.split('=').slice(1).join('=')) : '';
}

export async function requireAdmin(req: any, res: any) {
  if (!supabaseAdmin) {
    res.status(503).json({ error: 'Supabase admin client is not configured.' });
    return null;
  }

  const authorization = String(req.headers.authorization ?? '');
  const bearerToken = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : '';
  const token = bearerToken || getCookie(req, 'kiriro_admin_token');

  if (!token) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired admin session.' });
    return null;
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('admin_profiles')
    .select('id,email,role')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    res.status(403).json({ error: 'This user is not an admin.' });
    return null;
  }

  return { user: data.user, profile };
}
