import { useMemo, useState } from 'react';
import { calculateVehicleMonthlyPayment } from '../utils/finance';
import { formatKes } from '../utils/format';

interface EmiCalculatorProps {
  initialPrice?: number;
  compact?: boolean;
}

export default function EmiCalculator({ initialPrice = 5000000, compact = false }: EmiCalculatorProps) {
  const [price, setPrice] = useState(initialPrice);
  const [deposit, setDeposit] = useState(Math.round(initialPrice * 0.2));
  const [duration, setDuration] = useState(48);
  const [rate, setRate] = useState(16);

  const monthly = useMemo(() => calculateVehicleMonthlyPayment(price, deposit, duration, rate), [price, deposit, duration, rate]);
  const principal = Math.max(price - deposit, 0);

  return (
    <section className={`${compact ? 'p-6' : 'p-8 md:p-10'} bg-white/60 border border-black/5 text-black`}>
      <div className="flex items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/45 mb-2">EMI Calculator</p>
          <h2 className="font-editorial text-3xl font-light">Vehicle Finance Estimate</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-black/45">Monthly</p>
          <p className="text-2xl font-semibold">{formatKes(monthly)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block">
          <span className="block text-[9px] uppercase font-bold tracking-widest text-black/55 mb-2">Car Price</span>
          <input value={price} min={500000} step={100000} type="number" onChange={(event) => setPrice(Number(event.target.value))} className="w-full border border-black/15 bg-white/50 px-4 py-3 text-sm outline-none focus:border-black" />
        </label>
        <label className="block">
          <span className="block text-[9px] uppercase font-bold tracking-widest text-black/55 mb-2">Deposit</span>
          <input value={deposit} min={0} max={price} step={50000} type="number" onChange={(event) => setDeposit(Number(event.target.value))} className="w-full border border-black/15 bg-white/50 px-4 py-3 text-sm outline-none focus:border-black" />
        </label>
        <label className="block">
          <span className="block text-[9px] uppercase font-bold tracking-widest text-black/55 mb-2">Duration: {duration} months</span>
          <input value={duration} min={12} max={72} step={6} type="range" onChange={(event) => setDuration(Number(event.target.value))} className="w-full accent-black" />
        </label>
        <label className="block">
          <span className="block text-[9px] uppercase font-bold tracking-widest text-black/55 mb-2">Annual Rate: {rate}%</span>
          <input value={rate} min={8} max={28} step={0.5} type="range" onChange={(event) => setRate(Number(event.target.value))} className="w-full accent-black" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-black/10 text-sm">
        <div>
          <span className="block text-[9px] uppercase tracking-widest text-black/45 font-bold mb-1">Principal</span>
          <span className="font-semibold">{formatKes(principal)}</span>
        </div>
        <div className="text-right">
          <span className="block text-[9px] uppercase tracking-widest text-black/45 font-bold mb-1">Deposit Ratio</span>
          <span className="font-semibold">{price > 0 ? Math.round((deposit / price) * 100) : 0}%</span>
        </div>
      </div>
    </section>
  );
}
