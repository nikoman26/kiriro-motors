import { INVENTORY } from '../data';
import {
  AdminAuditEvent,
  AdminProfile,
  ApplicationStatus,
  Lead,
  LoanApplication,
  LoanDocument,
  Vehicle,
  VehicleAvailability,
} from '../types';
import { documentsBucket, supabase, vehiclesBucket } from '../lib/supabase';

const VEHICLES_KEY = 'kiriro:vehicles';
const LEADS_KEY = 'kiriro:leads';
const APPLICATIONS_KEY = 'kiriro:applications';
const SAVED_KEY = 'kiriro:savedVehicles';
const ADMIN_TOKEN_KEY = 'kiriro:adminToken';

type CreateLeadInput = Omit<Lead, 'id' | 'createdAt' | 'status'>;
type CreateApplicationInput = Omit<LoanApplication, 'id' | 'trackingNumber' | 'status' | 'notes' | 'createdAt' | 'updatedAt'> & {
  documentFiles?: File[];
  documentTypes?: string[];
};
type SignedUpload = { path?: string; token?: string; signedUrl?: string };

export interface AdminAnalytics {
  metrics: {
    activeVehicles: number;
    soldVehicles: number;
    featuredVehicles: number;
    inventoryValue: number;
    applications: number;
    approvedApplications: number;
    newLeads: number;
    whatsappLeads: number;
  };
  leadSources: Record<string, number>;
  applicationStatuses: Record<string, number>;
  auditEvents: AdminAuditEvent[];
}

export class ApiError extends Error {
  status: number;
  unavailable: boolean;

  constructor(message: string, status = 0, unavailable = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.unavailable = unavailable;
  }
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function isBackendUnavailable(error: unknown) {
  return error instanceof ApiError && (error.unavailable || error.status === 0 || error.status === 503);
}

function shouldUseLocalFallback(error: unknown) {
  return getAdminToken() === 'local-demo-admin' || isBackendUnavailable(error);
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token && token !== 'local-demo-admin') headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiError('API route unavailable.', 0, true);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new ApiError('API route unavailable.', response.status, true);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(data.error ?? `Request failed: ${response.status}`, response.status, response.status === 503);
  }
  return data as T;
}

function validateDocumentFile(file: File) {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) throw new Error(`${file.name} must be a PDF, JPEG, PNG, or WebP file.`);
  if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} must be 10 MB or smaller.`);
}

function validateVehicleImage(file: File) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) throw new Error(`${file.name} must be a JPEG, PNG, or WebP image.`);
  if (file.size > 15 * 1024 * 1024) throw new Error(`${file.name} must be 15 MB or smaller.`);
}

async function uploadToSignedUrl(bucket: string, signedUpload: SignedUpload, file: File) {
  if (!supabase || !signedUpload.path || !signedUpload.token) {
    throw new Error('Supabase browser client is not configured for signed uploads.');
  }

  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(signedUpload.path, signedUpload.token, file);

  if (error) throw error;
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function createTrackingNumber(prefix = 'KR') {
  return `${prefix}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function getLocalVehicles() {
  const vehicles = readJson<Vehicle[]>(VEHICLES_KEY, []);
  if (vehicles.length > 0) return vehicles;
  writeJson(VEHICLES_KEY, INVENTORY);
  return INVENTORY;
}

function saveLocalVehicles(vehicles: Vehicle[]) {
  writeJson(VEHICLES_KEY, vehicles);
}

function getLocalLeads() {
  return readJson<Lead[]>(LEADS_KEY, []);
}

function getLocalApplications() {
  return readJson<LoanApplication[]>(APPLICATIONS_KEY, []);
}

