import { json, methodNotAllowed, readBody, requireSupabase } from './_lib/http';
import {
  adminProfileFromRow,
  adminProfileToRow,
  applicationFromRow,
  applicationToRow,
  auditEventFromRow,
  documentFromRow,
  leadFromRow,
  leadToRow,
  vehicleFromRow,
  vehicleToRow,
} from './_lib/mappers';
import { forbid, requireAdmin, roleAllowed, supabaseAdmin, supabaseAuth } from './_lib/supabase';
import type { AdminProfile, AdminRole } from '../src/types';

const documentsBucket = process.env.SUPABASE_DOCUMENTS_BUCKET ?? 'kiriro-loan-documents';
const vehiclesBucket = process.env.SUPABASE_VEHICLES_BUCKET ?? 'kiriro-vehicle-images';
const maxDocumentSize = 10 * 1024 * 1024;
const maxVehicleImageSize = 15 * 1024 * 1024;
const maxDocumentsPerApplication = 10;
const allowedDocumentTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

type AdminContext = NonNullable<Awaited<ReturnType<typeof requireAdmin>>>;

function getPathSegments(req: any) {
  const path = req.query?.path;
  if (Array.isArray(path)) return path.map(String);
  if (typeof path === 'string' && path) return path.split('/').filter(Boolean);
  return [];
}

function queryValue(value: unknown) {
  return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');
}

function trackingPrefix(type: string) {
  if (type === 'land-title') return 'KR-LD';
  if (type === 'logbook') return 'KR-LB';
  return 'KR-VF';
}

