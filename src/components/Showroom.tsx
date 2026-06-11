import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, Filter, Grid2X2, List, Scale, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Vehicle } from '../types';
import { getSavedVehicles, getVehicles, toggleSavedVehicle } from '../utils/storage';
import { formatKes, formatNumber } from '../utils/format';
import VehicleCard from './VehicleCard';
import AiVehicleRecommender from './AiVehicleRecommender';

type ViewMode = 'grid' | 'list';

export default function Showroom() {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedVehicles());
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState({
    search: '',
    make: '',
    model: '',
    minYear: '',
    maxPrice: '30000000',
    maxMileage: '100000',
    transmission: '',
    fuel: '',
    bodyType: searchParams.get('type') ?? '',
    color: '',
    condition: '',
    availability: '',
  });

  const options = useMemo(() => {
    const unique = (field: keyof Vehicle) => Array.from(new Set(vehicles.map(vehicle => String(vehicle[field])).filter(Boolean))).sort();
    return {
      makes: unique('make'),
      models: unique('model'),
      transmissions: unique('transmission'),
      fuels: unique('fuel'),
      bodyTypes: unique('bodyType'),
      colors: unique('color'),
      conditions: unique('condition'),
      availability: unique('availability'),
    };
  }, [vehicles]);

  const filteredInventory = useMemo(() => {
    const query = filters.search.toLowerCase();

    return vehicles.filter(vehicle => {
      const text = `${vehicle.make} ${vehicle.model} ${vehicle.trim ?? ''} ${vehicle.year} ${vehicle.color}`.toLowerCase();
      return (
        (!query || text.includes(query)) &&
        (!filters.make || vehicle.make === filters.make) &&
        (!filters.model || vehicle.model === filters.model) &&
        (!filters.minYear || vehicle.year >= Number(filters.minYear)) &&
        vehicle.price <= Number(filters.maxPrice) &&
        vehicle.mileage <= Number(filters.maxMileage) &&
        (!filters.transmission || vehicle.transmission === filters.transmission) &&
        (!filters.fuel || vehicle.fuel === filters.fuel) &&
        (!filters.bodyType || vehicle.bodyType === filters.bodyType) &&
        (!filters.color || vehicle.color === filters.color) &&
        (!filters.condition || vehicle.condition === filters.condition) &&
        (!filters.availability || vehicle.availability === filters.availability)
      );
    });
  }, [filters, vehicles]);

  const comparedVehicles = compareIds.map(id => vehicles.find(vehicle => vehicle.id === id)).filter(Boolean) as Vehicle[];

  const updateFilter = (name: keyof typeof filters, value: string) => {
    setFilters(current => ({ ...current, [name]: value }));
  };

  const toggleSaved = (id: string) => {
    setSavedIds(toggleSavedVehicle(id));
  };

  useEffect(() => {
    let mounted = true;
    getVehicles().then(items => {
      if (mounted) setVehicles(items.filter(vehicle => vehicle.availability !== 'Archived'));
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleCompare = (id: string) => {
    setCompareIds(current => current.includes(id) ? current.filter(item => item !== id) : current.length >= 3 ? [current[1], current[2], id] : [...current, id]);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      make: '',
      model: '',
      minYear: '',
      maxPrice: '30000000',
      maxMileage: '100000',
      transmission: '',
      fuel: '',
      bodyType: '',
      color: '',
      condition: '',
      availability: '',
    });
  };

  const FilterPanel = (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4">
        <input value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search make, model, color..." className="bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-luxury-gold" />
        <select value={filters.make} onChange={(event) => updateFilter('make', event.target.value)} className="bg-[#111] border border-white/10 px-4 py-3 text-sm outline-none focus:border-luxury-gold">
          <option value="">All Makes</option>
          {options.makes.map(option => <option key={option}>{option}</option>)}
        </select>
        <select value={filters.model} onChange={(event) => updateFilter('model', event.target.value)} className="bg-[#111] border border-white/10 px-4 py-3 text-sm outline-none focus:border-luxury-gold">
          <option value="">All Models</option>
          {options.models.map(option => <option key={option}>{option}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-[9px] uppercase font-bold tracking-widest text-white/45 mb-2">Minimum Year</label>
        <input value={filters.minYear} onChange={(event) => updateFilter('minYear', event.target.value)} type="number" min={1990} max={2026} placeholder="e.g. 2020" className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-luxury-gold" />
      </div>

      <div>
        <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest text-white/45 mb-2">
          <span>Max Price</span>
          <span>{formatKes(Number(filters.maxPrice))}</span>
        </div>
        <input type="range" min={1000000} max={30000000} step={500000} value={filters.maxPrice} onChange={(event) => updateFilter('maxPrice', event.target.value)} className="w-full accent-luxury-gold" />
      </div>

      <div>
        <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest text-white/45 mb-2">
          <span>Max Mileage</span>
          <span>{formatNumber(Number(filters.maxMileage))} km</span>
        </div>
        <input type="range" min={0} max={150000} step={5000} value={filters.maxMileage} onChange={(event) => updateFilter('maxMileage', event.target.value)} className="w-full accent-luxury-gold" />
      </div>

      {[
        ['transmission', 'Transmission', options.transmissions],
        ['fuel', 'Fuel Type', options.fuels],
        ['bodyType', 'Body Type', options.bodyTypes],
        ['color', 'Color', options.colors],
        ['condition', 'Condition', options.conditions],
        ['availability', 'Availability', options.availability],
      ].map(([name, label, values]) => (
        <label key={String(name)} className="block">
          <span className="block text-[9px] uppercase font-bold tracking-widest text-white/45 mb-2">{String(label)}</span>
          <select value={filters[name as keyof typeof filters]} onChange={(event) => updateFilter(name as keyof typeof filters, event.target.value)} className="w-full bg-[#111] border border-white/10 px-4 py-3 text-sm outline-none focus:border-luxury-gold">
            <option value="">Any</option>
            {(values as string[]).map(option => <option key={option}>{option}</option>)}
          </select>
        </label>
      ))}

      <button onClick={resetFilters} className="w-full border border-white/15 py-3 text-[10px] uppercase tracking-widest font-bold text-white/70 hover:bg-white hover:text-black transition-colors">
        Clear Filters
      </button>
    </div>
  );

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen">
      <div className="bg-[#0E0E0E] border-b border-white/10 pt-24 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">Vehicle Inventory</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="font-editorial text-5xl font-light mb-4">Cars For Sale</h1>
              <p className="text-white/45 max-w-2xl text-sm leading-relaxed">Advanced search, finance estimates, save lists, comparison, and WhatsApp-ready inquiry paths for serious buyers.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setViewMode('grid')} className={`w-11 h-11 border flex items-center justify-center ${viewMode === 'grid' ? 'bg-white text-black' : 'border-white/15 text-white'}`} aria-label="Grid view"><Grid2X2 className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`w-11 h-11 border flex items-center justify-center ${viewMode === 'list' ? 'bg-white text-black' : 'border-white/15 text-white'}`} aria-label="List view"><List className="w-4 h-4" /></button>
              <button onClick={() => setIsFilterOpen(true)} className="md:hidden w-11 h-11 border border-white/15 flex items-center justify-center" aria-label="Open filters"><Filter className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <aside className="hidden lg:block sticky top-24 h-fit border border-white/8 bg-[#0E0E0E] p-6">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-luxury-gold" />
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">Advanced Filters</h2>
          </div>
          {FilterPanel}
        </aside>

        <main>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <p className="text-[10px] uppercase tracking-widest text-white/45">Showing {filteredInventory.length} of {vehicles.length} vehicles</p>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/45">
              <CheckCircle className="w-4 h-4 text-luxury-gold" /> Saved: {savedIds.length} - Compare: {compareIds.length}/3
            </div>
          </div>

          {comparedVehicles.length > 0 && (
            <section className="border border-luxury-gold/30 bg-[#111] p-5 mb-8 overflow-x-auto">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="font-editorial text-2xl font-light flex items-center gap-2"><Scale className="w-5 h-5 text-luxury-gold" /> Compare Vehicles</h2>
                <button onClick={() => setCompareIds([])} className="text-[10px] uppercase tracking-widest text-white/45 hover:text-white">Clear</button>
              </div>
              <table className="w-full text-sm min-w-[620px]">
                <tbody className="divide-y divide-white/8">
                  {['make', 'price', 'mileage', 'fuel', 'transmission', 'seats', 'availability'].map(field => (
                    <tr key={field}>
                      <th className="text-left py-3 pr-4 text-white/45 uppercase text-[10px] tracking-widest">{field}</th>
                      {comparedVehicles.map(vehicle => (
                        <td key={vehicle.id} className="py-3 pr-4">{field === 'price' ? formatKes(vehicle.price) : field === 'mileage' ? `${formatNumber(vehicle.mileage)} km` : String(vehicle[field as keyof Vehicle])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'grid grid-cols-1 gap-5'}>
            <AnimatePresence>
              {filteredInventory.map(vehicle => (
                <motion.div key={vehicle.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }}>
                  <VehicleCard vehicle={vehicle} isSaved={savedIds.includes(vehicle.id)} isCompared={compareIds.includes(vehicle.id)} onToggleSaved={toggleSaved} onToggleCompare={toggleCompare} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredInventory.length === 0 && (
            <div className="py-24 text-center border border-white/8 bg-white/[0.03]">
              <p className="text-white/50 mb-5 font-editorial text-2xl">No vehicles match your criteria.</p>
              <button onClick={resetFilters} className="text-[10px] uppercase font-bold tracking-widest border-b border-luxury-gold text-luxury-gold pb-1 hover:text-white transition-colors">Clear Filters</button>
            </div>
          )}

          <div className="mt-12">
            <AiVehicleRecommender vehicles={vehicles} />
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="h-full w-[88vw] max-w-sm bg-[#0E0E0E] border-r border-white/10 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-editorial text-2xl font-light">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} aria-label="Close filters" className="w-10 h-10 border border-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              {FilterPanel}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