export async function getVehicles(options: { admin?: boolean; search?: string; status?: string } = {}) {
  try {
    const params = new URLSearchParams();
    if (options.search) params.set('search', options.search);
    if (options.status) params.set('status', options.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await apiRequest<{ items: Vehicle[] }>(`${options.admin ? '/api/admin/vehicles' : '/api/vehicles'}${query}`);
    if (data.items?.length) saveLocalVehicles(data.items);
    return data.items ?? [];
  } catch (error) {
    if (options.admin && !shouldUseLocalFallback(error)) throw error;
    const vehicles = getLocalVehicles();
    return options.admin ? vehicles : vehicles.filter(vehicle => vehicle.availability !== 'Archived');
  }
}

export async function getVehicleBySlug(slugOrId: string) {
  try {
    const data = await apiRequest<{ vehicle: Vehicle }>(`/api/vehicles/${encodeURIComponent(slugOrId)}`);
    return data.vehicle;
  } catch {
    return getLocalVehicles().find(vehicle => vehicle.slug === slugOrId || vehicle.id === slugOrId) ?? null;
  }
}

export async function upsertVehicle(vehicle: Vehicle) {
  try {
    await apiRequest<{ vehicle: Vehicle }>('/api/admin/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
    return await getVehicles({ admin: true });
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    const vehicles = getLocalVehicles();
    const index = vehicles.findIndex(item => item.id === vehicle.id);
    const next = index >= 0 ? vehicles.map(item => item.id === vehicle.id ? vehicle : item) : [vehicle, ...vehicles];
    saveLocalVehicles(next);
    return next;
  }
}

export async function editVehicle(vehicle: Vehicle) {
  try {
    await apiRequest<{ vehicle: Vehicle }>(`/api/admin/vehicles/${encodeURIComponent(vehicle.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ vehicle }),
    });
    return await getVehicles({ admin: true });
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    const next = getLocalVehicles().map(item => item.id === vehicle.id ? vehicle : item);
    saveLocalVehicles(next);
    return next;
  }
}

export async function uploadVehicleImage(file: File, vehicleId?: string) {
  validateVehicleImage(file);
  const data = await apiRequest<{ signedUpload: SignedUpload; image: { publicUrl: string; storageKey: string; fileName: string } }>('/api/admin/vehicle-images/upload', {
    method: 'POST',
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      vehicleId,
    }),
  });
  await uploadToSignedUrl(vehiclesBucket, data.signedUpload, file);
  return data.image;
}

export async function updateVehicleStatus(vehicleId: string, availability: VehicleAvailability) {
  try {
    await apiRequest(`/api/admin/vehicles/${encodeURIComponent(vehicleId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ availability }),
    });
    return await getVehicles({ admin: true });
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    const next = getLocalVehicles().map(vehicle => vehicle.id === vehicleId ? { ...vehicle, availability } : vehicle);
    saveLocalVehicles(next);
    return next;
  }
}

export async function toggleFeaturedVehicle(vehicleId: string) {
  const current = getLocalVehicles().find(vehicle => vehicle.id === vehicleId);
  const featured = !current?.featured;

  try {
    await apiRequest(`/api/admin/vehicles/${encodeURIComponent(vehicleId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ featured }),
    });
    return await getVehicles({ admin: true });
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    const next = getLocalVehicles().map(vehicle => vehicle.id === vehicleId ? { ...vehicle, featured } : vehicle);
    saveLocalVehicles(next);
    return next;
  }
}

export async function getLeads(filters: { search?: string; status?: string; priority?: string } = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await apiRequest<{ items: Lead[] }>(`/api/admin/leads${query}`);
    writeJson(LEADS_KEY, data.items ?? []);
    return data.items ?? [];
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    return getLocalLeads();
  }
}

export async function getLeadDetail(leadId: string) {
  try {
    const data = await apiRequest<{ lead: Lead }>(`/api/admin/leads/${encodeURIComponent(leadId)}`);
    return data.lead;
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    return getLocalLeads().find(lead => lead.id === leadId) ?? null;
  }
}

export async function createLead(lead: CreateLeadInput) {
  try {
    const data = await apiRequest<{ lead: Lead }>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
    return data.lead;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const nextLead: Lead = {
      ...lead,
      id: createId('lead'),
      status: 'New',
      priority: lead.priority ?? 'normal',
      notes: [],
      createdAt: new Date().toISOString(),
    };
    const next = [nextLead, ...getLocalLeads()];
    writeJson(LEADS_KEY, next);
    return nextLead;
  }
}

export async function updateLeadStatus(leadId: string, status: Lead['status']) {
  return updateLeadWorkflow(leadId, { status });
}

export async function updateLeadWorkflow(leadId: string, patch: { status?: Lead['status']; note?: string; assignedTo?: string; priority?: Lead['priority'] }) {
  try {
    const data = await apiRequest<{ lead: Lead }>(`/api/admin/leads/${encodeURIComponent(leadId)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    const leads = await getLeads();
    return leads.map(lead => lead.id === leadId ? data.lead : lead);
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    const next = getLocalLeads().map(lead => lead.id === leadId ? {
      ...lead,
      status: patch.status ?? lead.status,
      assignedTo: patch.assignedTo ?? lead.assignedTo,
      priority: patch.priority ?? lead.priority,
      notes: patch.note ? [patch.note, ...(lead.notes ?? [])] : lead.notes,
      updatedAt: new Date().toISOString(),
    } : lead);
    writeJson(LEADS_KEY, next);
    return next;
  }
}

export async function getApplications(filters: { search?: string; status?: string; priority?: string } = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await apiRequest<{ items: LoanApplication[] }>(`/api/admin/applications${query}`);
    writeJson(APPLICATIONS_KEY, data.items ?? []);
    return data.items ?? [];
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    return getLocalApplications();
  }
}

export async function getApplicationDetail(applicationId: string) {
  try {
    const data = await apiRequest<{ application: LoanApplication }>(`/api/admin/applications/${encodeURIComponent(applicationId)}`);
    return data.application;
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    return getLocalApplications().find(application => application.id === applicationId) ?? null;
  }
}

export async function trackApplication(trackingNumber: string) {
  try {
    const data = await apiRequest<{ application: LoanApplication }>(`/api/applications/track/${encodeURIComponent(trackingNumber)}`);
    return data.application;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return getLocalApplications().find(application => application.trackingNumber.toLowerCase() === trackingNumber.toLowerCase()) ?? null;
  }
}

async function uploadApplicationDocuments(applicationId: string, files: File[], documentTypes: string[] = []) {
  if (files.length > 10) throw new Error('Upload a maximum of 10 documents per application.');

  const uploaded: LoanDocument[] = [];
  for (const [index, file] of files.entries()) {
    validateDocumentFile(file);
    const data = await apiRequest<{ document: LoanDocument; signedUpload: SignedUpload }>(`/api/applications/${encodeURIComponent(applicationId)}/documents`, {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        documentType: documentTypes[index] ?? 'Supporting document',
      }),
    });
    await uploadToSignedUrl(documentsBucket, data.signedUpload, file);
    const completed = await apiRequest<{ document: LoanDocument }>(`/api/applications/${encodeURIComponent(applicationId)}/documents/${encodeURIComponent(data.document.id)}/complete`, {
      method: 'POST',
    });
    uploaded.push(completed.document);
  }
  return uploaded;
}