function createTrackingNumber(type: string) {
  return `${trackingPrefix(type)}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'upload';
}

function canManageInventory(admin: AdminContext) {
  return roleAllowed(admin.profile.role, ['admin']);
}

function canManageStaff(admin: AdminContext) {
  return admin.profile.role === 'owner';
}

function canManageAssignments(admin: AdminContext) {
  return roleAllowed(admin.profile.role, ['admin']);
}

function canAccessAssigned(admin: AdminContext, row: { assigned_to?: string | null }) {
  return admin.profile.role !== 'staff' || row.assigned_to === admin.user.id;
}

function applyStaffScope<T extends { eq: (column: string, value: string) => T }>(request: T, admin: AdminContext) {
  return admin.profile.role === 'staff' ? request.eq('assigned_to', admin.user.id) : request;
}

async function writeAudit(admin: AdminContext | null, action: string, entityType: string, entityId?: string, metadata: Record<string, unknown> = {}) {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from('admin_audit_events').insert({
    admin_user_id: admin?.user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
}

async function getAdminProfile(profileId?: string | null): Promise<AdminProfile | undefined> {
  if (!profileId || !supabaseAdmin) return undefined;
  const { data } = await supabaseAdmin.from('admin_profiles').select('*').eq('id', profileId).maybeSingle();
  return data ? adminProfileFromRow(data) : undefined;
}

function publicVehicleImageUrl(storageKey: string) {
  return supabaseAdmin!.storage.from(vehiclesBucket).getPublicUrl(storageKey).data.publicUrl;
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

  if (query.make) request = request.eq('make', queryValue(query.make));
  if (query.bodyType) request = request.eq('body_type', queryValue(query.bodyType));
  if (query.maxPrice) request = request.lte('price', Number(queryValue(query.maxPrice)));
  if (query.minYear) request = request.gte('year', Number(queryValue(query.minYear)));

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
  const documentType = String(body.documentType ?? 'Supporting document');

  if (!fileName) return json(res, 400, { error: 'fileName is required.' });
  if (!allowedDocumentTypes.has(mimeType)) return json(res, 400, { error: 'Only PDF, JPEG, PNG, and WebP documents are allowed.' });
  if (sizeBytes > maxDocumentSize) return json(res, 400, { error: 'Documents must be 10 MB or smaller.' });

  const { data: application, error: appError } = await supabaseAdmin!
    .from('loan_applications')
    .select('id')
    .eq('id', applicationId)
    .single();
  if (appError || !application) return json(res, 404, { error: 'Application not found.' });

  const { count, error: countError } = await supabaseAdmin!
    .from('loan_documents')
    .select('id', { count: 'exact', head: true })
    .eq('application_id', applicationId);
  if (countError) return json(res, 500, { error: countError.message });
  if ((count ?? 0) >= maxDocumentsPerApplication) return json(res, 400, { error: 'Maximum document count reached for this application.' });

  const storageKey = `${applicationId}/${Date.now()}-${safeFileName(fileName)}`;
  const { data: upload, error: uploadError } = await supabaseAdmin!.storage
    .from(documentsBucket)
    .createSignedUploadUrl(storageKey);

  if (uploadError) return json(res, 500, { error: uploadError.message });

  const { data: document, error } = await supabaseAdmin!
    .from('loan_documents')
    .insert({
      application_id: applicationId,
      document_type: documentType,
      file_name: fileName,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      storage_key: storageKey,
      uploaded: false,
    })
    .select('*')
    .single();

  if (error) return json(res, 400, { error: error.message });
  return json(res, 201, { document: documentFromRow(document), signedUpload: upload });
}

async function completeDocumentUpload(req: any, res: any, applicationId: string, documentId: string) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireSupabase(res, supabaseAdmin)) return;

  const { data, error } = await supabaseAdmin!
    .from('loan_documents')
    .update({ uploaded: true, uploaded_at: new Date().toISOString() })
    .eq('id', documentId)
    .eq('application_id', applicationId)
    .select('*')
    .single();

  if (error) return json(res, 400, { error: error.message });
  return json(res, 200, { document: documentFromRow(data) });
}

async function loginAdmin(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireSupabase(res, supabaseAdmin) || !requireSupabase(res, supabaseAuth)) return;

  const { email, password } = await readBody<{ email: string; password: string }>(req);
  const { data, error } = await supabaseAuth!.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) return json(res, 401, { error: error?.message ?? 'Invalid login.' });

  const { data: profileRow, error: profileError } = await supabaseAdmin!
    .from('admin_profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profileRow) return json(res, 403, { error: 'This user is not configured as a Kiriro admin.' });
  const profile = adminProfileFromRow(profileRow);
  if (!profile.isActive) return json(res, 403, { error: 'This admin account is inactive.' });

  res.setHeader('Set-Cookie', [
    `kiriro_admin_token=${encodeURIComponent(data.session.access_token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 8}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  ]);
  await writeAudit({ user: data.user, profile }, 'auth.login', 'admin_profile', profile.id);
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

async function listAdminVehicles(req: any, res: any, admin: AdminContext) {
  if (req.method === 'GET') {
    const search = queryValue(req.query?.search).trim();
    const status = queryValue(req.query?.status).trim();
    let request = supabaseAdmin!.from('vehicles').select('*').order('created_at', { ascending: false });
    if (status && status !== 'all') request = request.eq('availability', status);
    if (search) request = request.or(`make.ilike.%${search}%,model.ilike.%${search}%,slug.ilike.%${search}%,vin.ilike.%${search}%`);

    const { data, error } = await request;
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { items: (data ?? []).map(vehicleFromRow) });
  }

  if (req.method === 'POST') {
    if (!canManageInventory(admin)) return forbid(res);
    const body = await readBody(req);
    const { data, error } = await supabaseAdmin!
      .from('vehicles')
      .insert(vehicleToRow(body as any))
      .select('*')
      .single();

    if (error) return json(res, 400, { error: error.message });
    await writeAudit(admin, 'vehicle.create', 'vehicle', data.id);
    return json(res, 201, { vehicle: vehicleFromRow(data) });
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}

async function updateAdminVehicle(req: any, res: any, admin: AdminContext, id: string) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);
  if (!canManageInventory(admin)) return forbid(res);

  const body = await readBody<any>(req);
  const patch: Record<string, unknown> = {};

  if (body.availability) patch.availability = body.availability;
  if (typeof body.featured === 'boolean') patch.featured = body.featured;
  if (body.vehicle) {
    Object.assign(patch, vehicleToRow(body.vehicle));
    delete patch.id;
    delete patch.created_at;
  }
  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin!
    .from('vehicles')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return json(res, 400, { error: error.message });
  await writeAudit(admin, 'vehicle.update', 'vehicle', id, patch);
  return json(res, 200, { vehicle: vehicleFromRow(data) });
}

