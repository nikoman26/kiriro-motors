import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Brain,
  Car,
  CheckCircle,
  ClipboardList,
  Cloud,
  CreditCard,
  Database,
  FileText,
  LockKeyhole,
  MapPinned,
  MessageCircle,
  MonitorSmartphone,
  Presentation,
  Rocket,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react';
import { INVENTORY } from '../data';

type Maturity = 'Live' | 'Demo Mock' | 'Next' | 'Future';

const maturityStyles: Record<Maturity, string> = {
  Live: 'border-green-300/40 bg-green-300/10 text-green-200',
  'Demo Mock': 'border-luxury-gold/50 bg-luxury-gold/10 text-luxury-gold',
  Next: 'border-sky-300/40 bg-sky-300/10 text-sky-200',
  Future: 'border-white/20 bg-white/5 text-white/60',
};

const demoLinks = [
  { label: 'Inventory Demo', path: '/cars?from=pitch' },
  { label: 'Application Demo', path: '/apply?from=pitch' },
  { label: 'Logbook Flow', path: '/logbook-loans?from=pitch' },
  { label: 'Land Title Flow', path: '/land-title-loans?from=pitch' },
  { label: 'Lead Capture', path: '/contact?from=pitch' },
  { label: 'Admin Analytics', path: '/admin?tab=analytics&from=pitch' },
];

const liveModules = [
  {
    icon: Car,
    title: 'Vehicle Marketplace',
    value: 'Browse, filter, save, compare, and inspect premium inventory.',
    path: '/cars?from=pitch',
    badge: 'Live' as Maturity,
  },
  {
    icon: FileText,
    title: 'Financing Applications',
    value: 'Customers submit logbook, land title, and vehicle finance requests with tracking numbers.',
    path: '/apply?from=pitch',
    badge: 'Live' as Maturity,
  },
  {
    icon: ShieldCheck,
    title: 'Admin Operations CMS',
    value: 'Staff manage inventory, leads, applications, documents, assignments, and roles.',
    path: '/admin?tab=vehicles&from=pitch',
    badge: 'Live' as Maturity,
  },
  {
    icon: MessageCircle,
    title: 'Lead And WhatsApp Handoff',
    value: 'Inquiry forms and owner handoff links keep sales conversations moving quickly.',
    path: '/contact?from=pitch',
    badge: 'Live' as Maturity,
  },
  {
    icon: BarChart3,
    title: 'Operations Analytics',
    value: 'Admin metrics show active stock, lead sources, application status, and audit activity.',
    path: '/admin?tab=analytics&from=pitch',
    badge: 'Live' as Maturity,
  },
  {
    icon: Cloud,
    title: 'Supabase Production Layer',
    value: 'Database, auth, storage, signed uploads, and Vercel API routes support real workflows.',
    path: '/admin?tab=settings&from=pitch',
    badge: 'Live' as Maturity,
  },
];

const futureModules = [
  {
    icon: MonitorSmartphone,
    title: 'Customer Portal',
    badge: 'Demo Mock' as Maturity,
    text: 'A private customer area for saved vehicles, application status, messages, and document requests.',
  },
  {
    icon: BellRing,
    title: 'Automated Notifications',
    badge: 'Demo Mock' as Maturity,
    text: 'Email, SMS, and WhatsApp provider integrations for lead alerts and application updates.',
  },
  {
    icon: CreditCard,
    title: 'M-Pesa Deposits',
    badge: 'Future' as Maturity,
    text: 'Reservation deposits and finance processing fees with payment confirmation records.',
  },
  {
    icon: MapPinned,
    title: 'Branch And Map Tools',
    badge: 'Next' as Maturity,
    text: 'Map-based branches, showroom directions, appointment areas, and location-aware contact flows.',
  },
  {
    icon: Brain,
    title: 'AI Sales Assistant',
    badge: 'Demo Mock' as Maturity,
    text: 'Guided vehicle recommendations, affordability explanations, and loan document help.',
  },
  {
    icon: Smartphone,
    title: 'Mobile App Path',
    badge: 'Future' as Maturity,
    text: 'A future companion app can reuse the same Supabase-backed workflows and customer data model.',
  },
];

