import { methodNotAllowed, json, readBody } from '../../_lib/http';
import { applicationFromRow } from '../../_lib/mappers';
import { requireAdmin, supabaseAdmin } from '../../_lib/supabase';

export default async function handler(req: any, res: any) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);

  const id = String(req.query.id ?? '');
  const body = await readBody<any>(req);

  const { data: current, error: currentError } = await supabaseAdmin!
    .from('loan_applications')
    .select('status,notes')
    .eq('id', id)
    .single();
  if (currentError) return json(res, 404, { error: currentError.message });

  const notes = body.note ? [body.note, ...(current.notes ?? [])] : current.notes ?? [];
  const { data, error } = await supabaseAdmin!
    .from('loan_applications')
    .update({ status: body.status, notes, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return json(res, 400, { error: error.message });

  await supabaseAdmin!.from('application_status_history').insert({
    application_id: id,
    previous_status: current.status,
    next_status: body.status,
    admin_user_id: admin.user.id,
    note: body.note,
  });

  return json(res, 200, { application: applicationFromRow(data) });
}