async function createVehicleImageUpload(req: any, res: any, admin: AdminContext) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!canManageInventory(admin)) return forbid(res);

  const body = await readBody<any>(req);
  const fileName = String(body.fileName ?? '');
  const mimeType = String(body.mimeType ?? 'application/octet-stream');
  const sizeBytes = Number(body.sizeBytes ?? 0);
  const vehicleId = body.vehicleId ? String(body.vehicleId) : null;

  if (!fileName) return json(res, 400, { error: 'fileName is required.' });
  if (!allowedImageTypes.has(mimeType)) return json(res, 400, { error: 'Only JPEG, PNG, and WebP vehicle images are allowed.' });
  if (sizeBytes > maxVehicleImageSize) return json(res, 400, { error: 'Vehicle images must be 15 MB or smaller.' });

  const storageKey = `${vehicleId ?? 'unassigned'}/${Date.now()}-${safeFileName(fileName)}`;
  const { data: upload, error: uploadError } = await supabaseAdmin!.storage
    .from(vehiclesBucket)
    .createSignedUploadUrl(storageKey);

  if (uploadError) return json(res, 500, { error: uploadError.message });

  const publicUrl = publicVehicleImageUrl(storageKey);
  if (vehicleId) {
    await supabaseAdmin!.from('vehicle_images').insert({
      vehicle_id: vehicleId,
      storage_key: storageKey,
      public_url: publicUrl,
      alt_text: body.altText,
      sort_order: Number(body.sortOrder ?? 0),
    });
  }

  await writeAudit(admin, 'vehicle_image.upload_url', 'vehicle', vehicleId ?? undefined, { storageKey });
  return json(res, 201, { signedUpload: upload, image: { storageKey, publicUrl, fileName } });
}

async function listApplications(req: any, res: any, admin: AdminContext) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const search = queryValue(req.query?.search).trim();
  const status = queryValue(req.query?.status).trim();
  const priority = queryValue(req.query?.priority).trim();
  let request = supabaseAdmin!.from('loan_applications').select('*').order('created_at', { ascending: false });
  request = applyStaffScope(request, admin);
  if (status && status !== 'all') request = request.eq('status', status);
  if (priority && priority !== 'all') request = request.eq('priority', priority);
  if (search) request = request.or(`tracking_number.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);

  const { data, error } = await request;
  if (error) return json(res, 500, { error: error.message });
  return json(res, 200, { items: (data ?? []).map(applicationFromRow) });
}

async function getApplicationDetail(req: any, res: any, admin: AdminContext, id: string) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const { data: application, error } = await supabaseAdmin!.from('loan_applications').select('*').eq('id', id).single();
  if (error) return json(res, 404, { error: error.message });
  if (!canAccessAssigned(admin, application)) return forbid(res);

  const [{ data: documents }, { data: history }, assignedAdmin] = await Promise.all([
    supabaseAdmin!.from('loan_documents').select('*').eq('application_id', id).order('created_at', { ascending: false }),
    supabaseAdmin!.from('application_status_history').select('*').eq('application_id', id).order('created_at', { ascending: false }),
    getAdminProfile(application.assigned_to),
  ]);

  return json(res, 200, {
    application: applicationFromRow({
      ...application,
      document_records: documents ?? [],
      history: history ?? [],
      assigned_admin: assignedAdmin,
    }),
  });
}

async function updateApplication(req: any, res: any, admin: AdminContext, id: string) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);

  const body = await readBody<any>(req);
  const { data: current, error: currentError } = await supabaseAdmin!
    .from('loan_applications')
    .select('*')
    .eq('id', id)
    .single();
  if (currentError) return json(res, 404, { error: currentError.message });
  if (!canAccessAssigned(admin, current)) return forbid(res);

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const statusChanged = body.status && body.status !== current.status;
  if (body.status) patch.status = body.status;
  if (body.note) patch.notes = [String(body.note), ...(current.notes ?? [])];
  if (canManageAssignments(admin)) {
    if ('assignedTo' in body) patch.assigned_to = body.assignedTo || null;
    if (body.priority) patch.priority = body.priority;
  } else if ('assignedTo' in body || body.priority) {
    return forbid(res);
  }

  const { data, error } = await supabaseAdmin!
    .from('loan_applications')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return json(res, 400, { error: error.message });

  if (statusChanged) {
    await supabaseAdmin!.from('application_status_history').insert({
      application_id: id,
      previous_status: current.status,
      next_status: body.status,
      admin_user_id: admin.user.id,
      note: body.note,
    });
  }

  await writeAudit(admin, 'application.update', 'loan_application', id, patch);
  return getApplicationDetail({ ...req, method: 'GET' }, res, admin, id);
}

async function listLeads(req: any, res: any, admin: AdminContext) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const search = queryValue(req.query?.search).trim();
  const status = queryValue(req.query?.status).trim();
  const priority = queryValue(req.query?.priority).trim();
  let request = supabaseAdmin!.from('leads').select('*').order('created_at', { ascending: false });
  request = applyStaffScope(request, admin);
  if (status && status !== 'all') request = request.eq('status', status);
  if (priority && priority !== 'all') request = request.eq('priority', priority);
  if (search) request = request.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%`);

  const { data, error } = await request;
  if (error) return json(res, 500, { error: error.message });
  return json(res, 200, { items: (data ?? []).map(leadFromRow) });
}

