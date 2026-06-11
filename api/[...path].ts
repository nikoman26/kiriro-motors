import { json, methodNotAllowed, readBody, requireSupabase } from './_lib/http';
import {
  applicationFromRow,
  applicationToRow,
  leadFromRow,
  leadToRow,
  vehicleFromRow,
  vehicleToRow,
} from './_lib/mappers';
import { requireAdmin, supabaseAdmin, supabaseAuth } from './_lib/supabase';

const documentsBucket = process.env.SUPABASE_DOCUMENTS_BUCKET ?? 'kiriro-loan-documents';

function getPathSegments(req: any) {
  const path = req.query?.path;
  if (Array.isArray(path)) return path.map(String);
  if (typeof path === 'string' && path) return path.split('/').filter(Boolean);
  return [];
}

function trackingPrefix(type: string) {
  if (type === 'land-title') return 'KR-LD';
  if (type === 'logbook') return 'KR-LB';
  return 'KR-VF';
}

function createTrackingNumber(type: string) {
  return `${trackingPrefix(type)}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

async function listPublicVehicles(req: any, res: any) {
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

async function getPublicVehicle(req: any, res: any, slug: string) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (!requireSupabase(res, supabaseAdmin)) return;

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

async function createLead(req: any, res: any) {
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

async function createApplication(req: any, res: any) {
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

async function trackApplication(req: any, res: any, trackingNumber: string) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (!requireSupabase(res, supabaseAdmin)) return;

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

async function createDocumentUpload(req: any, res: any, applicationId: string) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireSupabase(res, supabaseAdmin)) return;

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

async function loginAdmin(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireSupabase(res, supabaseAdmin) || !requireSupabase(res, supabaseAuth)) return;

  const { email, password } = await readBody<{ email: string; password: string }>(req);
  const { data, error } = await supabaseAuth!.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) return json(res, 401, { error: error?.message ?? 'Invalid login.' });

  const { data: profile, error: profileError } = await supabaseAdmin!
    .from('admin_profiles')
    .select('id,email,role')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) return json(res, 403, { error: 'This user is not configured as a Kiriro admin.' });

  res.setHeader('Set-Cookie', [
    `kiriro_admin_token=${encodeURIComponent(data.session.access_token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 8}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  ]);
  return json(res, 200, { profile, accessToken: data.session.access_token });
}

async function logoutAdmin(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  res.setHeader('Set-Cookie', 'kiriro_admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  return json(res, 200, { ok: true });
}

async function getCurrentAdmin(req: any, res: any) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  return json(res, 200, { profile: admin.profile });
}

async function handleAdmin(req: any, res: any, segments: string[]) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const resource = segments[1];
  const id = segments[2];
  const action = segments[3];

  if (resource === 'vehicles' && segments.length === 2) {
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

  if (resource === 'vehicles' && id && segments.length === 3) {
    if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);

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

  if (resource === 'leads' && segments.length === 2) {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

    const { data, error } = await supabaseAdmin!.from('leads').select('*').order('created_at', { ascending: false });
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { items: (data ?? []).map(leadFromRow) });
  }

  if (resource === 'leads' && id && segments.length === 3) {
    if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);

    const body = await readBody<any>(req);
    const { data, error } = await supabaseAdmin!
      .from('leads')
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return json(res, 400, { error: error.message });
    return json(res, 200, { lead: leadFromRow(data) });
  }

  if (resource === 'applications' && segments.length === 2) {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

    const { data, error } = await supabaseAdmin!.from('loan_applications').select('*').order('created_at', { ascending: false });
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { items: (data ?? []).map(applicationFromRow) });
  }

  if (resource === 'applications' && id && segments.length === 3) {
    if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);

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

  if (resource === 'documents' && id && action === 'signed-url' && segments.length === 4) {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

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

  return json(res, 404, { error: 'Admin API route not found.' });
}

export default async function handler(req: any, res: any) {
  const segments = getPathSegments(req);
  const [root, second, third] = segments;

  if (root === 'vehicles' && segments.length === 1) return listPublicVehicles(req, res);
  if (root === 'vehicles' && second && segments.length === 2) return getPublicVehicle(req, res, second);
  if (root === 'leads' && segments.length === 1) return createLead(req, res);

  if (root === 'applications' && segments.length === 1) return createApplication(req, res);
  if (root === 'applications' && second === 'track' && third && segments.length === 3) {
    return trackApplication(req, res, third);
  }
  if (root === 'applications' && second && third === 'documents' && segments.length === 3) {
    return createDocumentUpload(req, res, second);
  }

  if (root === 'auth' && second === 'login' && segments.length === 2) return loginAdmin(req, res);
  if (root === 'auth' && second === 'logout' && segments.length === 2) return logoutAdmin(req, res);
  if (root === 'auth' && second === 'me' && segments.length === 2) return getCurrentAdmin(req, res);

  if (root === 'admin') return handleAdmin(req, res, segments);

  return json(res, 404, { error: 'API route not found.' });
}
