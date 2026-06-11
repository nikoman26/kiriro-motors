import { Award, Building2, Handshake, ShieldCheck, Target } from 'lucide-react';

const timeline = [
  ['2018', 'Kiriro begins as a relationship-led vehicle sourcing and sales operation.'],
  ['2021', 'Asset-backed financing workflows are added for customers needing structured capital.'],
  ['2024', 'Digital-first inventory and lead management becomes the next growth priority.'],
  ['2026', 'Marketplace, finance applications, and admin CMS prototype launches.'],
];

export default function About() {
  return (
    <div className="bg-luxury-cream text-black min-h-screen">
      <section className="bg-[#0E0E0E] text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-luxury-gold uppercase tracking-[0.22em] sm:tracking-[0.35em] text-[10px] mb-4 font-bold">About Kiriro</p>
          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-light max-w-3xl leading-tight mb-6">A digital-first automotive and financing partner.</h1>
          <p className="text-white/55 max-w-2xl leading-relaxed">Kiriro Motors & Investment Limited combines premium vehicle retail with structured asset-backed financing, built around trust, clarity, and responsive customer service.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/70 border border-black/5 p-8">
          <h2 className="font-editorial text-4xl font-light mb-6">Company History</h2>
          <p className="text-black/60 leading-relaxed mb-6">The business is positioned as more than a traditional dealership: it is a marketplace, financing access point, and lead generation engine for buyers, borrowers, and staff.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timeline.map(([year, text]) => (
              <div key={year} className="border border-black/10 bg-white/50 p-5">
                <p className="text-[10px] uppercase tracking-widest font-bold text-black/45 mb-2">{year}</p>
                <p className="text-sm text-black/65">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black text-white p-8">
          <Building2 className="w-8 h-8 text-luxury-gold mb-8" />
          <h2 className="font-editorial text-3xl font-light mb-5">Mission</h2>
          <p className="text-white/60 leading-relaxed">Make vehicle ownership and asset-backed finance more transparent, professional, and accessible through digital workflows.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target, title: 'Vision', text: 'A trusted Kenyan automotive marketplace with integrated financing.' },
          { icon: ShieldCheck, title: 'Values', text: 'Transparency, professionalism, speed, and responsible lending.' },
          { icon: Award, title: 'Licenses', text: 'Document business credentials and finance approvals before production launch.' },
          { icon: Handshake, title: 'Partners', text: 'Banks, insurers, valuers, inspection providers, and logistics partners.' },
        ].map(item => (
          <div key={item.title} className="bg-white/70 border border-black/5 p-6">
            <item.icon className="w-6 h-6 text-black/45 mb-6" />
            <h3 className="font-editorial text-2xl font-light mb-3">{item.title}</h3>
            <p className="text-sm text-black/55 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
