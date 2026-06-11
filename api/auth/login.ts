import { methodNotAllowed, json, readBody, requireSupabase } from '../_lib/http';
import { supabaseAdmin, supabaseAuth } from '../_lib/supabase';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireSupabase(res, supabaseAdmin) || !requireSupabase(res, supabaseAuth)) return;

  const { email, password } = await readBody<{ email: string; password: string }>(req);
  const { data, error } = await supabaseAuth!.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) return json(res, 401, { error: error?.message ?? 'Invalid login.' });

  const { data: profile, error: profileError } = await supabaseAdmin!
    .from('admin_profiles')
    .select('id,email,role')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) return json(res, 403, { error: 'This user is not configured as a Kiriro admin.' });

  res.setHeader('Set-Cookie', [
    `kiriro_admin_token=${encodeURIComponent(data.session.access_token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 8}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  ]);
  return json(res, 200, { profile, accessToken: data.session.access_token });
}
