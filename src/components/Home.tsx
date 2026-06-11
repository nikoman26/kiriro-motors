import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, BadgeCheck, Car, Clock, FileText, Home as HomeIcon, LockKeyhole, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { LOAN_PROCESS, TESTIMONIALS } from '../data';
import { Vehicle } from '../types';
import { getVehicles } from '../utils/storage';
import { whatsappUrl } from '../utils/whatsapp';
import VehicleCard from './VehicleCard';
import EmiCalculator from './EmiCalculator';
import AiVehicleRecommender from './AiVehicleRecommender';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=2664&auto=format&fit=crop',
    label: 'Vehicle Sales',
  },
  {
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2670&auto=format&fit=crop',
    label: 'Asset Financing',
  },
  {
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2670&auto=format&fit=crop',
    label: 'Premium Inventory',
  },
];

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const featuredCars = vehicles.filter(vehicle => vehicle.featured && vehicle.availability !== 'Sold').slice(0, 3);
  const latestCars = [...vehicles].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 3);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide(current => (current + 1) % heroSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    getVehicles().then(items => {
      if (mounted) setVehicles(items.filter(vehicle => vehicle.availability !== 'Archived'));
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <section className="relative min-h-[86vh] flex items-center overflow-hidden bg-[#0E0E0E]">
        {heroSlides.map((slide, index) => (
          <motion.img
            key={slide.image}
            src={slide.image}
            alt={slide.label}
            initial={false}
            animate={{ opacity: activeSlide === index ? 0.38 : 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover grayscale"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent" />

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-24">
          <div className="max-w-3xl">
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-luxury-gold uppercase tracking-[0.22em] sm:tracking-[0.35em] text-[10px] mb-5 font-bold">
              Buy Cars. Get Financing. Unlock Value.
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-editorial text-4xl sm:text-5xl md:text-7xl font-light text-white mb-6 leading-tight md:leading-none">
              Drive Your Dream Car Today
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base md:text-lg text-white/65 max-w-2xl mb-10 leading-relaxed">
              Quality vehicles, logbook loans, land title financing, and fast professional review in one digital-first automotive platform.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3">
              <Link to="/cars" className="bg-white text-black px-8 py-4 text-[10px] uppercase font-bold tracking-widest hover:bg-luxury-gold transition-colors text-center">
                Browse Cars
              </Link>
              <Link to="/apply" className="border border-white/20 text-white px-8 py-4 text-[10px] uppercase font-bold tracking-widest hover:border-luxury-gold hover:text-luxury-gold transition-colors text-center">
                Apply for Loan
              </Link>
              <a href={whatsappUrl('Hello Kiriro, I would like help with vehicle sales or financing.')} target="_blank" rel="noreferrer" className="border border-white/20 text-white px-8 py-4 text-[10px] uppercase font-bold tracking-widest hover:bg-white hover:text-black transition-colors text-center inline-flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> WhatsApp Us
              </a>
            </motion.div>
          </div>

          <div className="mt-16 flex gap-2">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.label}
                type="button"
                aria-label={`Show ${slide.label}`}
                onClick={() => setActiveSlide(index)}
                className={`h-1 transition-all ${activeSlide === index ? 'w-16 bg-luxury-gold' : 'w-8 bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0E0E0E] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            { icon: Car, title: 'Vehicle Sales', text: 'Curated premium inventory with transparent specs, financing estimates, and WhatsApp conversion.' },
            { icon: FileText, title: 'Logbook Loans', text: 'Vehicle-backed loan applications with eligibility checks, document capture, and tracking IDs.' },
            { icon: HomeIcon, title: 'Land Title Loans', text: 'Property-backed financing inquiries with structured asset details and document workflow.' },
          ].map((service) => (
            <Link key={service.title} to={service.title === 'Vehicle Sales' ? '/cars' : service.title === 'Logbook Loans' ? '/logbook-loans' : '/land-title-loans'} className="border border-white/8 bg-white/[0.03] p-7 hover:border-luxury-gold/60 transition-colors group">
              <service.icon className="w-7 h-7 text-luxury-gold mb-8" />
              <h3 className="font-editorial text-2xl font-light text-white mb-3">{service.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed mb-5">{service.text}</p>
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/55 group-hover:text-luxury-gold inline-flex items-center gap-2">Open Flow <ArrowRight className="w-4 h-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-24 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-white/10 pb-8 mb-10">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mb-2">Featured Vehicles</p>
              <h2 className="font-editorial text-4xl font-light text-white">Marketplace Highlights</h2>
            </div>
            <Link to="/cars" className="text-[10px] uppercase tracking-widest font-bold text-luxury-gold hover:text-white transition-colors inline-flex items-center gap-2">
              View All Inventory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {featuredCars.map(vehicle => (
              <div key={vehicle.id}>
                <VehicleCard vehicle={vehicle} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-luxury-cream py-24 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <EmiCalculator initialPrice={featuredCars[0]?.price ?? 6000000} />
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] sm:tracking-[0.35em] font-bold text-black/45 mb-4">Why Choose Kiriro</p>
              <h2 className="font-editorial text-4xl sm:text-5xl font-light leading-tight mb-6">Built for trust, speed, and serious buyers.</h2>
              <p className="text-black/60 leading-relaxed">The platform brings vehicle discovery, financing estimates, lead capture, application tracking, and staff management into one operational experience.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: BadgeCheck, label: 'Verified Vehicles' },
                { icon: Sparkles, label: 'Flexible Financing' },
                { icon: Clock, label: 'Fast Review' },
                { icon: ShieldCheck, label: 'Nationwide Service' },
                { icon: LockKeyhole, label: 'Secure Transactions' },
              ].map((item) => (
                <div key={item.label} className="bg-white/55 border border-black/5 p-5 flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-black/60" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <AiVehicleRecommender vehicles={vehicles} />
          <div className="bg-[#101010] border border-white/8 p-8 text-white">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-3">Loan Process</p>
            <h2 className="font-editorial text-4xl font-light mb-8">From inquiry to decision.</h2>
            <div className="space-y-4">
              {LOAN_PROCESS.map((step, index) => (
                <div key={step} className="flex gap-4 items-start">
                  <span className="w-9 h-9 shrink-0 border border-luxury-gold/50 text-luxury-gold flex items-center justify-center text-xs font-bold">{index + 1}</span>
                  <p className="text-white/65 text-sm pt-2">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0E0E0E] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-2">Latest Arrivals</p>
              <h2 className="font-editorial text-4xl font-light text-white">Fresh Inventory</h2>
            </div>
            <Link to="/testimonials" className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">Read Success Stories</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
            {latestCars.map(vehicle => (
              <div key={vehicle.id}>
                <VehicleCard vehicle={vehicle} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {TESTIMONIALS.map(testimonial => (
              <blockquote key={testimonial.name} className="border border-white/8 bg-white/[0.03] p-6">
                <p className="text-white/65 text-sm leading-relaxed mb-6">"{testimonial.quote}"</p>
                <footer>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-luxury-gold mt-1">{testimonial.result}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-luxury-cream text-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/45 font-bold mb-3">Need Quick Financing?</p>
            <h2 className="font-editorial text-4xl sm:text-5xl font-light leading-tight">Get reviewed by the finance team.</h2>
          </div>
          <Link to="/apply" className="bg-black text-white px-9 py-5 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-black/80 transition-colors inline-flex items-center justify-center gap-2">
            Apply Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
