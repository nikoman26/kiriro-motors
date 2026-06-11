import { INVENTORY } from '../data';
import { ApplicationStatus, Lead, LoanApplication, Vehicle, VehicleAvailability } from '../types';

const VEHICLES_KEY = 'kiriro:vehicles';
const LEADS_KEY = 'kiriro:leads';
const APPLICATIONS_KEY = 'kiriro:applications';
const SAVED_KEY = 'kiriro:savedVehicles';
const ADMIN_TOKEN_KEY = 'kiriro:adminToken';

type CreateLeadInput = Omit<Lead, 'id' | 'createdAt' | 'status'>;
type CreateApplicationInput = Omit<LoanApplication, 'id' | 'trackingNumber' | 'status' | 'notes' | 'createdAt' | 'updatedAt'>;

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

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) throw new Error('API route unavailable.');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? `Request failed: ${response.status}`);
  return data as T;
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

export async function getVehicles(options: { admin?: boolean } = {}) {
  try {
    const data = await apiRequest<{ items: Vehicle[] }>(options.admin ? '/api/admin/vehicles' : '/api/vehicles');
    if (data.items?.length) saveLocalVehicles(data.items);
    return data.items ?? [];
  } catch {
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
    const data = await apiRequest<{ vehicle: Vehicle }>('/api/admin/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
    return await getVehicles({ admin: true });
  } catch {
    const vehicles = getLocalVehicles();
    const index = vehicles.findIndex(item => item.id === vehicle.id);
    const next = index >= 0 ? vehicles.map(item => item.id === vehicle.id ? vehicle : item) : [vehicle, ...vehicles];
    saveLocalVehicles(next);
    return next;
  }
}

export async function updateVehicleStatus(vehicleId: string, availability: VehicleAvailability) {
  try {
    await apiRequest(`/api/admin/vehicles/${encodeURIComponent(vehicleId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ availability }),
    });
    return await getVehicles({ admin: true });
  } catch {
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
  } catch {
    const next = getLocalVehicles().map(vehicle => vehicle.id === vehicleId ? { ...vehicle, featured } : vehicle);
    saveLocalVehicles(next);
    return next;
  }
}

export async function getLeads() {
  try {
    const data = await apiRequest<{ items: Lead[] }>('/api/admin/leads');
    writeJson(LEADS_KEY, data.items ?? []);
    return data.items ?? [];
  } catch {
    return getLocalLeads();
  }
}

export async function createLead(lead: CreateLeadInput) {
  try {
    const data = await apiRequest<{ lead: Lead }>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
    return data.lead;
  } catch {
    const nextLead: Lead = {
      ...lead,
      id: createId('lead'),
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    const next = [nextLead, ...getLocalLeads()];
    writeJson(LEADS_KEY, next);
    return nextLead;
  }
}

export async function updateLeadStatus(leadId: string, status: Lead['status']) {
  try {
    await apiRequest(`/api/admin/leads/${encodeURIComponent(leadId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return await getLeads();
  } catch {
    const next = getLocalLeads().map(lead => lead.id === leadId ? { ...lead, status } : lead);
    writeJson(LEADS_KEY, next);
    return next;
  }
}

export async function getApplications() {
  try {
    const data = await apiRequest<{ items: LoanApplication[] }>('/api/admin/applications');
    writeJson(APPLICATIONS_KEY, data.items ?? []);
    return data.items ?? [];
  } catch {
    return getLocalApplications();
  }
}

export async function trackApplication(trackingNumber: string) {
  try {
    const data = await apiRequest<{ application: LoanApplication }>(`/api/applications/track/${encodeURIComponent(trackingNumber)}`);
    return data.application;
  } catch {
    return getLocalApplications().find(application => application.trackingNumber.toLowerCase() === trackingNumber.toLowerCase()) ?? null;
  }
}

export async function createApplication(application: CreateApplicationInput) {
  try {
    const data = await apiRequest<{ application: LoanApplication }>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(application),
    });
    return data.application;
  } catch {
    const createdAt = new Date().toISOString();
    const nextApplication: LoanApplication = {
      ...application,
      id: createId('app'),
      trackingNumber: createTrackingNumber(application.type === 'land-title' ? 'KR-LD' : application.type === 'logbook' ? 'KR-LB' : 'KR-VF'),
      status: 'Submitted',
      notes: [],
      createdAt,
      updatedAt: createdAt,
    };
    const next = [nextApplication, ...getLocalApplications()];
    writeJson(APPLICATIONS_KEY, next);
    return nextApplication;
  }
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus, note?: string) {
  try {
    await apiRequest(`/api/admin/applications/${encodeURIComponent(applicationId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
    return await getApplications();
  } catch {
    const next = getLocalApplications().map(application => {
      if (application.id !== applicationId) return application;
      return {
        ...application,
        status,
        notes: note ? [note, ...application.notes] : application.notes,
        updatedAt: new Date().toISOString(),
      };
    });
    writeJson(APPLICATIONS_KEY, next);
    return next;
  }
}

export async function loginAdmin(email: string, password: string) {
  try {
    const data = await apiRequest<{ accessToken: string; profile: { email: string; role: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    writeJson(ADMIN_TOKEN_KEY, data.accessToken);
    return { ok: true, remote: true, profile: data.profile };
  } catch (error) {
    if (!email || !password) throw error;
    writeJson(ADMIN_TOKEN_KEY, 'local-demo-admin');
    return { ok: true, remote: false, profile: { email, role: 'local-demo-admin' } };
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

export function getSavedVehicles() {
  return readJson<string[]>(SAVED_KEY, []);
}

export function toggleSavedVehicle(vehicleId: string) {
  const saved = getSavedVehicles();
  const next = saved.includes(vehicleId) ? saved.filter(id => id !== vehicleId) : [...saved, vehicleId];
  writeJson(SAVED_KEY, next);
  return next;
}
