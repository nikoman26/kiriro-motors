import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Car,
  CheckCircle,
  ClipboardList,
  Download,
  Edit3,
  Eye,
  FileCheck,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Star,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminAnalytics, editVehicle, getAdminAnalytics, getApplicationDetail, getApplications, getCurrentAdmin, getDocumentDownloadUrl, getLeadDetail, getLeads, getStaff, getVehicles, isAdminLoggedIn, loginAdmin, logoutAdmin, reviewDocument, toggleFeaturedVehicle, updateApplicationWorkflow, updateLeadWorkflow, updateStaff, updateVehicleStatus, uploadVehicleImage, upsertVehicle, createId, createStaff } from '../utils/storage';
import { AdminProfile, AdminRole, ApplicationStatus, Lead, LoanApplication, LoanDocument, Vehicle, VehicleAvailability } from '../types';
import { formatKes, formatNumber, readableDate } from '../utils/format';
import { whatsappUrl } from '../utils/whatsapp';

type AdminTab = 'vehicles' | 'applications' | 'leads' | 'analytics' | 'staff' | 'settings';
type Priority = 'low' | 'normal' | 'high';

const statuses: ApplicationStatus[] = ['Submitted', 'Under Review', 'Approved', 'Disbursed', 'Rejected'];
const availabilityOptions: VehicleAvailability[] = ['Available', 'Reserved', 'Sold', 'Archived'];
const leadStatuses: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Closed'];
const priorities: Priority[] = ['low', 'normal', 'high'];
const roles: AdminRole[] = ['owner', 'admin', 'staff'];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function canManageInventory(profile: AdminProfile | null) {
  return profile?.role === 'owner' || profile?.role === 'admin';
}

function canManageStaff(profile: AdminProfile | null) {
  return profile?.role === 'owner';
}

function canAssign(profile: AdminProfile | null) {
  return profile?.role === 'owner' || profile?.role === 'admin';
}

function staffName(staff: AdminProfile[], id?: string) {
  if (!id) return 'Unassigned';
  const found = staff.find(profile => profile.id === id);
  return found?.fullName || found?.email || 'Assigned staff';
}

