import { useState, useMemo } from 'react';
import { motion } from 'motion/react';

/**
 * Prototype calculator for logbook and land-title lending estimates.
 *
 * The formula is intentionally simple and should be moved to a tested shared
 * utility once official interest, fee, and repayment policies are confirmed.
 */
export default function Calculator() {
  const [assetType, setAssetType] = useState<'logbook' | 'land'>('logbook');
  const [assetValue, setAssetValue] = useState<number>(3000000);
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [interestRate, setInterestRate] = useState<number>(3.5);

  const maxLtv = assetType === 'logbook' ? 0.7 : 0.5;
  const maxLoanAmount = assetValue * maxLtv;
  
  const formattedMaxLoan = useMemo(() => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(maxLoanAmount);
  }, [maxLoanAmount]);

  // Simple-interest estimate for prototype UX only. Do not treat as an official
  // repayment schedule until finance policy is confirmed and tested.
  const totalRepayment = maxLoanAmount * (1 + ((interestRate / 100) * durationMonths));
  const monthlyRepayment = totalRepayment / durationMonths;

  const formattedMonthly = useMemo(() => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(monthlyRepayment);
  }, [monthlyRepayment]);

  return (
    <div className="bg-white/40 backdrop-blur-md border border-black/5 p-8 md:p-10 shadow-sm relative">
      <div className="flex justify-between items-end mb-8">
        <h3 className="font-editorial text-2xl font-light text-black">Loan Calculator</h3>
      </div>
      
      <div className="space-y-8">
        <div>
          <label className="block text-[9px] uppercase font-bold tracking-widest text-black/50 mb-3">Asset Type</label>
          <div className="flex bg-black/5 p-1 rounded-sm gap-1">
            <button
              onClick={() => { setAssetType('logbook'); setInterestRate(3.5); }}
              className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest transition-all ${
                assetType === 'logbook' ? 'bg-black text-white shadow-sm' : 'text-black/50 hover:text-black'
              }`}
            >
              Logbook
            </button>
            <button
              onClick={() => { setAssetType('land'); setInterestRate(2.5); }}
              className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest transition-all ${
                assetType === 'land' ? 'bg-black text-white shadow-sm' : 'text-black/50 hover:text-black'
              }`}
            >
              Land Title
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="block text-[9px] uppercase font-bold tracking-widest text-black/50">Estimated Value (KES)</label>
            <span className="text-sm font-sans font-bold text-black border-b border-black/20 pb-1">
              {new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(assetValue)}
            </span>
          </div>
          <input
            type="range"
            min={500000}
            max={20000000}
            step={100000}
            value={assetValue}
            onChange={(e) => setAssetValue(Number(e.target.value))}
            className="w-full h-1 bg-black/10 rounded-full appearance-none cursor-pointer accent-black"
          />
        </div>

        <div>
           <div className="flex justify-between items-end mb-3">
            <label className="block text-[9px] uppercase font-bold tracking-widest text-black/50">Interest Rate (% / mo)</label>
            <span className="text-sm font-sans font-bold text-black border-b border-black/20 pb-1">
              {interestRate.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={1.0}
            max={10.0}
            step={0.1}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-1 bg-black/10 rounded-full appearance-none cursor-pointer accent-black"
          />
        </div>

        <div>
           <div className="flex justify-between items-end mb-3">
            <label className="block text-[9px] uppercase font-bold tracking-widest text-black/50">Repayment Duration</label>
            <span className="text-sm font-sans font-bold text-black border-b border-black/20 pb-1">
              {durationMonths} Months
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={36}
            step={3}
            value={durationMonths}
            onChange={(e) => setDurationMonths(Number(e.target.value))}
            className="w-full h-1 bg-black/10 rounded-full appearance-none cursor-pointer accent-black"
          />
        </div>

        <motion.div 
          key={assetType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 p-6 border border-black/5"
        >
          <div className="flex justify-between items-end mb-4">
             <span className="text-[10px] uppercase font-bold tracking-widest text-black/50">Max Loan Capacity</span>
             <span className="text-2xl font-editorial">{formattedMaxLoan}</span>
          </div>
          <div className="h-1 bg-black/10 w-full rounded-full overflow-hidden mb-6">
            <div className="h-full bg-black" style={{ width: `${maxLtv * 100}%` }}></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span className="block text-[9px] uppercase font-bold text-black/40 mb-1 tracking-widest">Monthly</span>
              <span className="font-sans text-sm font-semibold">{formattedMonthly}</span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] uppercase font-bold text-black/40 mb-1 tracking-widest">Total Interest</span>
              <span className="font-sans text-sm font-semibold">{new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(totalRepayment - maxLoanAmount)}</span>
            </div>
          </div>
        </motion.div>

        <button className="w-full bg-black text-white py-5 text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-black/80 transition-colors">
          Pre-Qualify Now
        </button>
      </div>
    </div>
  );
}
