import { methodNotAllowed, json, readBody } from '../_lib/http';
import { vehicleFromRow, vehicleToRow } from '../_lib/mappers';
import { requireAdmin, supabaseAdmin } from '../_lib/supabase';

export default async function handler(req: any, res: any) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin!.from('vehicles').select('*').order('created_at', { ascending: false });
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { items: (data ?? []).map(vehicleFromRow) });
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    const { data, error } = await supabaseAdmin!
      .from('vehicles')
      .insert(vehicleToRow(body as any))
      .select('*')
      .single();

    if (error) return json(res, 400, { error: error.message });
    return json(res, 201, { vehicle: vehicleFromRow(data) });
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}