function parseList(value: FormDataEntryValue | null) {
  return String(value ?? '')
    .split(/[\n,]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function vehicleFromForm(form: FormData, existing?: Vehicle): Vehicle {
  const make = String(form.get('make') ?? existing?.make ?? '');
  const model = String(form.get('model') ?? existing?.model ?? '');
  const year = Number(form.get('year') ?? existing?.year ?? new Date().getFullYear());
  const createdAt = existing?.createdAt ?? new Date().toISOString();
  const gallery = parseList(form.get('gallery'));
  const image = String(form.get('image') ?? existing?.image ?? gallery[0] ?? '');

  return {
    id: existing?.id ?? createId('v'),
    slug: existing?.slug ?? slugify(`${make}-${model}-${year}-${Date.now()}`),
    make,
    model,
    trim: String(form.get('trim') ?? existing?.trim ?? ''),
    year,
    price: Number(form.get('price') ?? existing?.price ?? 0),
    mileage: Number(form.get('mileage') ?? existing?.mileage ?? 0),
    fuel: String(form.get('fuel') ?? existing?.fuel ?? 'Petrol'),
    transmission: String(form.get('transmission') ?? existing?.transmission ?? 'Automatic'),
    image,
    gallery: gallery.length ? gallery : image ? [image] : existing?.gallery ?? [],
    bodyType: String(form.get('bodyType') ?? existing?.bodyType ?? 'SUV'),
    engine: String(form.get('engine') ?? existing?.engine ?? ''),
    seats: Number(form.get('seats') ?? existing?.seats ?? 5),
    driveType: String(form.get('driveType') ?? existing?.driveType ?? 'Two-Wheel Drive'),
    color: String(form.get('color') ?? existing?.color ?? ''),
    condition: String(form.get('condition') ?? existing?.condition ?? 'Foreign Used'),
    availability: String(form.get('availability') ?? existing?.availability ?? 'Available') as VehicleAvailability,
    location: String(form.get('location') ?? existing?.location ?? 'Nairobi Showroom'),
    vin: String(form.get('vin') ?? existing?.vin ?? ''),
    negotiable: form.get('negotiable') === 'on',
    featured: form.get('featured') === 'on',
    loanEligible: form.get('loanEligible') === 'on',
    description: String(form.get('description') ?? existing?.description ?? ''),
    features: parseList(form.get('features')),
    createdAt,
  };
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAdminLoggedIn());
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [tab, setTab] = useState<AdminTab>('vehicles');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [staff, setStaff] = useState<AdminProfile[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [loginError, setLoginError] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleStatus, setVehicleStatus] = useState('all');
  const [applicationSearch, setApplicationSearch] = useState('');
  const [applicationStatus, setApplicationStatus] = useState('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatus, setLeadStatus] = useState('all');
  const [confirmAction, setConfirmAction] = useState<{ title: string; body: string; action: () => Promise<void> } | null>(null);

  const activeStaff = staff.filter(member => member.isActive);
  const manageInventory = canManageInventory(profile);
  const manageTeam = canManageStaff(profile);
  const manageAssignments = canAssign(profile);

  const refreshAdminData = async () => {
    const [nextVehicles, nextApplications, nextLeads, nextStaff, nextAnalytics] = await Promise.all([
      getVehicles({ admin: true, search: vehicleSearch, status: vehicleStatus }),
      getApplications({ search: applicationSearch, status: applicationStatus }),
      getLeads({ search: leadSearch, status: leadStatus }),
      getStaff(),
      getAdminAnalytics(),
    ]);
    setVehicles(nextVehicles);
    setApplications(nextApplications);
    setLeads(nextLeads);
    setStaff(nextStaff);
    setAnalytics(nextAnalytics);
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    let mounted = true;
    setLoading(true);
    getCurrentAdmin()
      .then(current => {
        if (!mounted) return;
        setProfile(current);
        setNotice(current.id === 'local-demo-admin' ? 'Using local demo mode because the backend API is unavailable.' : 'Connected to Supabase admin session.');
        return refreshAdminData();
      })
      .catch(error => {
        if (!mounted) return;
        setError(error instanceof Error ? error.message : 'Unable to load admin session.');
        setIsLoggedIn(false);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);

  const visibleVehicles = useMemo(() => {
    const search = vehicleSearch.toLowerCase();
    return vehicles.filter(vehicle => {
      const matchesSearch = !search || `${vehicle.make} ${vehicle.model} ${vehicle.slug} ${vehicle.vin}`.toLowerCase().includes(search);
      const matchesStatus = vehicleStatus === 'all' || vehicle.availability === vehicleStatus;
      return matchesSearch && matchesStatus;
    });
  }, [vehicleSearch, vehicleStatus, vehicles]);

  const visibleApplications = useMemo(() => {
    const search = applicationSearch.toLowerCase();
    return applications.filter(application => {
      const matchesSearch = !search || `${application.trackingNumber} ${application.name} ${application.phone} ${application.email}`.toLowerCase().includes(search);
      const matchesStatus = applicationStatus === 'all' || application.status === applicationStatus;
      return matchesSearch && matchesStatus;
    });
  }, [applicationSearch, applicationStatus, applications]);

  const visibleLeads = useMemo(() => {
    const search = leadSearch.toLowerCase();
    return leads.filter(lead => {
      const matchesSearch = !search || `${lead.name} ${lead.phone} ${lead.email ?? ''} ${lead.message}`.toLowerCase().includes(search);
      const matchesStatus = leadStatus === 'all' || lead.status === leadStatus;
      return matchesSearch && matchesStatus;
    });
  }, [leadSearch, leadStatus, leads]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');

    try {
      const result = await loginAdmin(email, password);
      setProfile(result.profile);
      setNotice(result.remote ? 'Connected to Supabase admin session.' : 'Using local demo mode because the backend API is unavailable.');
      setIsLoggedIn(true);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed.');
    }
  };

  const logout = async () => {
    await logoutAdmin();
    setProfile(null);
    setIsLoggedIn(false);
  };

  const submitVehicle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!manageInventory) return;
    setError('');
    setLoading(true);

    try {
      const form = new FormData(event.currentTarget);
      const files = Array.from((form.getAll('images') as File[]).filter(file => file.size > 0));
      const uploaded = files.length ? await Promise.all(files.map(file => uploadVehicleImage(file, editingVehicle?.id))) : [];
      const vehicle = vehicleFromForm(form, editingVehicle ?? undefined);
      if (uploaded.length > 0) {
        const uploadedUrls = uploaded.map(image => image.publicUrl);
        vehicle.image = uploadedUrls[0];
        vehicle.gallery = [...uploadedUrls, ...vehicle.gallery.filter(Boolean)];
      }

      setVehicles(editingVehicle ? await editVehicle(vehicle) : await upsertVehicle(vehicle));
      setEditingVehicle(null);
      event.currentTarget.reset();
      setNotice(editingVehicle ? 'Vehicle updated.' : 'Vehicle created.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Vehicle save failed.');
    } finally {
      setLoading(false);
    }
  };

  const changeVehicleStatus = async (vehicle: Vehicle, status: VehicleAvailability) => {
    setConfirmAction({
      title: `${status} vehicle`,
      body: `Update ${vehicle.year} ${vehicle.make} ${vehicle.model} to ${status}?`,
      action: async () => {
        setVehicles(await updateVehicleStatus(vehicle.id, status));
        setNotice(`Vehicle marked ${status}.`);
      },
    });
  };

  const loadApplicationDetail = async (application: LoanApplication) => {
    setSelectedApplication(application);
    const detail = await getApplicationDetail(application.id);
    if (detail) setSelectedApplication(detail);
  };

  const loadLeadDetail = async (lead: Lead) => {
    setSelectedLead(lead);
    const detail = await getLeadDetail(lead.id);
    if (detail) setSelectedLead(detail);
  };

  const submitApplicationWorkflow = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedApplication) return;
    const form = new FormData(event.currentTarget);
    const patch = {
      status: String(form.get('status') ?? selectedApplication.status) as ApplicationStatus,
      assignedTo: String(form.get('assignedTo') ?? selectedApplication.assignedTo ?? ''),
      priority: String(form.get('priority') ?? selectedApplication.priority ?? 'normal') as Priority,
      note: String(form.get('note') ?? ''),
    };
    setApplications(await updateApplicationWorkflow(selectedApplication.id, patch));
    const detail = await getApplicationDetail(selectedApplication.id);
    if (detail) setSelectedApplication(detail);
    event.currentTarget.reset();
  };

  const submitLeadWorkflow = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedLead) return;
    const form = new FormData(event.currentTarget);
    const patch = {
      status: String(form.get('status') ?? selectedLead.status) as Lead['status'],
      assignedTo: String(form.get('assignedTo') ?? selectedLead.assignedTo ?? ''),
      priority: String(form.get('priority') ?? selectedLead.priority ?? 'normal') as Priority,
      note: String(form.get('note') ?? ''),
    };
    setLeads(await updateLeadWorkflow(selectedLead.id, patch));
    const detail = await getLeadDetail(selectedLead.id);
    if (detail) setSelectedLead(detail);
    event.currentTarget.reset();
  };

  const openDocument = async (document: LoanDocument) => {
    const { url } = await getDocumentDownloadUrl(document.id);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleDocumentReview = async (document: LoanDocument, reviewed: boolean) => {
    const nextDocument = await reviewDocument(document.id, reviewed);
    if (!selectedApplication) return;
    setSelectedApplication({
      ...selectedApplication,
      documentRecords: (selectedApplication.documentRecords ?? []).map(item => item.id === document.id ? nextDocument : item),
    });
  };

  const submitStaff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!manageTeam) return;
    const form = new FormData(event.currentTarget);
    await createStaff({
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      role: String(form.get('role') ?? 'staff') as AdminRole,
      fullName: String(form.get('fullName') ?? ''),
      phone: String(form.get('phone') ?? ''),
      isActive: true,
    });
    setStaff(await getStaff());
    event.currentTarget.reset();
  };

  const changeStaffRole = async (member: AdminProfile, patch: Partial<AdminProfile>) => {
    await updateStaff(member.id, patch);
    setStaff(await getStaff());
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
        <form onSubmit={login} className="w-full max-w-md bg-[#0E0E0E] border border-white/8 p-8">
          <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">Admin CMS</p>
          <h1 className="font-editorial text-4xl font-light mb-5">Staff Login</h1>
          <p className="text-white/45 text-sm mb-6">Use a Supabase staff account. Demo mode opens only when the backend API is unavailable.</p>
          <div className="space-y-3">
            <input name="email" type="email" required placeholder="Email" className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-luxury-gold" />
            <input name="password" type="password" required placeholder="Password" className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-luxury-gold" />
          </div>
          {loginError && <p className="mt-4 text-sm text-red-300">{loginError}</p>}
          <button className="mt-6 w-full bg-white text-black py-4 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-luxury-gold transition-colors">Open CMS</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <section className="pt-24 pb-8 bg-[#0E0E0E] border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">Internal Operations</p>
            <h1 className="font-editorial text-5xl font-light">Admin Dashboard</h1>
            <p className="text-sm text-white/45 mt-3">{profile?.fullName || profile?.email} - {profile?.role}</p>
          </div>
          <button onClick={logout} className="border border-white/15 px-5 py-3 text-[10px] uppercase tracking-widest font-bold inline-flex items-center gap-2 hover:bg-white hover:text-black transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(notice || error) && (
          <div className={`mb-6 border p-4 text-sm ${error ? 'border-red-400/30 bg-red-400/10 text-red-100' : 'border-green-400/30 bg-green-400/10 text-green-100'}`}>
            {error || notice}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
          {[
            { id: 'vehicles', icon: Car, label: 'Vehicles' },
            { id: 'applications', icon: ClipboardList, label: 'Loans' },
            { id: 'leads', icon: Users, label: 'Leads' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'staff', icon: ShieldCheck, label: 'Staff' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id as AdminTab)} className={`p-4 border text-left ${tab === item.id ? 'bg-white text-black border-white' : 'border-white/10 bg-white/[0.03] hover:border-luxury-gold/50'}`}>
              <item.icon className="w-5 h-5 mb-4" />
              <span className="text-[10px] uppercase tracking-widest font-bold">{item.label}</span>
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-white/45 mb-6">Loading admin data...</p>}

        {tab === 'vehicles' && (
          <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-8">
            <form key={editingVehicle?.id ?? 'new'} onSubmit={submitVehicle} className="bg-[#0E0E0E] border border-white/8 p-6 h-fit">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h2 className="font-editorial text-3xl font-light flex items-center gap-2">
                  {editingVehicle ? <Edit3 className="w-5 h-5 text-luxury-gold" /> : <Plus className="w-5 h-5 text-luxury-gold" />}
                  {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
                </h2>
                {editingVehicle && <button type="button" onClick={() => setEditingVehicle(null)} aria-label="Cancel edit" className="w-9 h-9 border border-white/15 flex items-center justify-center"><X className="w-4 h-4" /></button>}
              </div>
              {!manageInventory && <p className="mb-4 text-sm text-white/45">Your role can view inventory but cannot edit vehicles.</p>}
              <fieldset disabled={!manageInventory || loading} className="space-y-4 disabled:opacity-60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['make', 'model', 'trim', 'year', 'price', 'mileage', 'fuel', 'transmission', 'bodyType', 'engine', 'seats', 'driveType', 'color', 'condition', 'location', 'vin'].map(name => (
                    <input key={name} name={name} required={['make', 'model', 'year', 'price'].includes(name)} defaultValue={editingVehicle ? String((editingVehicle as any)[name] ?? '') : ''} placeholder={name} className="bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold" />
                  ))}
                  <select name="availability" defaultValue={editingVehicle?.availability ?? 'Available'} className="bg-[#111] border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold">
                    {availabilityOptions.map(option => <option key={option}>{option}</option>)}
                  </select>
                  <input name="image" defaultValue={editingVehicle?.image ?? ''} placeholder="Primary image URL" className="bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold" />
                </div>
                <textarea name="gallery" defaultValue={editingVehicle?.gallery.join('\n') ?? ''} placeholder="Gallery URLs, one per line" rows={3} className="w-full bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold" />
                <label className="border border-dashed border-white/15 bg-white/[0.03] p-4 flex items-center gap-3 text-sm text-white/55">
                  <UploadCloud className="w-5 h-5 text-luxury-gold" />
                  <span>Upload vehicle images</span>
                  <input name="images" type="file" multiple accept="image/jpeg,image/png,image/webp" className="text-xs" />
                </label>
                <textarea name="description" defaultValue={editingVehicle?.description ?? ''} placeholder="Description" rows={3} className="w-full bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold" />
                <textarea name="features" defaultValue={editingVehicle?.features.join('\n') ?? ''} placeholder="Features, one per line" rows={3} className="w-full bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold" />
                <div className="grid grid-cols-3 gap-2 text-[10px] uppercase tracking-widest text-white/60">
                  <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={editingVehicle?.featured ?? false} /> Featured</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="negotiable" defaultChecked={editingVehicle?.negotiable ?? true} /> Negotiable</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="loanEligible" defaultChecked={editingVehicle?.loanEligible ?? true} /> Finance</label>
                </div>
                <button className="w-full bg-white text-black py-4 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-luxury-gold transition-colors">{editingVehicle ? 'Save Vehicle' : 'Create Vehicle'}</button>
              </fieldset>
            </form>

            <div>
              <Toolbar search={vehicleSearch} setSearch={setVehicleSearch} status={vehicleStatus} setStatus={setVehicleStatus} options={['all', ...availabilityOptions]} onRefresh={refreshAdminData} />
              <div className="space-y-4 mt-4">
                {visibleVehicles.length === 0 && <EmptyState text="No vehicles match the current filters." />}
                {visibleVehicles.map(vehicle => (
                  <article key={vehicle.id} className="bg-[#0E0E0E] border border-white/8 p-5 grid grid-cols-[110px_1fr] gap-5">
                    <img src={vehicle.image} alt={vehicle.make} className="w-full aspect-square object-cover bg-white/5" />
                    <div>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <h3 className="font-editorial text-2xl font-light">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                          <p className="text-sm text-white/45">{formatKes(vehicle.price)} - {formatNumber(vehicle.mileage)} km - {vehicle.location}</p>
                          <p className="mt-2 text-[10px] uppercase tracking-widest text-white/35">{vehicle.availability} - {vehicle.featured ? 'Featured' : 'Standard'} - {vehicle.gallery.length} images</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/cars/${vehicle.slug}`} className="border border-white/15 px-3 py-2 text-[10px] uppercase tracking-widest inline-flex items-center gap-2"><Eye className="w-4 h-4" /> Preview</Link>
                          {manageInventory && <button onClick={() => setEditingVehicle(vehicle)} className="border border-white/15 px-3 py-2 text-[10px] uppercase tracking-widest inline-flex items-center gap-2"><Edit3 className="w-4 h-4" /> Edit</button>}
                          {manageInventory && <button onClick={async () => setVehicles(await toggleFeaturedVehicle(vehicle.id))} className={`border px-3 py-2 text-[10px] uppercase tracking-widest inline-flex items-center gap-2 ${vehicle.featured ? 'border-luxury-gold text-luxury-gold' : 'border-white/15 text-white/60'}`}><Star className="w-4 h-4" /> Feature</button>}
                        </div>
                      </div>
                      {manageInventory && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {availabilityOptions.map(option => (
                            <button key={option} onClick={() => changeVehicleStatus(vehicle, option)} className={`border px-3 py-2 text-[10px] uppercase tracking-widest ${vehicle.availability === option ? 'border-luxury-gold text-luxury-gold' : 'border-white/15 text-white/50'}`}>{option}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'applications' && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8">
            <div>
              <Toolbar search={applicationSearch} setSearch={setApplicationSearch} status={applicationStatus} setStatus={setApplicationStatus} options={['all', ...statuses]} onRefresh={refreshAdminData} />
              <div className="space-y-4 mt-4">
                {visibleApplications.length === 0 && <EmptyState text="No loan applications match the current filters." />}
                {visibleApplications.map(application => (
                  <button key={application.id} onClick={() => loadApplicationDetail(application)} className={`w-full text-left bg-[#0E0E0E] border p-5 ${selectedApplication?.id === application.id ? 'border-luxury-gold' : 'border-white/8'}`}>
                    <p className="text-[10px] uppercase tracking-widest text-luxury-gold mb-2">{application.type} - {application.trackingNumber}</p>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h3 className="font-editorial text-2xl font-light">{application.name}</h3>
                        <p className="text-sm text-white/45">{application.phone} - {application.email} - {formatKes(application.requestedAmount)}</p>
                      </div>
                      <StatusPill label={application.status} />
                    </div>
                    <p className="mt-3 text-xs text-white/40">Assigned: {staffName(staff, application.assignedTo)} - Priority: {application.priority ?? 'normal'}</p>
                  </button>
                ))}
              </div>
            </div>
            <ApplicationPanel application={selectedApplication} staff={activeStaff} canAssign={manageAssignments} onSubmit={submitApplicationWorkflow} onDownload={openDocument} onReview={toggleDocumentReview} />
          </div>
        )}

        {tab === 'leads' && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8">
            <div>
              <Toolbar search={leadSearch} setSearch={setLeadSearch} status={leadStatus} setStatus={setLeadStatus} options={['all', ...leadStatuses]} onRefresh={refreshAdminData} />
              <div className="space-y-4 mt-4">
                {visibleLeads.length === 0 && <EmptyState text="No leads match the current filters." />}
                {visibleLeads.map(lead => (
                  <button key={lead.id} onClick={() => loadLeadDetail(lead)} className={`w-full text-left bg-[#0E0E0E] border p-5 ${selectedLead?.id === lead.id ? 'border-luxury-gold' : 'border-white/8'}`}>
                    <p className="text-[10px] uppercase tracking-widest text-luxury-gold mb-2">{lead.type} - {readableDate(lead.createdAt)}</p>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h3 className="font-editorial text-2xl font-light">{lead.name}</h3>
                        <p className="text-sm text-white/45">{lead.phone} {lead.email ? `- ${lead.email}` : ''}</p>
                      </div>
                      <StatusPill label={lead.status} />
                    </div>
                    <p className="mt-3 text-xs text-white/40">Assigned: {staffName(staff, lead.assignedTo)} - Source: {lead.source}</p>
                  </button>
                ))}
              </div>
            </div>
            <LeadPanel lead={selectedLead} staff={activeStaff} canAssign={manageAssignments} onSubmit={submitLeadWorkflow} />
          </div>
        )}

        {tab === 'analytics' && <AnalyticsPanel analytics={analytics} />}
        {tab === 'staff' && <StaffPanel profile={profile} staff={staff} canManage={manageTeam} onSubmit={submitStaff} onPatch={changeStaffRole} />}
        {tab === 'settings' && <SettingsPanel profile={profile} notice={notice} functionCount={1} />}
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E0E0E] border border-white/10 p-6">
            <AlertTriangle className="w-7 h-7 text-luxury-gold mb-5" />
            <h2 className="font-editorial text-3xl font-light mb-3">{confirmAction.title}</h2>
            <p className="text-sm text-white/55 mb-6">{confirmAction.body}</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmAction(null)} className="border border-white/15 py-3 text-[10px] uppercase tracking-widest">Cancel</button>
              <button onClick={async () => { await confirmAction.action(); setConfirmAction(null); }} className="bg-white text-black py-3 text-[10px] uppercase tracking-widest font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Toolbar({ search, setSearch, status, setStatus, options, onRefresh }: { search: string; setSearch: (value: string) => void; status: string; setStatus: (value: string) => void; options: string[]; onRefresh: () => void }) {
  return (
    <div className="bg-[#0E0E0E] border border-white/8 p-4 grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3">
      <label className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="w-full bg-white/5 border border-white/10 pl-10 pr-3 py-3 text-sm outline-none focus:border-luxury-gold" />
      </label>
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="bg-[#111] border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold">
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
      <button onClick={onRefresh} className="border border-white/15 px-4 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Refresh</button>
    </div>
  );
}

