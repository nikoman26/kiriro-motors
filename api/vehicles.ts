import { methodNotAllowed, json, requireSupabase } from './_lib/http';
import { vehicleFromRow } from './_lib/mappers';
import { supabaseAdmin } from './_lib/supabase';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (!requireSupabase(res, supabaseAdmin)) return;

  const query = req.query ?? {};
  let request = supabaseAdmin!
    .from('vehicles')
    .select('*')
    .in('availability', ['Available', 'Reserved'])
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (query.make) request = request.eq('make', String(query.make));
  if (query.bodyType) request = request.eq('body_type', String(query.bodyType));
  if (query.maxPrice) request = request.lte('price', Number(query.maxPrice));
  if (query.minYear) request = request.gte('year', Number(query.minYear));

  const { data, error } = await request;
  if (error) return json(res, 500, { error: error.message });

  return json(res, 200, { items: (data ?? []).map(vehicleFromRow) });
}
