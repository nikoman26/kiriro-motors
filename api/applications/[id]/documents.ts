import { methodNotAllowed, json, readBody, requireSupabase } from '../../_lib/http';
import { supabaseAdmin } from '../../_lib/supabase';

const documentsBucket = process.env.SUPABASE_DOCUMENTS_BUCKET ?? 'kiriro-loan-documents';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireSupabase(res, supabaseAdmin)) return;

  const applicationId = String(req.query.id ?? '');
  const body = await readBody<any>(req);
  const fileName = String(body.fileName ?? '');
  const mimeType = String(body.mimeType ?? 'application/octet-stream');
  const sizeBytes = Number(body.sizeBytes ?? 0);

  if (!fileName) return json(res, 400, { error: 'fileName is required.' });

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, '-');
  const storageKey = `${applicationId}/${Date.now()}-${safeName}`;
  const { data: upload, error: uploadError } = await supabaseAdmin!.storage
    .from(documentsBucket)
    .createSignedUploadUrl(storageKey);

  if (uploadError) return json(res, 500, { error: uploadError.message });

  const { data: document, error } = await supabaseAdmin!
    .from('loan_documents')
    .insert({
      application_id: applicationId,
      document_type: body.documentType,
      file_name: fileName,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      storage_key: storageKey,
    })
    .select('*')
    .single();

  if (error) return json(res, 400, { error: error.message });
  return json(res, 201, { document, signedUpload: upload });
}
