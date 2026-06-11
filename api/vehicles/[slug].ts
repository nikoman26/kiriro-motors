import { methodNotAllowed, json, requireSupabase } from '../_lib/http';
import { vehicleFromRow } from '../_lib/mappers';
import { supabaseAdmin } from '../_lib/supabase';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (!requireSupabase(res, supabaseAdmin)) return;

  const slug = String(req.query.slug ?? '');
  const { data, error } = await supabaseAdmin!
    .from('vehicles')
    .select('*')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .in('availability', ['Available', 'Reserved'])
    .maybeSingle();

  if (error) return json(res, 500, { error: error.message });
  if (!data) return json(res, 404, { error: 'Vehicle not found.' });

  return json(res, 200, { vehicle: vehicleFromRow(data) });
}
