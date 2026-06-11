import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { BRANCHES } from '../data';
import { whatsappUrl } from '../utils/whatsapp';
import LeadForm from './LeadForm';

export default function Contact() {
  return (
    <div className="bg-luxury-cream text-black min-h-screen">
      <section className="bg-[#0E0E0E] text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">Contact Hub</p>
          <h1 className="font-editorial text-5xl md:text-6xl font-light mb-5">Talk to sales or finance.</h1>
          <p className="text-white/55 max-w-2xl leading-relaxed">Contact branches, request a callback, open WhatsApp, or submit a message directly into the admin lead inbox.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
        <div className="space-y-6">
          <div className="aspect-[16/9] bg-black relative overflow-hidden">
            <iframe
              title="Kiriro Motors map"
              src="https://www.google.com/maps?q=Nairobi%20Kenya&output=embed"
              className="absolute inset-0 w-full h-full border-0 grayscale"
              loading="lazy"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BRANCHES.map(branch => (
              <article key={branch.name} className="bg-white/70 border border-black/5 p-6">
                <h2 className="font-editorial text-3xl font-light mb-5">{branch.name}</h2>
                <div className="space-y-3 text-sm text-black/60">
                  <p className="flex items-center gap-3"><MapPin className="w-4 h-4" /> {branch.location}</p>
                  <p className="flex items-center gap-3"><Phone className="w-4 h-4" /> {branch.phone}</p>
                  <p className="flex items-center gap-3"><Mail className="w-4 h-4" /> {branch.email}</p>
                  <p className="flex items-center gap-3"><Clock className="w-4 h-4" /> {branch.hours}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <a href={whatsappUrl('Hello Kiriro, I need assistance from sales or finance.')} target="_blank" rel="noreferrer" className="bg-green-700 text-white p-5 flex items-center justify-between hover:bg-green-800 transition-colors">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold">WhatsApp Kiriro</span>
            <MessageCircle className="w-5 h-5" />
          </a>
          <LeadForm type="contact" source="Contact page" title="Send Message" submitLabel="Send Message" />
        </aside>
      </section>
    </div>
  );
}
