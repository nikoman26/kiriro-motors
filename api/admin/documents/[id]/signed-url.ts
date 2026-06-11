import { methodNotAllowed, json } from '../../../_lib/http';
import { requireAdmin, supabaseAdmin } from '../../../_lib/supabase';

const documentsBucket = process.env.SUPABASE_DOCUMENTS_BUCKET ?? 'kiriro-loan-documents';

export default async function handler(req: any, res: any) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const id = String(req.query.id ?? '');
  const { data: document, error } = await supabaseAdmin!
    .from('loan_documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return json(res, 404, { error: error.message });

  const { data, error: signedError } = await supabaseAdmin!.storage
    .from(documentsBucket)
    .createSignedUrl(document.storage_key, 60 * 5);

  if (signedError) return json(res, 500, { error: signedError.message });
  return json(res, 200, { url: data.signedUrl, document });
}