async function getLeadDetail(req: any, res: any, admin: AdminContext, id: string) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const { data: lead, error } = await supabaseAdmin!.from('leads').select('*').eq('id', id).single();
  if (error) return json(res, 404, { error: error.message });
  if (!canAccessAssigned(admin, lead)) return forbid(res);

  const assignedAdmin = await getAdminProfile(lead.assigned_to);
  return json(res, 200, { lead: leadFromRow({ ...lead, assigned_admin: assignedAdmin }) });
}

async function updateLead(req: any, res: any, admin: AdminContext, id: string) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);

  const body = await readBody<any>(req);
  const { data: current, error: currentError } = await supabaseAdmin!.from('leads').select('*').eq('id', id).single();
  if (currentError) return json(res, 404, { error: currentError.message });
  if (!canAccessAssigned(admin, current)) return forbid(res);

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status) patch.status = body.status;
  if (body.note) patch.notes = [String(body.note), ...(current.notes ?? [])];
  if (canManageAssignments(admin)) {
    if ('assignedTo' in body) patch.assigned_to = body.assignedTo || null;
    if (body.priority) patch.priority = body.priority;
  } else if ('assignedTo' in body || body.priority) {
    return forbid(res);
  }

  const { data, error } = await supabaseAdmin!
    .from('leads')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return json(res, 400, { error: error.message });
  await writeAudit(admin, 'lead.update', 'lead', id, patch);
  return json(res, 200, { lead: leadFromRow(data) });
}

async function getDocumentSignedUrl(req: any, res: any, admin: AdminContext, id: string) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const { data: document, error } = await supabaseAdmin!.from('loan_documents').select('*').eq('id', id).single();
  if (error) return json(res, 404, { error: error.message });

  const { data: application, error: appError } = await supabaseAdmin!
    .from('loan_applications')
    .select('id,assigned_to')
    .eq('id', document.application_id)
    .single();
  if (appError || !canAccessAssigned(admin, application)) return forbid(res);

  const { data, error: signedError } = await supabaseAdmin!.storage
    .from(documentsBucket)
    .createSignedUrl(document.storage_key, 60 * 5);

  if (signedError) return json(res, 500, { error: signedError.message });
  await writeAudit(admin, 'document.signed_url', 'loan_document', id);
  return json(res, 200, { url: data.signedUrl, document: documentFromRow(document) });
}

