import { methodNotAllowed, json, readBody } from '../../_lib/http';
import { leadFromRow } from '../../_lib/mappers';
import { requireAdmin, supabaseAdmin } from '../../_lib/supabase';

export default async function handler(req: any, res: any) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);

  const id = String(req.query.id ?? '');
  const body = await readBody<any>(req);
  const { data, error } = await supabaseAdmin!
    .from('leads')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return json(res, 400, { error: error.message });
  return json(res, 200, { lead: leadFromRow(data) });
}