function StatusPill({ label }: { label: string }) {
  return <span className="w-fit text-[9px] uppercase tracking-widest text-luxury-gold border border-luxury-gold px-2 py-1">{label}</span>;
}

function ApplicationPanel({ application, staff, canAssign, onSubmit, onDownload, onReview }: { application: LoanApplication | null; staff: AdminProfile[]; canAssign: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onDownload: (document: LoanDocument) => void; onReview: (document: LoanDocument, reviewed: boolean) => void }) {
  if (!application) return <EmptyState text="Select an application to review details, documents, notes, and workflow actions." />;

  const message = `Hello ${application.name}, this is Kiriro Motors following up on application ${application.trackingNumber}. Current status: ${application.status}.`;

  return (
    <aside className="bg-[#0E0E0E] border border-white/8 p-6 h-fit xl:sticky xl:top-24">
      <p className="text-[10px] uppercase tracking-widest text-luxury-gold mb-2">{application.trackingNumber}</p>
      <h2 className="font-editorial text-3xl font-light mb-2">{application.name}</h2>
      <p className="text-sm text-white/45 mb-5">{application.phone} - {application.email}</p>
      <div className="grid grid-cols-2 gap-3 text-sm mb-6">
        <Info label="Requested" value={formatKes(application.requestedAmount)} />
        <Info label="Asset Value" value={formatKes(application.assetValue)} />
        <Info label="Term" value={`${application.durationMonths} months`} />
        <Info label="Assigned" value={staffName(staff, application.assignedTo)} />
      </div>
      <a href={whatsappUrl(message, application.phone)} target="_blank" rel="noreferrer" className="mb-6 w-full bg-green-500 text-black py-3 text-[10px] uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2">
        <MessageCircle className="w-4 h-4" /> WhatsApp Handoff
      </a>
      <form onSubmit={onSubmit} className="space-y-3 border-y border-white/8 py-5 mb-5">
        <select name="status" defaultValue={application.status} className="w-full bg-[#111] border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold">
          {statuses.map(status => <option key={status}>{status}</option>)}
        </select>
        <select name="priority" defaultValue={application.priority ?? 'normal'} disabled={!canAssign} className="w-full bg-[#111] border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold disabled:opacity-60">
          {priorities.map(priority => <option key={priority}>{priority}</option>)}
        </select>
        <select name="assignedTo" defaultValue={application.assignedTo ?? ''} disabled={!canAssign} className="w-full bg-[#111] border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold disabled:opacity-60">
          <option value="">Unassigned</option>
          {staff.map(member => <option key={member.id} value={member.id}>{member.fullName || member.email}</option>)}
        </select>
        <textarea name="note" rows={3} placeholder="Internal note" className="w-full bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold" />
        <button className="w-full bg-white text-black py-3 text-[10px] uppercase tracking-widest font-bold">Update Application</button>
      </form>
      <h3 className="text-[10px] uppercase tracking-widest text-white/45 font-bold mb-3">Documents</h3>
      <div className="space-y-2 mb-6">
        {(application.documentRecords ?? []).length === 0 && <p className="text-sm text-white/35">No uploaded document records.</p>}
        {(application.documentRecords ?? []).map(document => (
          <div key={document.id} className="border border-white/8 p-3">
            <p className="text-sm">{document.fileName}</p>
            <p className="text-xs text-white/40 mb-3">{document.documentType ?? 'Document'} - {document.uploaded ? 'Uploaded' : 'Pending upload'} - {document.reviewedAt ? 'Reviewed' : 'Unreviewed'}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => onDownload(document)} className="border border-white/15 px-3 py-2 text-[10px] uppercase tracking-widest inline-flex items-center gap-2"><Download className="w-4 h-4" /> Open</button>
              <button type="button" onClick={() => onReview(document, !document.reviewedAt)} className="border border-white/15 px-3 py-2 text-[10px] uppercase tracking-widest inline-flex items-center gap-2"><FileCheck className="w-4 h-4" /> {document.reviewedAt ? 'Unreview' : 'Review'}</button>
            </div>
          </div>
        ))}
      </div>
      <h3 className="text-[10px] uppercase tracking-widest text-white/45 font-bold mb-3">Notes & History</h3>
      <div className="space-y-2 text-sm text-white/55">
        {application.notes.map((note, index) => <p key={`${note}-${index}`} className="border-b border-white/8 pb-2">{note}</p>)}
        {(application.history ?? []).map(entry => <p key={entry.id} className="border-b border-white/8 pb-2">{entry.previousStatus ?? 'New'} to {entry.nextStatus} - {readableDate(entry.createdAt)}</p>)}
        {application.notes.length === 0 && (application.history ?? []).length === 0 && <p>No workflow notes yet.</p>}
      </div>
    </aside>
  );
}

