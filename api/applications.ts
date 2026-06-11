import { methodNotAllowed, json, readBody, requireSupabase } from './_lib/http';
import { applicationFromRow, applicationToRow } from './_lib/mappers';
import { supabaseAdmin } from './_lib/supabase';

function trackingPrefix(type: string) {
  if (type === 'land-title') return 'KR-LD';
  if (type === 'logbook') return 'KR-LB';
  return 'KR-VF';
}

function createTrackingNumber(type: string) {
  return `${trackingPrefix(type)}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireSupabase(res, supabaseAdmin)) return;

  const body = await readBody<any>(req);
  const now = new Date().toISOString();
  const row = applicationToRow({
    ...body,
    trackingNumber: createTrackingNumber(body.type),
    status: 'Submitted',
    notes: [],
    createdAt: now,
    updatedAt: now,
  });

  const { data, error } = await supabaseAdmin!
    .from('loan_applications')
    .insert(row)
    .select('*')
    .single();

  if (error) return json(res, 400, { error: error.message });
  return json(res, 201, { application: applicationFromRow(data) });
}
