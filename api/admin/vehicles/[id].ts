import { methodNotAllowed, json, readBody } from '../../_lib/http';
import { vehicleFromRow } from '../../_lib/mappers';
import { requireAdmin, supabaseAdmin } from '../../_lib/supabase';

export default async function handler(req: any, res: any) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);

  const id = String(req.query.id ?? '');
  const body = await readBody<any>(req);
  const patch: Record<string, unknown> = {};

  if (body.availability) patch.availability = body.availability;
  if (typeof body.featured === 'boolean') patch.featured = body.featured;
  if (body.vehicle) Object.assign(patch, body.vehicle);
  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin!
    .from('vehicles')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return json(res, 400, { error: error.message });
  return json(res, 200, { vehicle: vehicleFromRow(data) });
}
