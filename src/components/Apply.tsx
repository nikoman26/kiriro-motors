import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle, FileText, Search, UploadCloud } from 'lucide-react';
import { LoanApplication, LoanProduct } from '../types';
import { calculateAssetLoan } from '../utils/finance';
import { formatKes } from '../utils/format';
import { createApplication, trackApplication as findApplicationByTracking } from '../utils/storage';
import TradeInValuation from './TradeInValuation';

const productLabels: Record<LoanProduct, string> = {
  'vehicle-financing': 'Vehicle Financing',
  logbook: 'Logbook Loan',
  'land-title': 'Land Title Loan',
};

const statusOrder = ['Submitted', 'Under Review', 'Approved', 'Disbursed', 'Rejected'];

function requiredDocuments(type: LoanProduct) {
  if (type === 'land-title') return ['Title Deed', 'National ID', 'KRA PIN', 'Valuation Report', 'Supporting Documents'];
  if (type === 'logbook') return ['National ID', 'KRA PIN', 'Logbook', 'Vehicle Photos', 'Bank Statements', 'Proof of Income'];
  return ['National ID', 'KRA PIN', 'Bank Statements', 'Proof of Income', 'Vehicle Proforma or Selected Vehicle'];
}

export default function Apply() {
  const [type, setType] = useState<LoanProduct>('vehicle-financing');
  const [assetValue, setAssetValue] = useState(3000000);
  const [requestedAmount, setRequestedAmount] = useState(1500000);
  const [duration, setDuration] = useState(12);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [submitted, setSubmitted] = useState<LoanApplication | null>(null);
  const [trackingSearch, setTrackingSearch] = useState('');
  const [trackedApplication, setTrackedApplication] = useState<LoanApplication | null>(null);

  const estimate = useMemo(() => calculateAssetLoan(assetValue, type, requestedAmount, duration), [assetValue, duration, requestedAmount, type]);
  const documents = requiredDocuments(type);

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
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
        vehicleYear: Number(form.get('vehicleYear') ?? 0) || undefined,
        vehicleCondition: String(form.get('vehicleCondition') ?? ''),
        propertyCounty: String(form.get('propertyCounty') ?? ''),
        propertyLocation: String(form.get('propertyLocation') ?? ''),
        propertySize: String(form.get('propertySize') ?? ''),
        propertyType: String(form.get('propertyType') ?? ''),
        ownership: String(form.get('ownership') ?? ''),
        documents: files.map(file => file.name),
        documentFiles: files,
        documentTypes: files.map((_, index) => documents[index] ?? 'Supporting document'),
      });

      setSubmitted(application);
      setTrackingSearch(application.trackingNumber);
      event.currentTarget.reset();
      setFiles([]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Application submission failed.');
    }
  };

  const trackApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = await findApplicationByTracking(trackingSearch);
    setTrackedApplication(found ?? null);
  };

  const activeTracked = trackedApplication ?? submitted;

  return (
    <div className="min-h-screen bg-luxury-cream text-black">
      <section className="bg-[#0E0E0E] text-white pt-24 pb-16 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">Loan Application Portal</p>
          <h1 className="font-editorial text-5xl md:text-6xl font-light mb-5">Apply once. Track clearly.</h1>
          <p className="text-white/50 max-w-2xl leading-relaxed">Choose vehicle financing, logbook financing, or land title financing. Submit details, attach supporting documents, and receive a tracking number for the admin workflow.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        <main className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(productLabels) as LoanProduct[]).map(product => (
              <button
                key={product}
                onClick={() => setType(product)}
                className={`p-5 text-left border transition-colors ${type === product ? 'bg-black text-white border-black' : 'bg-white/60 border-black/10 hover:border-black/40'}`}
              >
                <span className="text-[10px] uppercase tracking-widest font-bold text-current/60">Product</span>
                <span className="block font-editorial text-2xl font-light mt-2">{productLabels[product]}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submitApplication} className="bg-white/70 border border-black/5 p-6 md:p-8">
            <div className="flex items-start justify-between gap-6 mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/45 mb-2">Selected Workflow</p>
                <h2 className="font-editorial text-4xl font-light">{productLabels[type]}</h2>
              </div>
              <FileText className="w-8 h-8 text-black/35" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <input name="name" required placeholder="Full name" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="phone" required placeholder="Phone number" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="email" required type="email" placeholder="Email address" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="idNumber" required placeholder="National ID or passport" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="employment" placeholder="Employment or business type" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
              <input name="income" type="number" placeholder="Monthly income estimate" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <label>
                <span className="block text-[9px] uppercase tracking-widest font-bold text-black/45 mb-2">Asset Value</span>
                <input type="number" value={assetValue} onChange={(event) => setAssetValue(Number(event.target.value))} className="w-full border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
              </label>
              <label>
                <span className="block text-[9px] uppercase tracking-widest font-bold text-black/45 mb-2">Desired Amount</span>
                <input type="number" value={requestedAmount} onChange={(event) => setRequestedAmount(Number(event.target.value))} className="w-full border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
              </label>
              <label>
                <span className="block text-[9px] uppercase tracking-widest font-bold text-black/45 mb-2">Duration: {duration} months</span>
                <input type="range" min={3} max={60} step={3} value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="w-full accent-black mt-4" />
              </label>
            </div>

            {type !== 'land-title' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <input name="vehicleRegistration" placeholder="Vehicle registration" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
                <input name="vehicleYear" type="number" placeholder="Vehicle year" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
                <input name="vehicleCondition" placeholder="Vehicle condition" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
              </div>
            )}

            {type === 'land-title' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <input name="propertyCounty" placeholder="County" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
                <input name="propertyLocation" placeholder="Property location" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
                <input name="propertySize" placeholder="Land size" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
                <input name="propertyType" placeholder="Property type" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black" />
                <input name="ownership" placeholder="Ownership status" className="border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black md:col-span-2" />
              </div>
            )}

            <textarea name="purpose" required rows={4} placeholder="Loan purpose" className="w-full border border-black/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-black mb-8" />

            <div className="border border-dashed border-black/25 bg-white/40 p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <UploadCloud className="w-6 h-6 text-black/45" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-black/45">Document Upload</p>
                  <p className="text-sm text-black/55">PDF, JPEG, PNG, or WebP. Maximum 10 files, 10 MB each.</p>
                </div>
              </div>
              <input type="file" multiple accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setFiles(Array.from(event.currentTarget.files ?? []))} className="w-full text-sm" />
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-2">
                {documents.map(document => (
                  <span key={document} className="text-[10px] uppercase tracking-widest bg-white/70 border border-black/5 px-3 py-2">{document}</span>
                ))}
              </div>
              {files.length > 0 && <p className="mt-4 text-sm text-green-700">{files.length} file(s) attached.</p>}
            </div>
            <label className="flex items-start gap-3 text-sm text-black/60 mb-8">
              <input required type="checkbox" className="mt-1" />
              <span>I confirm these documents are mine to submit and may be reviewed by Kiriro Motors staff for this application.</span>
            </label>

            <button className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-black/80 transition-colors inline-flex items-center justify-center gap-2">
              Submit Application <ArrowRight className="w-4 h-4" />
            </button>

            {uploadError && <p className="mt-5 text-red-700 text-sm">{uploadError}</p>}
            {submitted && (
              <div className="mt-6 bg-green-50 border border-green-100 text-green-800 p-5 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Application submitted.</p>
                  <p className="text-sm mt-1">Tracking number: <strong>{submitted.trackingNumber}</strong></p>
                </div>
              </div>
            )}
          </form>
        </main>

        <aside className="space-y-6">
          <section className="bg-black text-white p-7 sticky top-24">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/45 font-bold mb-3">Estimate</p>
            <h3 className="font-editorial text-3xl font-light mb-6">Qualification Preview</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/45">Max loan</span><span>{formatKes(estimate.maxLoan)}</span></div>
              <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/45">Requested</span><span>{formatKes(requestedAmount)}</span></div>
              <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/45">Monthly estimate</span><span>{formatKes(estimate.monthlyRepayment)}</span></div>
              <div className="flex justify-between"><span className="text-white/45">LTV</span><span>{Math.round(estimate.ltv * 100)}%</span></div>
            </div>
          </section>

          <section className="bg-white/70 border border-black/5 p-7">
            <form onSubmit={trackApplication}>
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/45 font-bold mb-3">Application Dashboard</p>
              <h3 className="font-editorial text-3xl font-light mb-5">Track Status</h3>
              <div className="grid grid-cols-[1fr_auto] gap-2 mb-5">
                <input value={trackingSearch} onChange={(event) => setTrackingSearch(event.target.value)} placeholder="KR-LB-2026-123456" className="border border-black/15 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black" />
                <button aria-label="Track application" className="w-12 bg-black text-white flex items-center justify-center"><Search className="w-4 h-4" /></button>
              </div>
            </form>

            {activeTracked ? (
              <div>
                <p className="text-sm font-semibold mb-4">{activeTracked.trackingNumber}</p>
                <div className="space-y-3">
                  {statusOrder.map(status => (
                    <div key={status} className={`flex items-center gap-3 text-sm ${activeTracked.status === status ? 'text-black font-semibold' : 'text-black/35'}`}>
                      <span className={`w-3 h-3 rounded-full ${activeTracked.status === status ? 'bg-black' : 'bg-black/15'}`} />
                      {status}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-black/55">Submit or search a tracking number to view status.</p>
            )}
          </section>

          <TradeInValuation />
        </aside>
      </div>
    </div>
  );
}
