import { PlayCircle, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../data';

export default function Testimonials() {
  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen">
      <section className="pt-24 pb-16 bg-[#0E0E0E] border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-luxury-gold uppercase tracking-[0.22em] sm:tracking-[0.35em] text-[10px] mb-4 font-bold">Success Stories</p>
          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-light mb-5 leading-tight">Real outcomes, clearly tracked.</h1>
          <p className="text-white/50 max-w-2xl leading-relaxed">Customer stories for vehicle purchases, logbook financing, and land title financing. Video placeholders are ready for production testimonials.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {TESTIMONIALS.map((testimonial, index) => (
          <article key={testimonial.name} className="border border-white/8 bg-white/[0.03] overflow-hidden">
            <div className="aspect-video bg-black/50 relative flex items-center justify-center">
              <img src={`https://images.unsplash.com/photo-${index === 0 ? '1556742049-0cfed4f6a45d' : index === 1 ? '1554224155-6726b3ff858f' : '1560520653-9e0e4c89eb11'}?q=80&w=1800&auto=format&fit=crop`} alt="Customer story" className="absolute inset-0 w-full h-full object-cover opacity-35" />
              <PlayCircle className="relative z-10 w-14 h-14 text-white/75" />
            </div>
            <div className="p-7">
              <Quote className="w-7 h-7 text-luxury-gold mb-5" />
              <p className="text-white/70 leading-relaxed mb-6">"{testimonial.quote}"</p>
              <p className="font-semibold">{testimonial.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{testimonial.role}</p>
              <p className="mt-5 text-[10px] uppercase tracking-widest text-luxury-gold">{testimonial.result}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