export async function createApplication(application: CreateApplicationInput) {
  const { documentFiles = [], documentTypes = [], ...payload } = application;
  const documents = payload.documents?.length ? payload.documents : documentFiles.map(file => file.name);

  try {
    const data = await apiRequest<{ application: LoanApplication }>('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ ...payload, documents }),
    });
    const documentRecords = documentFiles.length
      ? await uploadApplicationDocuments(data.application.id, documentFiles, documentTypes)
      : [];
    return { ...data.application, documents, documentRecords };
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;

    const createdAt = new Date().toISOString();
    const nextApplication: LoanApplication = {
      ...payload,
      documents,
      id: createId('app'),
      trackingNumber: createTrackingNumber(application.type === 'land-title' ? 'KR-LD' : application.type === 'logbook' ? 'KR-LB' : 'KR-VF'),
      status: 'Submitted',
      notes: [],
      priority: 'normal',
      createdAt,
      updatedAt: createdAt,
    };
    const next = [nextApplication, ...getLocalApplications()];
    writeJson(APPLICATIONS_KEY, next);
    return nextApplication;
  }
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus, note?: string) {
  return updateApplicationWorkflow(applicationId, { status, note });
}

export async function updateApplicationWorkflow(applicationId: string, patch: { status?: ApplicationStatus; note?: string; assignedTo?: string; priority?: LoanApplication['priority'] }) {
  try {
    const data = await apiRequest<{ application: LoanApplication }>(`/api/admin/applications/${encodeURIComponent(applicationId)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    const applications = await getApplications();
    return applications.map(application => application.id === applicationId ? data.application : application);
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    const next = getLocalApplications().map(application => {
      if (application.id !== applicationId) return application;
      return {
        ...application,
        status: patch.status ?? application.status,
        assignedTo: patch.assignedTo ?? application.assignedTo,
        priority: patch.priority ?? application.priority,
        notes: patch.note ? [patch.note, ...application.notes] : application.notes,
        updatedAt: new Date().toISOString(),
      };
    });
    writeJson(APPLICATIONS_KEY, next);
    return next;
  }
}

export async function getDocumentDownloadUrl(documentId: string) {
  const data = await apiRequest<{ url: string; document: LoanDocument }>(`/api/admin/documents/${encodeURIComponent(documentId)}/signed-url`);
  return data;
}

export async function reviewDocument(documentId: string, reviewed = true) {
  const data = await apiRequest<{ document: LoanDocument }>(`/api/admin/documents/${encodeURIComponent(documentId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ reviewed }),
  });
  return data.document;
}

