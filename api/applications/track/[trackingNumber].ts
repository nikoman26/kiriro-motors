import { methodNotAllowed, json, requireSupabase } from '../../_lib/http';
import { applicationFromRow } from '../../_lib/mappers';
import { supabaseAdmin } from '../../_lib/supabase';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (!requireSupabase(res, supabaseAdmin)) return;

  const trackingNumber = String(req.query.trackingNumber ?? '');
  const { data, error } = await supabaseAdmin!
    .from('loan_applications')
    .select('*')
    .eq('tracking_number', trackingNumber)
    .maybeSingle();

  if (error) return json(res, 500, { error: error.message });
  if (!data) return json(res, 404, { error: 'Application not found.' });

  const application = applicationFromRow(data);
  return json(res, 200, {
    application: {
      id: application.id,
      trackingNumber: application.trackingNumber,
      type: application.type,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    },
  });
}
