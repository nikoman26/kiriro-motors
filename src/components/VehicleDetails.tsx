import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CalendarCheck, Download, Eye, Maximize2, MessageCircle, PlayCircle, ShieldCheck, X, ZoomIn } from 'lucide-react';
import { Vehicle } from '../types';
import { calculateVehicleMonthlyPayment } from '../utils/finance';
import { formatKes, formatNumber } from '../utils/format';
import { createLead, getVehicleBySlug } from '../utils/storage';
import { whatsappUrl } from '../utils/whatsapp';
import EmiCalculator from './EmiCalculator';
import LeadForm from './LeadForm';

export default function VehicleDetails() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const lookup = slug ?? id;
  const [car, setCar] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [scheduleSent, setScheduleSent] = useState(false);

  useEffect(() => {
    if (!lookup) return;
    let mounted = true;
    setIsLoading(true);
    getVehicleBySlug(lookup).then(vehicle => {
      if (!mounted) return;
      setCar(vehicle);
      setSelectedImage(vehicle?.gallery[0] ?? vehicle?.image ?? '');
      setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [lookup]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <p className="text-[10px] uppercase tracking-[0.22em] sm:tracking-[0.35em] text-white/45 font-bold">Loading vehicle</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <h2 className="font-editorial text-3xl mb-4">Vehicle Not Found</h2>
          <button onClick={() => navigate('/cars')} className="text-[10px] uppercase font-bold tracking-widest border-b border-luxury-gold text-luxury-gold pb-1 hover:text-white transition-colors">
            Return to Cars
          </button>
        </div>
      </div>
    );
  }

  const monthly = calculateVehicleMonthlyPayment(car.price, car.price * 0.2, 48);

  const submitViewing = async (event: FormEvent<HTMLFormElement>, type: 'viewing' | 'reservation') => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await createLead({
      type,
      source: type === 'reservation' ? 'Vehicle reservation' : 'Schedule viewing',
      vehicleId: car.id,
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? ''),
      message: `${type === 'reservation' ? 'Reservation request' : 'Viewing request'} for ${form.get('date')} at ${form.get('time')}.`,
    });
    event.currentTarget.reset();
    setScheduleSent(true);
  };

  const reserveVehicle = async () => {
    await createLead({
      type: 'reservation',
      source: 'Vehicle reservation',
      vehicleId: car.id,
      name: 'Reservation request',
      phone: 'N/A',
      message: `Reservation requested for ${car.year} ${car.make} ${car.model}.`,
    });
    setScheduleSent(true);
  };

  const generateBrochure = async () => {
    const brochure = window.open('', '_blank', 'width=900,height=1100');
    if (!brochure) return;

    brochure.document.write(`
      <html>
        <head>
          <title>${car.year} ${car.make} ${car.model} Brochure</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
            img { width: 100%; max-height: 420px; object-fit: cover; }
            h1 { font-family: Georgia, serif; font-weight: 400; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <img src="${car.image}" alt="${car.make} ${car.model}" />
          <h1>${car.year} ${car.make} ${car.model} ${car.trim ?? ''}</h1>
          <p>${car.description}</p>
          <table>
            <tr><td>Price</td><td>${formatKes(car.price)}</td></tr>
            <tr><td>Mileage</td><td>${formatNumber(car.mileage)} km</td></tr>
            <tr><td>Fuel</td><td>${car.fuel}</td></tr>
            <tr><td>Transmission</td><td>${car.transmission}</td></tr>
            <tr><td>Engine</td><td>${car.engine}</td></tr>
            <tr><td>Location</td><td>${car.location}</td></tr>
          </table>
          <p>Generated from Kiriro Motors & Investment Limited. Use your browser print dialog to save as PDF.</p>
          <script>window.print()</script>
        </body>
      </html>
    `);
    brochure.document.close();

    await createLead({
      type: 'brochure',
      source: 'Vehicle brochure generator',
      vehicleId: car.id,
      name: 'Brochure download',
      phone: 'N/A',
      message: `Generated brochure for ${car.year} ${car.make} ${car.model}.`,
    });
  };

  const specs: Array<[string, string | number]> = [
    ['Engine', car.engine],
    ['Fuel', car.fuel],
    ['Transmission', car.transmission],
    ['Seats', car.seats],
    ['Mileage', `${formatNumber(car.mileage)} km`],
    ['Drive Type', car.driveType],
    ['Color', car.color],
    ['Year', car.year],
    ['VIN', car.vin],
    ['Condition', car.condition],
  ];

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen pb-24">
      <section className="relative min-h-[72vh] w-full overflow-hidden">
        <motion.img
          key={selectedImage}
          initial={{ opacity: 0.2, scale: 1.04 }}
          animate={{ opacity: 0.78, scale: 1 }}
          transition={{ duration: 0.6 }}
          src={selectedImage}
          alt={`${car.make} ${car.model}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/45 to-black/45" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 min-h-[72vh] flex flex-col justify-between">
          <button onClick={() => navigate('/cars')} className="w-fit flex items-center gap-2 glass-panel text-white px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Cars
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-end">
            <div>
              <p className="text-[10px] font-bold tracking-[0.22em] sm:tracking-[0.35em] text-luxury-gold uppercase mb-3">{car.year} - {car.bodyType} - {car.location}</p>
              <h1 className="font-editorial text-4xl sm:text-5xl md:text-7xl font-light leading-tight md:leading-none mb-4 break-words">{car.make}</h1>
              <p className="text-2xl text-white/65 mb-6">{car.model} {car.trim}</p>
              <div className="flex flex-wrap gap-3">
                {car.gallery.map(image => (
                  <button key={image} onClick={() => setSelectedImage(image)} className={`w-20 h-14 border overflow-hidden ${selectedImage === image ? 'border-luxury-gold' : 'border-white/20'}`}>
                    <img src={image} alt="Vehicle thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0E0E0E]/90 backdrop-blur-md border border-white/10 p-7">
              <div className="flex justify-between items-start gap-4 mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/45 mb-2">Vehicle Overview</p>
                  <p className="text-4xl font-light">{formatKes(car.price)}</p>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-luxury-gold border border-luxury-gold px-2 py-1">{car.availability}</span>
              </div>
              <p className="text-sm text-white/55 leading-relaxed mb-6">{car.description}</p>
              <div className="grid grid-cols-2 gap-4 text-xs text-white/55 border-y border-white/8 py-5 mb-6">
                <span>{formatNumber(car.mileage)} km</span>
                <span>{car.fuel}</span>
                <span>{car.transmission}</span>
                <span>{car.negotiable ? 'Negotiable' : 'Fixed price'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a href={whatsappUrl(`Hello Kiriro, I want to ask about the ${car.year} ${car.make} ${car.model}.`)} target="_blank" rel="noreferrer" className="bg-white text-black py-4 text-[10px] uppercase tracking-widest font-bold text-center hover:bg-luxury-gold transition-colors inline-flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <button onClick={generateBrochure} className="border border-white/20 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-colors inline-flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Brochure
                </button>
              </div>
              <p className="mt-5 text-xs text-white/45">Estimated monthly from {formatKes(monthly)} with 20% deposit over 48 months.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <main className="lg:col-span-8 space-y-10">
          <section className="bg-[#0E0E0E] border border-white/8 p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <h2 className="font-editorial text-3xl font-light">Specifications</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowFullscreen(true)} className="border border-white/15 px-4 py-3 text-[10px] uppercase tracking-widest font-bold inline-flex items-center gap-2 hover:bg-white hover:text-black transition-colors"><Maximize2 className="w-4 h-4" /> Fullscreen</button>
                <button onClick={() => setShowVirtualTour(true)} className="border border-white/15 px-4 py-3 text-[10px] uppercase tracking-widest font-bold inline-flex items-center gap-2 hover:bg-white hover:text-black transition-colors"><Eye className="w-4 h-4" /> 360 View</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/8">
              {specs.map(([label, value]) => (
                <div key={label} className="bg-[#0E0E0E] p-5">
                  <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-2">{label}</p>
                  <p className="text-white">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#0E0E0E] border border-white/8 p-8">
            <h2 className="font-editorial text-3xl font-light mb-8">Features & Extras</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {car.features.map(feature => (
                <li key={feature} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="mt-2 w-1.5 h-1.5 bg-luxury-gold rounded-full shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          <EmiCalculator initialPrice={car.price} />

          <LeadForm type="vehicle-inquiry" source="Vehicle detail page" vehicle={car} title="Ask About This Vehicle" />
        </main>

        <aside className="lg:col-span-4 space-y-6">
          <form onSubmit={(event) => submitViewing(event, 'viewing')} className="bg-luxury-cream text-black border border-black/5 p-7 lg:sticky lg:top-24">
            <CalendarCheck className="w-7 h-7 text-black/55 mb-5" />
            <h3 className="font-editorial text-3xl font-light mb-2">Schedule Viewing</h3>
            <p className="text-sm text-black/55 mb-6">Pick a date and time for showroom viewing or an assisted video call.</p>
            <div className="space-y-3">
              <input name="name" required placeholder="Full name" className="w-full border border-black/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="phone" required placeholder="Phone number" className="w-full border border-black/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="email" type="email" placeholder="Email" className="w-full border border-black/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="date" required type="date" className="w-full border border-black/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="time" required type="time" className="w-full border border-black/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-5">
              <button type="submit" className="bg-black text-white py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-black/80 transition-colors">Book Viewing</button>
              <button type="button" onClick={reserveVehicle} className="border border-black/20 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-colors">Reserve</button>
            </div>
            {scheduleSent && <p className="mt-4 text-sm text-green-700">Request saved to the admin lead inbox.</p>}
            <div className="mt-8 pt-6 border-t border-black/10 flex items-start gap-4">
              <ShieldCheck className="w-5 h-5 text-black/45 shrink-0" />
              <p className="text-[10px] uppercase tracking-widest text-black/50 leading-relaxed">Vehicle records, inquiries, and viewing requests are tracked locally in this MVP.</p>
            </div>
          </form>
        </aside>
      </div>

      {(showVirtualTour || showFullscreen) && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button onClick={() => { setShowVirtualTour(false); setShowFullscreen(false); }} aria-label="Close viewer" className="absolute top-5 right-5 w-11 h-11 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="relative max-w-6xl w-full">
            <img src={selectedImage} alt={`${car.make} ${car.model}`} className="w-full max-h-[82vh] object-contain" />
            {showVirtualTour && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-20 h-20 rounded-full border border-white/25 bg-black/30 backdrop-blur-md flex items-center justify-center mb-4">
                  <PlayCircle className="w-9 h-9 text-white" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.22em] sm:tracking-[0.35em] text-white/70 font-bold text-center">Simulated 360 viewer</span>
              </div>
            )}
            {showFullscreen && (
              <div className="absolute bottom-5 left-5 glass-panel px-4 py-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                <ZoomIn className="w-4 h-4" /> Fullscreen Gallery
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
