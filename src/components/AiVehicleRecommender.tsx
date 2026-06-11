import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Vehicle } from '../types';
import { formatKes } from '../utils/format';

interface AiVehicleRecommenderProps {
  vehicles: Vehicle[];
}

export default function AiVehicleRecommender({ vehicles }: AiVehicleRecommenderProps) {
  const [budget, setBudget] = useState(18000000);
  const [familySize, setFamilySize] = useState(5);
  const [usage, setUsage] = useState('executive');
  const [fuel, setFuel] = useState('Any');

  const recommendations = useMemo(() => {
    return vehicles
      .filter(vehicle => vehicle.price <= budget)
      .filter(vehicle => familySize >= 6 ? vehicle.seats >= 6 : true)
      .filter(vehicle => fuel === 'Any' || vehicle.fuel.toLowerCase().includes(fuel.toLowerCase()))
      .map(vehicle => {
        let score = 50;
        if (usage === 'family' && vehicle.bodyType === 'SUV') score += 30;
        if (usage === 'executive' && ['Sedan', 'SUV'].includes(vehicle.bodyType)) score += 20;
        if (usage === 'performance' && vehicle.features.some(feature => /sport|performance|rs|m sport/i.test(feature))) score += 30;
        if (vehicle.featured) score += 10;
        return { vehicle, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [budget, familySize, fuel, usage, vehicles]);

  return (
    <section className="bg-[#101010] border border-white/8 p-6 md:p-8 text-white">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-11 h-11 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-2">AI-Style Recommendation</p>
          <h2 className="font-editorial text-3xl font-light">Find The Best Fit</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <label className="block">
          <span className="block text-[9px] uppercase tracking-widest text-white/45 font-bold mb-2">Budget: {formatKes(budget)}</span>
          <input type="range" min={5000000} max={26000000} step={500000} value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="w-full accent-luxury-gold" />
        </label>
        <label className="block">
          <span className="block text-[9px] uppercase tracking-widest text-white/45 font-bold mb-2">Family Size</span>
          <input type="number" min={1} max={9} value={familySize} onChange={(event) => setFamilySize(Number(event.target.value))} className="w-full bg-white/5 border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold" />
        </label>
        <label className="block">
          <span className="block text-[9px] uppercase tracking-widest text-white/45 font-bold mb-2">Usage</span>
          <select value={usage} onChange={(event) => setUsage(event.target.value)} className="w-full bg-[#151515] border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold">
            <option value="executive">Executive</option>
            <option value="family">Family</option>
            <option value="performance">Performance</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-[9px] uppercase tracking-widest text-white/45 font-bold mb-2">Fuel</span>
          <select value={fuel} onChange={(event) => setFuel(event.target.value)} className="w-full bg-[#151515] border border-white/10 px-3 py-3 text-sm outline-none focus:border-luxury-gold">
            <option>Any</option>
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Electric</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map(({ vehicle, score }) => (
          <div key={vehicle.id} className="border border-white/8 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-widest text-luxury-gold mb-2">Match score {score}%</p>
            <h3 className="font-editorial text-xl font-light">{vehicle.make} {vehicle.model}</h3>
            <p className="text-xs text-white/45 mt-2">{vehicle.seats} seats - {vehicle.fuel} - {formatKes(vehicle.price)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
