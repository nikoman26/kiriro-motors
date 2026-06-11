import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle, FileText, Home, UploadCloud } from 'lucide-react';
import { LoanProduct } from '../types';
import { calculateAssetLoan, isLoanEligible } from '../utils/finance';
import { formatKes } from '../utils/format';
import { createApplication } from '../utils/storage';
import AiLoanAssistant from './AiLoanAssistant';

interface LoanProductPageProps {
  type: Extract<LoanProduct, 'logbook' | 'land-title'>;
}

export default function LoanProductPage({ type }: LoanProductPageProps) {
  const isLand = type === 'land-title';
  const [assetValue, setAssetValue] = useState(isLand ? 8000000 : 2500000);
  const [requestedAmount, setRequestedAmount] = useState(isLand ? 3500000 : 1000000);
  const [duration, setDuration] = useState(isLand ? 24 : 12);
  const [assetYear, setAssetYear] = useState(2020);
  const [ownership, setOwnership] = useState('Owned');
  const [condition, setCondition] = useState('Good');
  const [files, setFiles] = useState<File[]>([]);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [uploadError, setUploadError] = useState('');

  const estimate = useMemo(() => calculateAssetLoan(assetValue, type, requestedAmount, duration), [assetValue, duration, requestedAmount, type]);
  const eligible = isLoanEligible(assetValue, requestedAmount, type) && ownership === 'Owned' && (isLand || assetYear >= 2012);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError('');
    const form = new FormData(event.currentTarget);
    try {
      const application = await createApplication({
        type,
        name: String(form.get('name') ?? ''),
        phone: String(form.get('phone') ?? ''),
        email: String(form.get('email') ?? ''),
        idNumber: String(form.get('idNumber') ?? ''),
        requestedAmount,
        assetValue,
        durationMonths: duration,
        purpose: String(form.get('purpose') ?? ''),
        employment: String(form.get('employment') ?? ''),
        income: Number(form.get('income') ?? 0),
        vehicleRegistration: String(form.get('vehicleRegistration') ?? ''),
        vehicleYear: isLand ? undefined : assetYear,
        vehicleCondition: condition,
        propertyCounty: String(form.get('county') ?? ''),
        propertyLocation: String(form.get('location') ?? ''),
        propertySize: String(form.get('size') ?? ''),
        propertyType: String(form.get('propertyType') ?? ''),
        ownership,
        documents: files.map(file => file.name),
        documentFiles: files,
        documentTypes: files.map((_, index) => documents[index] ?? 'Supporting document'),
      });
      setTrackingNumber(application.trackingNumber);
      event.currentTarget.reset();
      setFiles([]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Application submission failed.');
    }
  };

  const title = isLand ? 'Get Financing Using Your Land Title' : 'Get Cash Using Your Vehicle';
  const subtitle = isLand ? 'Property-backed financing with structured review for larger capital requirements.' : 'Unlock value from your vehicle while keeping your mobility.';
  const heroIcon = isLand ? Home : FileText;
  const documents = isLand
    ? ['Title Deed', 'National ID', 'KRA PIN', 'Valuation Report', 'Supporting Documents']
    : ['National ID', 'KRA PIN', 'Logbook', 'Vehicle Photos', 'Bank Statements', 'Proof of Income'];

  return (
    <div className="bg-luxury-cream text-black min-h-screen">
      <section className="bg-[#0E0E0E] text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-end">
          <div>
            <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">{isLand ? 'Land Title Loans' : 'Logbook Loans'}</p>
            <h1 className="font-editorial text-5xl md:text-6xl font-light mb-5">{title}</h1>
            <p className="text-white/55 max-w-2xl leading-relaxed">{subtitle}</p>
          </div>
          <div className="border border-white/10 bg-white/[0.03] p-7">
            {(() => {
              const Icon = heroIcon;
              return <Icon className="w-8 h-8 text-luxury-gold mb-8" />;
            })()}
            <p className="text-[10px] uppercase tracking-widest text-white/45 mb-2">Instant qualification indicator</p>
            <p className={`text-2xl font-semibold ${eligible ? 'text-green-300' : 'text-red-300'}`}>{eligible ? 'Likely Qualified' : 'Needs Review'}</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        <main className="space-y-8">
          <section className="bg-white/70 border border-black/5 p-7">
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/45 font-bold mb-3">Eligibility Checker</p>
            <h2 className="font-editorial text-4xl font-light mb-8">{isLand ? 'Property Loan Calculator' : 'Vehicle Loan Calculator'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label>
                <span className="block text-[9px] uppercase tracking-widest font-bold text-black/45 mb-2">{isLand ? 'Property Value' : 'Vehicle Value'}</span>
                <input type="number" value={assetValue} onChange={(event) => setAssetValue(Number(event.target.value))} className="w-full border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
              </label>
              <label>
                <span className="block text-[9px] uppercase tracking-widest font-bold text-black/45 mb-2">Desired Amount</span>
                <input type="number" value={requestedAmount} onChange={(event) => setRequestedAmount(Number(event.target.value))} className="w-full border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
              </label>
              {!isLand && (
                <>
                  <label>
                    <span className="block text-[9px] uppercase tracking-widest font-bold text-black/45 mb-2">Vehicle Year</span>
                    <input type="number" value={assetYear} onChange={(event) => setAssetYear(Number(event.target.value))} className="w-full border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
                  </label>
                  <label>
                    <span className="block text-[9px] uppercase tracking-widest font-bold text-black/45 mb-2">Condition</span>
                    <select value={condition} onChange={(event) => setCondition(event.target.value)} className="w-full border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black">
                      <option>Excellent</option>
                      <option>Good</option>
                      <option>Fair</option>
                    </select>
                  </label>
                </>
              )}
              <label>
                <span className="block text-[9px] uppercase tracking-widest font-bold text-black/45 mb-2">Ownership</span>
                <select value={ownership} onChange={(event) => setOwnership(event.target.value)} className="w-full border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black">
                  <option>Owned</option>
                  <option>Joint Ownership</option>
                  <option>Financed</option>
                </select>
              </label>
              <label>
                <span className="block text-[9px] uppercase tracking-widest font-bold text-black/45 mb-2">Term: {duration} months</span>
                <input type="range" min={3} max={60} step={3} value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="w-full accent-black mt-4" />
              </label>
            </div>
          </section>

          <form onSubmit={submit} className="bg-white/70 border border-black/5 p-7">
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/45 font-bold mb-3">Application Form</p>
            <h2 className="font-editorial text-4xl font-light mb-8">Submit Inquiry</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input name="name" required placeholder="Full name" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="phone" required placeholder="Phone number" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="email" required type="email" placeholder="Email" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="idNumber" required placeholder="ID number" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="employment" placeholder="Employment details" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="income" type="number" placeholder="Monthly income" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
              {isLand ? (
                <>
                  <input name="county" placeholder="County" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
                  <input name="location" placeholder="Location" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
                  <input name="size" placeholder="Land size" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
                  <input name="propertyType" placeholder="Property type" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
                </>
              ) : (
                <input name="vehicleRegistration" placeholder="Vehicle registration" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black md:col-span-2" />
              )}
            </div>
            <textarea name="purpose" required rows={4} placeholder="Purpose of financing" className="w-full border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black mb-6" />
            <div className="border border-dashed border-black/25 p-5 mb-6">
              <div className="flex items-center gap-2 mb-4"><UploadCloud className="w-5 h-5 text-black/45" /><span className="text-[10px] uppercase tracking-widest font-bold text-black/45">Documents</span></div>
              <input type="file" multiple accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setFiles(Array.from(event.currentTarget.files ?? []))} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                {documents.map(document => <span key={document} className="bg-white/80 border border-black/5 px-3 py-2 text-[10px] uppercase tracking-widest">{document}</span>)}
              </div>
              {files.length > 0 && <p className="mt-4 text-sm text-green-700">{files.length} file(s) attached.</p>}
            </div>
            <label className="flex items-start gap-3 text-sm text-black/60 mb-6">
              <input required type="checkbox" className="mt-1" />
              <span>I confirm these documents are mine to submit and may be reviewed by Kiriro Motors staff for this application.</span>
            </label>
            <button className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-black/80 transition-colors inline-flex items-center justify-center gap-2">
              Submit {isLand ? 'Land Title' : 'Logbook'} Inquiry <ArrowRight className="w-4 h-4" />
            </button>
            {uploadError && <p className="mt-5 text-red-700 text-sm">{uploadError}</p>}
            {trackingNumber && <p className="mt-5 text-green-700 font-semibold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Tracking number: {trackingNumber}</p>}
          </form>
        </main>

        <aside className="space-y-6">
          <section className="bg-black text-white p-7 sticky top-24">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/45 font-bold mb-3">Loan Calculator</p>
            <h3 className="font-editorial text-3xl font-light mb-6">Estimated Repayment</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/45">Max limit</span><span>{formatKes(estimate.maxLoan)}</span></div>
              <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/45">Approved principal</span><span>{formatKes(estimate.approvedPrincipal)}</span></div>
              <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/45">Monthly estimate</span><span>{formatKes(estimate.monthlyRepayment)}</span></div>
              <div className="flex justify-between"><span className="text-white/45">Total repayment</span><span>{formatKes(estimate.totalRepayment)}</span></div>
            </div>
          </section>
          <AiLoanAssistant />
        </aside>
      </div>
    </div>
  );
}
