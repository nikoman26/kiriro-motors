import { ChevronRight, Heart, MessageCircle, Scale, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Vehicle } from '../types';
import { calculateVehicleMonthlyPayment } from '../utils/finance';
import { formatKes, formatNumber, formatShortKes } from '../utils/format';
import { whatsappUrl } from '../utils/whatsapp';

interface VehicleCardProps {
  vehicle: Vehicle;
  isSaved?: boolean;
  isCompared?: boolean;
  onToggleSaved?: (id: string) => void;
  onToggleCompare?: (id: string) => void;
}

export default function VehicleCard({ vehicle, isSaved = false, isCompared = false, onToggleSaved, onToggleCompare }: VehicleCardProps) {
  const monthly = calculateVehicleMonthlyPayment(vehicle.price, vehicle.price * 0.2, 48);
  const detailPath = `/cars/${vehicle.slug}`;

  const shareVehicle = async () => {
    const url = `${window.location.origin}${detailPath}`;
    const text = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim ?? ''} - ${formatKes(vehicle.price)}`;

    if (navigator.share) {
      await navigator.share({ title: text, text, url });
      return;
    }

    await navigator.clipboard.writeText(url);
    alert('Vehicle link copied to clipboard.');
  };

  return (
    <article className="bg-[#0E0E0E] border border-white/8 group relative flex flex-col hover:border-luxury-gold/60 transition-colors">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={vehicle.image}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
        <div className="absolute top-4 left-4 glass-panel px-3 py-1 text-[10px] font-bold tracking-widest text-white">
          {vehicle.availability}
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            type="button"
            aria-label={isSaved ? 'Remove from saved vehicles' : 'Save vehicle'}
            onClick={() => onToggleSaved?.(vehicle.id)}
            className={`w-9 h-9 border flex items-center justify-center backdrop-blur-md transition-colors ${
              isSaved ? 'bg-luxury-gold border-luxury-gold text-black' : 'bg-black/30 border-white/20 text-white hover:bg-white hover:text-black'
            }`}
          >
            <Heart className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={isCompared ? 'Remove from comparison' : 'Compare vehicle'}
            onClick={() => onToggleCompare?.(vehicle.id)}
            className={`w-9 h-9 border flex items-center justify-center backdrop-blur-md transition-colors ${
              isCompared ? 'bg-white border-white text-black' : 'bg-black/30 border-white/20 text-white hover:bg-white hover:text-black'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">{vehicle.year} - {vehicle.bodyType}</p>
            <h3 className="font-editorial text-2xl font-light text-white">{vehicle.make}</h3>
            <p className="text-sm text-white/55">{vehicle.model} {vehicle.trim}</p>
          </div>
          <span className="text-luxury-gold font-semibold whitespace-nowrap">{formatShortKes(vehicle.price)}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-[10px] uppercase tracking-widest text-white/45 border-y border-white/8 py-4 mb-5">
          <span>{formatNumber(vehicle.mileage)} km</span>
          <span>{vehicle.fuel}</span>
          <span>{vehicle.transmission}</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs mb-5">
            <span className="text-white/45">Est. monthly from</span>
            <span className="text-white font-semibold">{formatKes(monthly)}</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <Link
              to={detailPath}
              className="bg-white text-black text-center py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-luxury-gold hover:text-black transition-colors inline-flex items-center justify-center gap-2"
            >
              View Details <ChevronRight className="w-4 h-4" />
            </Link>
            <a
              aria-label="Ask about this vehicle on WhatsApp"
              href={whatsappUrl(`Hello Kiriro, I am interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}.`)}
              target="_blank"
              rel="noreferrer"
              className="w-11 border border-white/15 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <button
              type="button"
              aria-label="Share vehicle"
              onClick={shareVehicle}
              className="w-11 border border-white/15 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