async function updateDocumentReview(req: any, res: any, admin: AdminContext, id: string) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);

  const { data: document, error: documentError } = await supabaseAdmin!.from('loan_documents').select('*').eq('id', id).single();
  if (documentError) return json(res, 404, { error: documentError.message });

  const { data: application, error: appError } = await supabaseAdmin!
    .from('loan_applications')
    .select('id,assigned_to')
    .eq('id', document.application_id)
    .single();
  if (appError || !canAccessAssigned(admin, application)) return forbid(res);

  const body = await readBody<any>(req);
  const reviewed = body.reviewed !== false;
  const { data, error } = await supabaseAdmin!
    .from('loan_documents')
    .update({
      reviewed_at: reviewed ? new Date().toISOString() : null,
      reviewed_by: reviewed ? admin.user.id : null,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return json(res, 400, { error: error.message });
  await writeAudit(admin, reviewed ? 'document.review' : 'document.unreview', 'loan_document', id);
  return json(res, 200, { document: documentFromRow(data) });
}

async function listStaff(req: any, res: any, admin: AdminContext) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin!.from('admin_profiles').select('*').order('created_at', { ascending: true });
    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { items: (data ?? []).map(adminProfileFromRow) });
  }

  if (req.method === 'POST') {
    if (!canManageStaff(admin)) return forbid(res);
    const body = await readBody<Partial<AdminProfile> & { password?: string }>(req);
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const role = (body.role ?? 'staff') as AdminRole;

    if (!email || !password) return json(res, 400, { error: 'Email and temporary password are required.' });
    if (!['owner', 'admin', 'staff'].includes(role)) return json(res, 400, { error: 'Invalid role.' });

    const { data: userData, error: userError } = await supabaseAdmin!.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (userError || !userData.user) return json(res, 400, { error: userError?.message ?? 'Unable to create staff user.' });

    const { data, error } = await supabaseAdmin!
      .from('admin_profiles')
      .upsert(adminProfileToRow({
        id: userData.user.id,
        email,
        role,
        fullName: body.fullName,
        phone: body.phone,
        isActive: body.isActive ?? true,
        updatedAt: new Date().toISOString(),
      }))
      .select('*')
      .single();

    if (error) return json(res, 400, { error: error.message });
    await writeAudit(admin, 'staff.create', 'admin_profile', data.id, { email, role });
    return json(res, 201, { profile: adminProfileFromRow(data) });
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}

async function updateStaff(req: any, res: any, admin: AdminContext, id: string) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);
  if (!canManageStaff(admin)) return forbid(res);

  const body = await readBody<Partial<AdminProfile>>(req);
  if (id === admin.user.id && (body.isActive === false || (body.role && body.role !== 'owner'))) {
    return json(res, 400, { error: 'Owners cannot deactivate or demote their own active account.' });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.role) patch.role = body.role;
  if ('fullName' in body) patch.full_name = body.fullName ?? null;
  if ('phone' in body) patch.phone = body.phone ?? null;
  if ('isActive' in body) patch.is_active = body.isActive;

  const { data, error } = await supabaseAdmin!.from('admin_profiles').update(patch).eq('id', id).select('*').single();
  if (error) return json(res, 400, { error: error.message });
  await writeAudit(admin, 'staff.update', 'admin_profile', id, patch);
  return json(res, 200, { profile: adminProfileFromRow(data) });
}

