import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BarChart3, CheckCircle, ClipboardList, Eye, LogOut, Plus, Star, Users } from 'lucide-react';
import { ApplicationStatus, Lead, LoanApplication, Vehicle, VehicleAvailability } from '../types';
import { formatKes, formatNumber, readableDate } from '../utils/format';
import { createId, getApplications, getLeads, getVehicles, isAdminLoggedIn, loginAdmin, logoutAdmin, toggleFeaturedVehicle, updateApplicationStatus, updateLeadStatus, updateVehicleStatus, upsertVehicle } from '../utils/storage';

type AdminTab = 'vehicles' | 'applications' | 'leads' | 'analytics';

const statuses: ApplicationStatus[] = ['Submitted', 'Under Review', 'Approved', 'Disbursed', 'Rejected'];
const availabilityOptions: VehicleAvailability[] = ['Available', 'Reserved', 'Sold', 'Archived'];
const leadStatuses: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Closed'];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAdminLoggedIn());
  const [tab, setTab] = useState<AdminTab>('vehicles');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loginError, setLoginError] = useState('');
  const [sessionMode, setSessionMode] = useState('');

  const refreshAdminData = async () => {
    const [nextVehicles, nextApplications, nextLeads] = await Promise.all([
      getVehicles({ admin: true }),
      getApplications(),
      getLeads(),
    ]);
    setVehicles(nextVehicles);
    setApplications(nextApplications);
    setLeads(nextLeads);
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    refreshAdminData();
  }, [isLoggedIn]);

  const analytics = useMemo(() => {
    const activeVehicles = vehicles.filter(vehicle => vehicle.availability !== 'Archived');
    const soldVehicles = vehicles.filter(vehicle => vehicle.availability === 'Sold');
    const newLeads = leads.filter(lead => lead.status === 'New');
    const whatsappClicks = leads.filter(lead => lead.type === 'whatsapp').length;
    const approvedApplications = applications.filter(application => application.status === 'Approved' || application.status === 'Disbursed');

    return {
      activeVehicles: activeVehicles.length,
      soldVehicles: soldVehicles.length,
      newLeads: newLeads.length,
      applications: applications.length,
      approvedApplications: approvedApplications.length,
      whatsappClicks,
      inventoryValue: activeVehicles.reduce((sum, vehicle) => sum + vehicle.price, 0),
    };
  }, [applications, leads, vehicles]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');

    if (!email || !password) {
      setLoginError('Enter any email and password to open the local CMS prototype.');
      return;
    }

    try {
      const result = await loginAdmin(email, password);
      setSessionMode(result.remote ? 'Connected to Supabase admin session.' : 'Using local demo admin fallback until Supabase env vars are configured.');
      setIsLoggedIn(true);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed.');
    }
  };

  const logout = async () => {
    await logoutAdmin();
    setIsLoggedIn(false);
  };

  const addVehicle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const make = String(form.get('make') ?? '');
    const model = String(form.get('model') ?? '');
    const year = Number(form.get('year') ?? new Date().getFullYear());
    const price = Number(form.get('price') ?? 0);
    const image = String(form.get('image') ?? '');
    const createdAt = new Date().toISOString();
    const slug = slugify(`${make}-${model}-${year}-${Date.now()}`);

    const vehicle: Vehicle = {
      id: createId('v'),
      slug,
      make,
      model,
      trim: String(form.get('trim') ?? ''),
      year,
      price,
      mileage: Number(form.get('mileage') ?? 0),
      fuel: String(form.get('fuel') ?? 'Petrol'),
      transmission: String(form.get('transmission') ?? 'Automatic'),
      image,
      gallery: image ? [image] : [],
      bodyType: String(form.get('bodyType') ?? 'SUV'),
      engine: String(form.get('engine') ?? ''),
      seats: Number(form.get('seats') ?? 5),
      driveType: String(form.get('driveType') ?? 'Two-Wheel Drive'),
      color: String(form.get('color') ?? ''),
      condition: String(form.get('condition') ?? 'Foreign Used'),
      availability: 'Available',
      location: String(form.get('location') ?? 'Nairobi Showroom'),
      vin: String(form.get('vin') ?? ''),
      negotiable: form.get('negotiable') === 'on',
      featured: form.get('featured') === 'on',
      loanEligible: form.get('loanEligible') === 'on',
      description: String(form.get('description') ?? ''),
      features: String(form.get('features') ?? '').split(',').map(feature => feature.trim()).filter(Boolean),
      createdAt,
    };

    setVehicles(await upsertVehicle(vehicle));
    event.currentTarget.reset();
  };

  const changeVehicleStatus = async (vehicleId: string, status: VehicleAvailability) => {
    setVehicles(await updateVehicleStatus(vehicleId, status));
  };

  const changeApplicationStatus = async (applicationId: string, status: ApplicationStatus) => {
    setApplications(await updateApplicationStatus(applicationId, status, `Status changed to ${status} from admin CMS.`));
  };

  const changeLeadStatus = async (leadId: string, status: Lead['status']) => {
    setLeads(await updateLeadStatus(leadId, status));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
        <form onSubmit={login} className="w-full max-w-md bg-[#0E0E0E] border border-white/8 p-8">
          <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">Admin CMS</p>
          <h1 className="font-editorial text-4xl font-light mb-5">Staff Login</h1>
          <p className="text-white/45 text-sm mb-6">Use a Supabase admin account. If cloud env vars are missing, any email and password opens the local fallback CMS.</p>
          <div className="space-y-3">
            <input name="email" type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-luxury-gold" />
            <input name="password" type="password" placeholder="Password" className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-luxury-gold" />
          </div>
          {loginError && <p className="mt-4 text-sm text-red-300">{loginError}</p>}
          <button className="mt-6 w-full bg-white text-black py-4 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-luxury-gold transition-colors">Open CMS</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <section className="pt-24 pb-10 bg-[#0E0E0E] border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">Internal CMS</p>
            <h1 className="font-editorial text-5xl font-light">Admin Dashboard</h1>
            {sessionMode && <p className="text-sm text-white/45 mt-3">{sessionMode}</p>}
          </div>
          <button onClick={logout} className="border border-white/15 px-5 py-3 text-[10px] uppercase tracking-widest font-bold inline-flex items-center gap-2 hover:bg-white hover:text-black transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { id: 'vehicles', icon: Eye, label: 'Vehicles' },
            { id: 'applications', icon: ClipboardList, label: 'Loans' },
            { id: 'leads', icon: Users, label: 'Customers' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id as AdminTab)} className={`p-4 border text-left ${tab === item.id ? 'bg-white text-black border-white' : 'border-white/10 bg-white/[0.03] hover:border-luxury-gold/50'}`}>
              <item.icon className="w-5 h-5 mb-4" />
              <span className="text-[10px] uppercase tracking-widest font-bold">{item.label}</span>
            </button>
          ))}
        </div>

        {tab === 'vehicles' && (
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
            <form onSubmit={addVehicle} className="bg-[#0E0E0E] border border-white/8 p-6 h-fit">
              <h2 className="font-editorial text-3xl font-light mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-luxury-gold" /> Add Vehicle</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['make', 'model', 'trim', 'year', 'price', 'mileage', 'fuel', 'transmission', 'bodyType', 'engine', 'seats', 'driveType', 'color', 'condition', 'location', 'vin'].map(name => (
                  <input key={name} name={name} required={['make', 'model', 'year', 'price', 'image'].includes(name)} placeholder={name} className="bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold" />
                ))}
                <input name="image" required placeholder="Primary image URL" className="bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold md:col-span-2" />
                <textarea name="description" placeholder="Description" rows={3} className="bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold md:col-span-2" />
                <input name="features" placeholder="Features, comma separated" className="bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold md:col-span-2" />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] uppercase tracking-widest text-white/60">
                <label className="flex items-center gap-2"><input type="checkbox" name="featured" /> Featured</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="negotiable" defaultChecked /> Negotiable</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="loanEligible" defaultChecked /> Finance</label>
              </div>
              <button className="mt-5 w-full bg-white text-black py-4 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-luxury-gold transition-colors">Create Vehicle</button>
            </form>

            <div className="space-y-4">
              {vehicles.map(vehicle => (
                <article key={vehicle.id} className="bg-[#0E0E0E] border border-white/8 p-5 grid grid-cols-[110px_1fr] gap-5">
                  <img src={vehicle.image} alt={vehicle.make} className="w-full aspect-square object-cover" />
                  <div>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h3 className="font-editorial text-2xl font-light">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                        <p className="text-sm text-white/45">{formatKes(vehicle.price)} - {formatNumber(vehicle.mileage)} km - {vehicle.location}</p>
                      </div>
                      <button onClick={async () => setVehicles(await toggleFeaturedVehicle(vehicle.id))} className={`px-3 py-2 text-[10px] uppercase tracking-widest font-bold border inline-flex items-center gap-2 ${vehicle.featured ? 'border-luxury-gold text-luxury-gold' : 'border-white/15 text-white/45'}`}>
                        <Star className="w-4 h-4" /> {vehicle.featured ? 'Featured' : 'Feature'}
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <select value={vehicle.availability} onChange={(event) => changeVehicleStatus(vehicle.id, event.target.value as VehicleAvailability)} className="bg-[#111] border border-white/10 px-3 py-2 text-sm outline-none focus:border-luxury-gold">
                        {availabilityOptions.map(option => <option key={option}>{option}</option>)}
                      </select>
                      <button onClick={() => changeVehicleStatus(vehicle.id, 'Sold')} className="border border-white/15 px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Mark Sold</button>
                      <button onClick={() => changeVehicleStatus(vehicle.id, 'Archived')} className="border border-white/15 px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Archive</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 && <EmptyState text="No loan applications yet. Submit one through /apply." />}
            {applications.map(application => (
              <article key={application.id} className="bg-[#0E0E0E] border border-white/8 p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-luxury-gold mb-2">{application.type} - {application.trackingNumber}</p>
                    <h3 className="font-editorial text-2xl font-light">{application.name}</h3>
                    <p className="text-sm text-white/45">{application.phone} - {application.email} - {formatKes(application.requestedAmount)}</p>
                    <p className="text-sm text-white/55 mt-3">{application.purpose}</p>
                  </div>
                  <select value={application.status} onChange={(event) => changeApplicationStatus(application.id, event.target.value as ApplicationStatus)} className="bg-[#111] border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold">
                    {statuses.map(status => <option key={status}>{status}</option>)}
                  </select>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {application.documents.length > 0 ? application.documents.map(document => <span key={document} className="bg-white/5 border border-white/8 px-3 py-2 text-[10px] uppercase tracking-widest">{document}</span>) : <span className="text-white/35 text-sm">No documents attached</span>}
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === 'leads' && (
          <div className="space-y-4">
            {leads.length === 0 && <EmptyState text="No leads yet. Submit contact, vehicle inquiry, viewing, or brochure actions." />}
            {leads.map(lead => (
              <article key={lead.id} className="bg-[#0E0E0E] border border-white/8 p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-luxury-gold mb-2">{lead.type} - {readableDate(lead.createdAt)}</p>
                    <h3 className="font-editorial text-2xl font-light">{lead.name}</h3>
                    <p className="text-sm text-white/45">{lead.phone} {lead.email ? `- ${lead.email}` : ''}</p>
                    <p className="text-sm text-white/60 mt-3">{lead.message}</p>
                  </div>
                  <select value={lead.status} onChange={(event) => changeLeadStatus(lead.id, event.target.value as Lead['status'])} className="bg-[#111] border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold">
                    {leadStatuses.map(status => <option key={status}>{status}</option>)}
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === 'analytics' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                ['Active Vehicles', analytics.activeVehicles],
                ['Sold Vehicles', analytics.soldVehicles],
                ['Inventory Value', formatKes(analytics.inventoryValue)],
                ['Loan Applications', analytics.applications],
                ['Approved/Disbursed', analytics.approvedApplications],
                ['New Leads', analytics.newLeads],
              ].map(([label, value]) => (
                <div key={label} className="bg-[#0E0E0E] border border-white/8 p-6">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">{label}</p>
                  <p className="font-editorial text-3xl font-light">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#0E0E0E] border border-white/8 p-6">
              <h2 className="font-editorial text-3xl font-light mb-6">Lead Sources</h2>
              <div className="space-y-3">
                {Array.from(new Set(leads.map(lead => lead.source))).map(source => {
                  const count = leads.filter(lead => lead.source === source).length;
                  return (
                    <div key={source} className="flex items-center justify-between border-b border-white/8 pb-3 text-sm">
                      <span className="text-white/60">{source}</span>
                      <span>{count}</span>
                    </div>
                  );
                })}
                {leads.length === 0 && <p className="text-white/45 text-sm">Lead source analytics appear after user submissions.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
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
