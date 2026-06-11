import { methodNotAllowed, json } from '../_lib/http';
import { applicationFromRow } from '../_lib/mappers';
import { requireAdmin, supabaseAdmin } from '../_lib/supabase';

export default async function handler(req: any, res: any) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const { data, error } = await supabaseAdmin!.from('loan_applications').select('*').order('created_at', { ascending: false });
  if (error) return json(res, 500, { error: error.message });
  return json(res, 200, { items: (data ?? []).map(applicationFromRow) });
}
