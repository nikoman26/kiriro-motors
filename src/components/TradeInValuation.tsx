import { FormEvent, useState } from 'react';
import { Camera, CheckCircle } from 'lucide-react';
import { formatKes } from '../utils/format';
import { createLead } from '../utils/storage';

export default function TradeInValuation() {
  const [estimate, setEstimate] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const year = Number(form.get('year') ?? new Date().getFullYear());
    const mileage = Number(form.get('mileage') ?? 0);
    const askingValue = Number(form.get('askingValue') ?? 0);
    const ageFactor = Math.max(0.45, 1 - (new Date().getFullYear() - year) * 0.045);
    const mileageFactor = Math.max(0.55, 1 - mileage / 260000);
    const valuation = Math.round((askingValue || 1500000) * ageFactor * mileageFactor);

    setEstimate(valuation);
    await createLead({
      type: 'trade-in',
      source: 'Trade-in valuation',
      name: String(form.get('name') ?? 'Trade-in user'),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? ''),
      message: `Trade-in request: ${form.get('make')} ${form.get('model')} ${year}, mileage ${mileage}. Estimated range around ${formatKes(valuation)}. Photos: ${photos.join(', ') || 'none'}.`,
    });
  };

  return (
    <section className="bg-white/70 border border-black/5 p-7">
      <div className="flex items-center gap-3 mb-5">
        <Camera className="w-6 h-6 text-black/45" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/45 font-bold">Trade-In Valuation</p>
          <h3 className="font-editorial text-3xl font-light">Estimate Your Current Car</h3>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input name="name" required placeholder="Full name" className="w-full border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
        <input name="phone" required placeholder="Phone number" className="w-full border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
        <input name="email" type="email" placeholder="Email" className="w-full border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
        <div className="grid grid-cols-2 gap-3">
          <input name="make" required placeholder="Make" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
          <input name="model" required placeholder="Model" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
          <input name="year" required type="number" placeholder="Year" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
          <input name="mileage" required type="number" placeholder="Mileage" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
        </div>
        <input name="askingValue" type="number" placeholder="Your expected value" className="w-full border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
        <input type="file" multiple accept="image/*" onChange={(event) => setPhotos(Array.from(event.currentTarget.files ?? []).map((file: File) => file.name))} className="w-full text-sm" />
        <button className="w-full bg-black text-white py-4 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-black/80 transition-colors">Get Estimate</button>
      </form>
      {estimate && (
        <div className="mt-5 bg-green-50 border border-green-100 text-green-800 p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Indicative trade-in estimate: <strong>{formatKes(estimate)}</strong>. A staff lead was created for follow-up.</p>
        </div>
      )}
    </section>
  );
}