export async function loginAdmin(email: string, password: string) {
  try {
    const data = await apiRequest<{ accessToken: string; profile: AdminProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    writeJson(ADMIN_TOKEN_KEY, data.accessToken);
    return { ok: true, remote: true, profile: data.profile };
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    if (!email || !password) throw error;
    writeJson(ADMIN_TOKEN_KEY, 'local-demo-admin');
    return {
      ok: true,
      remote: false,
      profile: {
        id: 'local-demo-admin',
        email,
        role: 'owner' as const,
        fullName: 'Local Demo Admin',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    };
  }
}

export async function getCurrentAdmin() {
  const token = getAdminToken();
  if (token === 'local-demo-admin') {
    return {
      id: 'local-demo-admin',
      email: 'local-demo@kiriromotors.com',
      role: 'owner' as const,
      fullName: 'Local Demo Admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const data = await apiRequest<{ profile: AdminProfile }>('/api/auth/me');
    return data.profile;
  } catch (error) {
    if (isBackendUnavailable(error) && token) {
      return {
        id: 'local-demo-admin',
        email: 'local-demo@kiriromotors.com',
        role: 'owner' as const,
        fullName: 'Local Demo Admin',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    }
    throw error;
  }
}

export async function logoutAdmin() {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
  } catch {
    // Local fallback sessions do not have a remote token to clear.
  }

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    window.localStorage.removeItem('kiriro:admin');
  }
}

export function getAdminToken() {
  return readJson<string>(ADMIN_TOKEN_KEY, '');
}

export function isAdminLoggedIn() {
  return Boolean(getAdminToken() || readJson<string>('kiriro:admin', ''));
}

export async function getStaff() {
  try {
    const data = await apiRequest<{ items: AdminProfile[] }>('/api/admin/staff');
    return data.items ?? [];
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    return [{
      id: 'local-demo-admin',
      email: 'local-demo@kiriromotors.com',
      role: 'owner' as const,
      fullName: 'Local Demo Admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    }];
  }
}

export async function createStaff(profile: Pick<AdminProfile, 'email' | 'role'> & Partial<AdminProfile> & { password: string }) {
  const data = await apiRequest<{ profile: AdminProfile }>('/api/admin/staff', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
  return data.profile;
}

export async function updateStaff(profileId: string, patch: Partial<AdminProfile>) {
  const data = await apiRequest<{ profile: AdminProfile }>(`/api/admin/staff/${encodeURIComponent(profileId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return data.profile;
}

export async function getAdminAnalytics() {
  try {
    return await apiRequest<AdminAnalytics>('/api/admin/analytics');
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    const vehicles = getLocalVehicles();
    const leads = getLocalLeads();
    const applications = getLocalApplications();
    const activeVehicles = vehicles.filter(vehicle => vehicle.availability !== 'Archived');
    return {
      metrics: {
        activeVehicles: activeVehicles.length,
        soldVehicles: vehicles.filter(vehicle => vehicle.availability === 'Sold').length,
        featuredVehicles: vehicles.filter(vehicle => vehicle.featured).length,
        inventoryValue: activeVehicles.reduce((sum, vehicle) => sum + vehicle.price, 0),
        applications: applications.length,
        approvedApplications: applications.filter(application => ['Approved', 'Disbursed'].includes(application.status)).length,
        newLeads: leads.filter(lead => lead.status === 'New').length,
        whatsappLeads: leads.filter(lead => lead.type === 'whatsapp').length,
      },
      leadSources: leads.reduce<Record<string, number>>((acc, lead) => {
        acc[lead.source] = (acc[lead.source] ?? 0) + 1;
        return acc;
      }, {}),
      applicationStatuses: applications.reduce<Record<string, number>>((acc, application) => {
        acc[application.status] = (acc[application.status] ?? 0) + 1;
        return acc;
      }, {}),
      auditEvents: [],
    };
  }
}

export function getSavedVehicles() {
  return readJson<string[]>(SAVED_KEY, []);
}

export function toggleSavedVehicle(vehicleId: string) {
  const saved = getSavedVehicles();
  const next = saved.includes(vehicleId) ? saved.filter(id => id !== vehicleId) : [...saved, vehicleId];
  writeJson(SAVED_KEY, next);
  return next;
}
