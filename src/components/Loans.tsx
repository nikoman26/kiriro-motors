import { Link } from 'react-router-dom';
import { ArrowRight, Car, FileText, Home as HomeIcon } from 'lucide-react';
import { LOAN_TIERS } from '../data';
import AiLoanAssistant from './AiLoanAssistant';
import EmiCalculator from './EmiCalculator';

export default function Loans() {
  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen">
      <section className="bg-[#0E0E0E] pt-24 pb-16 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">Financial Services</p>
          <h1 className="font-editorial text-5xl md:text-6xl font-light mb-5">Capital for vehicles, logbooks, and land titles.</h1>
          <p className="text-white/50 max-w-2xl leading-relaxed">Choose a dedicated financing path, estimate repayments, submit documents, and track application status through the unified apply portal.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {[
            { icon: Car, title: 'Vehicle Financing', text: 'Finance selected inventory with deposit and monthly repayment estimates.', path: '/apply' },
            { icon: FileText, title: 'Logbook Loans', text: LOAN_TIERS[0].description, path: '/logbook-loans' },
            { icon: HomeIcon, title: 'Land Title Loans', text: LOAN_TIERS[1].description, path: '/land-title-loans' },
          ].map(item => (
            <Link key={item.title} to={item.path} className="border border-white/8 bg-white/[0.03] p-7 hover:border-luxury-gold/60 transition-colors group">
              <item.icon className="w-7 h-7 text-luxury-gold mb-8" />
              <h2 className="font-editorial text-3xl font-light mb-4">{item.title}</h2>
              <p className="text-sm text-white/50 leading-relaxed mb-8">{item.text}</p>
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/55 group-hover:text-luxury-gold inline-flex items-center gap-2">Start Flow <ArrowRight className="w-4 h-4" /></span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EmiCalculator initialPrice={8000000} />
          <AiLoanAssistant />
        </div>
      </section>
    </div>
  );
}