async function getAnalytics(req: any, res: any, admin: AdminContext) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  let applicationRequest = supabaseAdmin!.from('loan_applications').select('status,requested_amount,assigned_to,priority,created_at');
  let leadRequest = supabaseAdmin!.from('leads').select('status,source,assigned_to,priority,created_at,type');
  applicationRequest = applyStaffScope(applicationRequest, admin);
  leadRequest = applyStaffScope(leadRequest, admin);

  const [{ data: vehicles }, { data: applications }, { data: leads }, { data: audits }] = await Promise.all([
    supabaseAdmin!.from('vehicles').select('availability,price,featured'),
    applicationRequest,
    leadRequest,
    roleAllowed(admin.profile.role, ['admin'])
      ? supabaseAdmin!.from('admin_audit_events').select('*').order('created_at', { ascending: false }).limit(10)
      : Promise.resolve({ data: [] }),
  ]);

  const activeVehicles = (vehicles ?? []).filter(vehicle => vehicle.availability !== 'Archived');
  const leadSources = (leads ?? []).reduce<Record<string, number>>((acc, lead) => {
    acc[lead.source] = (acc[lead.source] ?? 0) + 1;
    return acc;
  }, {});
  const applicationStatuses = (applications ?? []).reduce<Record<string, number>>((acc, application) => {
    acc[application.status] = (acc[application.status] ?? 0) + 1;
    return acc;
  }, {});

  return json(res, 200, {
    metrics: {
      activeVehicles: activeVehicles.length,
      soldVehicles: (vehicles ?? []).filter(vehicle => vehicle.availability === 'Sold').length,
      featuredVehicles: (vehicles ?? []).filter(vehicle => vehicle.featured).length,
      inventoryValue: activeVehicles.reduce((sum, vehicle) => sum + Number(vehicle.price ?? 0), 0),
      applications: applications?.length ?? 0,
      approvedApplications: (applications ?? []).filter(application => ['Approved', 'Disbursed'].includes(application.status)).length,
      newLeads: (leads ?? []).filter(lead => lead.status === 'New').length,
      whatsappLeads: (leads ?? []).filter(lead => lead.type === 'whatsapp').length,
    },
    leadSources,
    applicationStatuses,
    auditEvents: (audits ?? []).map(auditEventFromRow),
  });
}

async function handleAdmin(req: any, res: any, segments: string[]) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const resource = segments[1];
  const id = segments[2];
  const action = segments[3];

  if (resource === 'vehicles' && segments.length === 2) return listAdminVehicles(req, res, admin);
  if (resource === 'vehicles' && id && segments.length === 3) return updateAdminVehicle(req, res, admin, id);
  if (resource === 'vehicle-images' && action === undefined && id === 'upload' && segments.length === 3) return createVehicleImageUpload(req, res, admin);

  if (resource === 'applications' && segments.length === 2) return listApplications(req, res, admin);
  if (resource === 'applications' && id && segments.length === 3) {
    if (req.method === 'GET') return getApplicationDetail(req, res, admin, id);
    return updateApplication(req, res, admin, id);
  }

  if (resource === 'leads' && segments.length === 2) return listLeads(req, res, admin);
  if (resource === 'leads' && id && segments.length === 3) {
    if (req.method === 'GET') return getLeadDetail(req, res, admin, id);
    return updateLead(req, res, admin, id);
  }

  if (resource === 'documents' && id && action === 'signed-url' && segments.length === 4) return getDocumentSignedUrl(req, res, admin, id);
  if (resource === 'documents' && id && segments.length === 3) return updateDocumentReview(req, res, admin, id);
  if (resource === 'staff' && segments.length === 2) return listStaff(req, res, admin);
  if (resource === 'staff' && id && segments.length === 3) return updateStaff(req, res, admin, id);
  if (resource === 'analytics' && segments.length === 2) return getAnalytics(req, res, admin);

  return json(res, 404, { error: 'Admin API route not found.' });
}

export default async function handler(req: any, res: any) {
  const segments = getPathSegments(req);
  const [root, second, third, fourth, fifth] = segments;

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
  if (root === 'applications' && second && third === 'documents' && fourth && fifth === 'complete' && segments.length === 5) {
    return completeDocumentUpload(req, res, second, fourth);
  }

  if (root === 'auth' && second === 'login' && segments.length === 2) return loginAdmin(req, res);
  if (root === 'auth' && second === 'logout' && segments.length === 2) return logoutAdmin(req, res);
  if (root === 'auth' && second === 'me' && segments.length === 2) return getCurrentAdmin(req, res);

  if (root === 'admin') return handleAdmin(req, res, segments);

  return json(res, 404, { error: 'API route not found.' });
}
