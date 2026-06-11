import { methodNotAllowed, json, readBody, requireSupabase } from './_lib/http';
import { leadFromRow, leadToRow } from './_lib/mappers';
import { supabaseAdmin } from './_lib/supabase';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireSupabase(res, supabaseAdmin)) return;

  const body = await readBody(req);
  const { data, error } = await supabaseAdmin!
    .from('leads')
    .insert(leadToRow(body as any))
    .select('*')
    .single();

  if (error) return json(res, 400, { error: error.message });
  return json(res, 201, { lead: leadFromRow(data) });
}