const systemFlow = [
  { icon: Presentation, label: 'React/Vite Frontend', text: 'Fast public pages and admin screens run as one responsive web app.' },
  { icon: Server, label: 'Vercel API Function', text: 'One Hobby-safe catch-all function handles admin, uploads, leads, and applications.' },
  { icon: Database, label: 'Supabase Database', text: 'Vehicles, leads, applications, staff profiles, documents, and audit events persist in Postgres.' },
  { icon: LockKeyhole, label: 'Auth And Storage', text: 'Staff roles, signed document URLs, and private loan files protect sensitive operations.' },
  { icon: Sparkles, label: 'Demo Fallback', text: 'If the backend is unavailable, local demo mode keeps presentation flows usable.' },
];

const readiness = [
  ['Marketplace browsing', 'Live'],
  ['Admin inventory management', 'Live'],
  ['Lead and application capture', 'Live'],
  ['Private document upload flow', 'Live'],
  ['Owner pitch presentation', 'Live'],
  ['Privacy and terms copy', 'Next'],
  ['Email/SMS provider alerts', 'Demo Mock'],
  ['M-Pesa reservations', 'Future'],
  ['Customer portal', 'Demo Mock'],
  ['Mobile application', 'Future'],
] as const;

function Badge({ value }: { value: Maturity }) {
  return <span className={`w-fit border px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold ${maturityStyles[value]}`}>{value}</span>;
}