function LeadPanel({ lead, staff, canAssign, onSubmit }: { lead: Lead | null; staff: AdminProfile[]; canAssign: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  if (!lead) return <EmptyState text="Select a lead to triage, assign, note, and open a WhatsApp handoff." />;

  const message = `Hello ${lead.name}, this is Kiriro Motors following up on your ${lead.source} inquiry.`;

  return (
    <aside className="bg-[#0E0E0E] border border-white/8 p-6 h-fit xl:sticky xl:top-24">
      <p className="text-[10px] uppercase tracking-widest text-luxury-gold mb-2">{lead.type} - {readableDate(lead.createdAt)}</p>
      <h2 className="font-editorial text-3xl font-light mb-2">{lead.name}</h2>
      <p className="text-sm text-white/45 mb-5">{lead.phone} {lead.email ? `- ${lead.email}` : ''}</p>
      <p className="text-sm text-white/60 mb-5">{lead.message}</p>
      <a href={whatsappUrl(message, lead.phone)} target="_blank" rel="noreferrer" className="mb-6 w-full bg-green-500 text-black py-3 text-[10px] uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2">
        <MessageCircle className="w-4 h-4" /> WhatsApp Handoff
      </a>
      <form onSubmit={onSubmit} className="space-y-3 border-y border-white/8 py-5 mb-5">
        <select name="status" defaultValue={lead.status} className="w-full bg-[#111] border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold">
          {leadStatuses.map(status => <option key={status}>{status}</option>)}
        </select>
        <select name="priority" defaultValue={lead.priority ?? 'normal'} disabled={!canAssign} className="w-full bg-[#111] border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold disabled:opacity-60">
          {priorities.map(priority => <option key={priority}>{priority}</option>)}
        </select>
        <select name="assignedTo" defaultValue={lead.assignedTo ?? ''} disabled={!canAssign} className="w-full bg-[#111] border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold disabled:opacity-60">
          <option value="">Unassigned</option>
          {staff.map(member => <option key={member.id} value={member.id}>{member.fullName || member.email}</option>)}
        </select>
        <textarea name="note" rows={3} placeholder="Internal note" className="w-full bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold" />
        <button className="w-full bg-white text-black py-3 text-[10px] uppercase tracking-widest font-bold">Update Lead</button>
      </form>
      <h3 className="text-[10px] uppercase tracking-widest text-white/45 font-bold mb-3">Notes</h3>
      <div className="space-y-2 text-sm text-white/55">
        {(lead.notes ?? []).map((note, index) => <p key={`${note}-${index}`} className="border-b border-white/8 pb-2">{note}</p>)}
        {(lead.notes ?? []).length === 0 && <p>No notes yet.</p>}
      </div>
    </aside>
  );
}

function AnalyticsPanel({ analytics }: { analytics: AdminAnalytics | null }) {
  const metrics = analytics?.metrics;
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          ['Active Vehicles', metrics?.activeVehicles ?? 0],
          ['Sold Vehicles', metrics?.soldVehicles ?? 0],
          ['Featured', metrics?.featuredVehicles ?? 0],
          ['Inventory Value', formatKes(metrics?.inventoryValue ?? 0)],
          ['Applications', metrics?.applications ?? 0],
          ['Approved/Disbursed', metrics?.approvedApplications ?? 0],
          ['New Leads', metrics?.newLeads ?? 0],
          ['WhatsApp Leads', metrics?.whatsappLeads ?? 0],
        ].map(([label, value]) => (
          <div key={label} className="bg-[#0E0E0E] border border-white/8 p-6">
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">{label}</p>
            <p className="font-editorial text-3xl font-light">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Breakdown title="Lead Sources" data={analytics?.leadSources ?? {}} />
        <Breakdown title="Application Statuses" data={analytics?.applicationStatuses ?? {}} />
        <div className="bg-[#0E0E0E] border border-white/8 p-6">
          <h2 className="font-editorial text-3xl font-light mb-6">Audit Trail</h2>
          <div className="space-y-3">
            {(analytics?.auditEvents ?? []).map(event => (
              <div key={event.id} className="border-b border-white/8 pb-3 text-sm">
                <p>{event.action}</p>
                <p className="text-xs text-white/40">{event.entityType} - {readableDate(event.createdAt)}</p>
              </div>
            ))}
            {(analytics?.auditEvents ?? []).length === 0 && <p className="text-white/45 text-sm">Audit events appear after admin actions.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StaffPanel({ profile, staff, canManage, onSubmit, onPatch }: { profile: AdminProfile | null; staff: AdminProfile[]; canManage: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onPatch: (member: AdminProfile, patch: Partial<AdminProfile>) => void }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8">
      <form onSubmit={onSubmit} className="bg-[#0E0E0E] border border-white/8 p-6 h-fit">
        <h2 className="font-editorial text-3xl font-light mb-5">Create Staff</h2>
        {!canManage && <p className="text-sm text-white/45 mb-5">Only owners can create or edit staff accounts.</p>}
        <fieldset disabled={!canManage} className="space-y-3 disabled:opacity-60">
          <input name="fullName" placeholder="Full name" className="w-full bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold" />
          <input name="email" type="email" required placeholder="Email" className="w-full bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold" />
          <input name="phone" placeholder="Phone" className="w-full bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold" />
          <input name="password" type="password" required placeholder="Temporary password" className="w-full bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold" />
          <select name="role" defaultValue="staff" className="w-full bg-[#111] border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold">
            {roles.map(role => <option key={role}>{role}</option>)}
          </select>
          <button className="w-full bg-white text-black py-4 text-[10px] uppercase tracking-widest font-bold">Create Staff</button>
        </fieldset>
      </form>
      <div className="space-y-4">
        {staff.map(member => (
          <article key={member.id} className="bg-[#0E0E0E] border border-white/8 p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h3 className="font-editorial text-2xl font-light">{member.fullName || member.email}</h3>
                <p className="text-sm text-white/45">{member.email} {member.phone ? `- ${member.phone}` : ''}</p>
                <p className="mt-2 text-[10px] uppercase tracking-widest text-white/35">{member.role} - {member.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={member.role} disabled={!canManage || member.id === profile?.id} onChange={(event) => onPatch(member, { role: event.target.value as AdminRole })} className="bg-[#111] border border-white/10 px-3 py-2 text-sm outline-none focus:border-luxury-gold disabled:opacity-60">
                  {roles.map(role => <option key={role}>{role}</option>)}
                </select>
                <button disabled={!canManage || member.id === profile?.id} onClick={() => onPatch(member, { isActive: !member.isActive })} className="border border-white/15 px-3 py-2 text-[10px] uppercase tracking-widest disabled:opacity-60">{member.isActive ? 'Deactivate' : 'Activate'}</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({ profile, notice, functionCount }: { profile: AdminProfile | null; notice: string; functionCount: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <InfoCard icon={ShieldCheck} title="Session" value={profile?.role ?? 'unknown'} detail={notice || 'Connected'} />
      <InfoCard icon={Settings} title="Vercel API" value={`${functionCount} function`} detail="All /api routes are dispatched through the Hobby-safe catch-all function." />
      <InfoCard icon={FileCheck} title="Documents" value="Signed URLs" detail="Customer uploads and admin downloads use short-lived Supabase signed URLs." />
      <div className="lg:col-span-3 bg-[#0E0E0E] border border-white/8 p-6">
        <h2 className="font-editorial text-3xl font-light mb-5">Role Matrix</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <p className="text-white/60"><strong className="text-white">Owner:</strong> staff, settings, inventory, leads, applications, documents.</p>
          <p className="text-white/60"><strong className="text-white">Admin:</strong> inventory, leads, applications, assignments, documents.</p>
          <p className="text-white/60"><strong className="text-white">Staff:</strong> assigned leads/applications, notes, statuses, WhatsApp handoff.</p>
        </div>
      </div>
    </div>
  );
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data);
  return (
    <div className="bg-[#0E0E0E] border border-white/8 p-6">
      <h2 className="font-editorial text-3xl font-light mb-6">{title}</h2>
      <div className="space-y-3">
        {entries.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-white/8 pb-3 text-sm">
            <span className="text-white/60">{label}</span>
            <span>{value}</span>
          </div>
        ))}
        {entries.length === 0 && <p className="text-white/45 text-sm">No data yet.</p>}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/8 p-3">
      <p className="text-[9px] uppercase tracking-widest text-white/35 mb-1">{label}</p>
      <p>{value}</p>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value, detail }: { icon: typeof ShieldCheck; title: string; value: string; detail: string }) {
  return (
    <div className="bg-[#0E0E0E] border border-white/8 p-6">
      <Icon className="w-6 h-6 text-luxury-gold mb-5" />
      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">{title}</p>
      <p className="font-editorial text-3xl font-light mb-3">{value}</p>
      <p className="text-sm text-white/50">{detail}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-white/8 bg-white/[0.03] p-10 text-center">
      <CheckCircle className="w-8 h-8 text-white/25 mx-auto mb-4" />
      <p className="text-white/45">{text}</p>
    </div>
  );
}