export default function Pitch() {
  const heroVehicle = INVENTORY[1] ?? INVENTORY[0];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <section className="relative min-h-[84vh] overflow-hidden">
        <img src={heroVehicle.image} alt={`${heroVehicle.make} ${heroVehicle.model}`} className="absolute inset-0 w-full h-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/65 to-black/45" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 min-h-[84vh] flex flex-col justify-between">
          <div className="max-w-4xl">
            <Badge value="Live" />
            <h1 className="font-editorial text-5xl md:text-7xl font-light leading-none mt-6 mb-6">Kiriro Motors Owner Pitch</h1>
            <p className="text-lg md:text-xl text-white/65 max-w-3xl leading-relaxed">
              A guided presentation of what the platform does today, what is mocked for business demos, and what can be expanded next.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-end">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['6', 'Public demo paths'],
                ['1', 'Vercel API function'],
                ['3', 'Admin roles'],
                ['10 MB', 'Document limit'],
              ].map(([value, label]) => (
                <div key={label} className="border border-white/10 bg-black/35 backdrop-blur-md p-4">
                  <p className="font-editorial text-3xl font-light">{value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/45 mt-2">{label}</p>
                </div>
              ))}
            </div>
            <div className="border border-white/10 bg-black/45 backdrop-blur-md p-5">
              <p className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold mb-4">Presentation Flow</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoLinks.map(link => (
                  <Link key={link.path} to={link.path} className="border border-white/12 px-3 py-3 text-[10px] uppercase tracking-widest font-bold text-white/70 hover:bg-white hover:text-black transition-colors inline-flex items-center justify-between gap-3">
                    {link.label}
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-y border-white/8 bg-[#0E0E0E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">What Is Working Now</p>
              <h2 className="font-editorial text-4xl md:text-5xl font-light">Live business modules</h2>
            </div>
            <p className="text-white/50 max-w-xl text-sm leading-relaxed">These modules connect to real routes and show the owner the customer journey, staff workflow, and operational value.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {liveModules.map(module => {
              const Icon = module.icon;
              return (
                <article key={module.title} className="border border-white/8 bg-white/[0.03] p-6">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <Icon className="w-7 h-7 text-luxury-gold" />
                    <Badge value={module.badge} />
                  </div>
                  <h3 className="font-editorial text-2xl font-light mb-3">{module.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed mb-6">{module.value}</p>
                  <Link to={module.path} className="text-[10px] uppercase tracking-widest font-bold text-luxury-gold inline-flex items-center gap-2 hover:text-white">
                    Open demo <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">Presentation Mockups</p>
            <h2 className="font-editorial text-4xl md:text-5xl font-light">Future features, shown clearly as demos</h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="border border-white/10 bg-[#0E0E0E] p-5 md:p-7">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Customer Portal Mock</p>
                  <h3 className="font-editorial text-3xl font-light">One place for saved cars and finance progress</h3>
                </div>
                <Badge value="Demo Mock" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5">
                <div className="border border-white/8 bg-black/25 p-4">
                  <img src={INVENTORY[2]?.image ?? heroVehicle.image} alt="Saved vehicle preview" className="w-full aspect-[4/3] object-cover mb-4" />
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Saved Vehicle</p>
                  <p className="font-editorial text-2xl font-light">{INVENTORY[2]?.year} {INVENTORY[2]?.make} {INVENTORY[2]?.model}</p>
                  <p className="text-sm text-white/50 mt-2">Finance preview, viewing request, and WhatsApp handoff stay connected.</p>
                </div>
                <div className="space-y-3">
                  {[
                    ['Application', 'KR-LB-2026-482910', 'Under Review'],
                    ['Document Request', 'Bank statements', 'Pending'],
                    ['Message', 'Finance desk follow-up', 'Today'],
                  ].map(([type, title, status]) => (
                    <div key={title} className="border border-white/8 bg-white/[0.03] p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-white/35 mb-1">{type}</p>
                        <p>{title}</p>
                      </div>
                      <span className="text-[9px] uppercase tracking-widest text-luxury-gold">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
              {futureModules.map(module => {
                const Icon = module.icon;
                return (
                  <article key={module.title} className="border border-white/8 bg-[#0E0E0E] p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <Icon className="w-6 h-6 text-luxury-gold" />
                      <Badge value={module.badge} />
                    </div>
                    <h3 className="font-editorial text-2xl font-light mb-2">{module.title}</h3>
                    <p className="text-sm text-white/55 leading-relaxed">{module.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0E0E0E] border-y border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">Owner Guide</p>
            <h2 className="font-editorial text-4xl md:text-5xl font-light">How the system works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-white/8">
            {systemFlow.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-[#0E0E0E] p-5">
                  <Icon className="w-6 h-6 text-luxury-gold mb-6" />
                  <h3 className="text-sm font-semibold mb-3">{item.label}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 items-start">
          <div>
            <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">Readiness</p>
            <h2 className="font-editorial text-4xl md:text-5xl font-light mb-5">Launch view for the owner</h2>
            <p className="text-white/55 leading-relaxed mb-8">The page separates what is live from what is shown for presentation. That keeps the demo polished without overstating production integrations.</p>
            <Link to="/admin?tab=settings&from=pitch" className="bg-white text-black px-5 py-4 text-[10px] uppercase tracking-widest font-bold inline-flex items-center gap-2 hover:bg-luxury-gold transition-colors">
              Review admin settings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {readiness.map(([label, status]) => (
              <div key={label} className="border border-white/8 bg-[#0E0E0E] p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-luxury-gold shrink-0" />
                  <span className="text-sm text-white/75">{label}</span>
                </div>
                <Badge value={status} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-luxury-cream text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <Rocket className="w-7 h-7 mb-5 text-black/55" />
            <h2 className="font-editorial text-4xl font-light mb-3">Ready to walk through the demo?</h2>
            <p className="text-black/60 max-w-2xl">Start with the inventory, submit a sample application, then open admin analytics to show the full business loop.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/cars?from=pitch" className="bg-black text-white px-5 py-4 text-[10px] uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2">
              Start demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/admin?tab=analytics&from=pitch" className="border border-black/20 px-5 py-4 text-[10px] uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2">
              Open admin <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
