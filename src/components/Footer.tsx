import { Link } from 'react-router-dom';

/**
 * Global footer with static business links and placeholder contact details.
 *
 * Move contact details to a shared config or backend-managed branch table once
 * the site has production phone, email, location, and legal page content.
 */
export default function Footer() {
  return (
    <footer className="bg-[#050505] text-white/40 mt-auto border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-1">
             <span className="font-editorial text-2xl font-light tracking-tighter text-white mb-6 block capitalize">
                <img src="/logo.svg" alt="Kiriro Motors" className="h-9 w-auto max-w-[190px]" />
             </span>
             <p className="text-white/40 text-[10px] leading-relaxed max-w-xs">
                Bridging premium automotive retail with intelligent asset-backed micro-finance. Trust, efficiency, and security.
             </p>
          </div>
          
          <div>
            <h4 className="font-sans font-bold text-[10px] mb-4 text-white uppercase tracking-[0.2em]">Automotive</h4>
            <ul className="space-y-3">
              <li><Link to="/cars" className="text-white/40 hover:text-luxury-gold transition-colors text-[10px] uppercase tracking-[0.18em]">View Inventory</Link></li>
              <li><Link to="/cars?type=SUV" className="text-white/40 hover:text-luxury-gold transition-colors text-[10px] uppercase tracking-[0.18em]">Premium SUVs</Link></li>
              <li><Link to="/cars?type=Sedan" className="text-white/40 hover:text-luxury-gold transition-colors text-[10px] uppercase tracking-[0.18em]">Luxury Sedans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-bold text-[10px] mb-4 text-white uppercase tracking-[0.2em]">Financial Edge</h4>
            <ul className="space-y-3">
              <li><Link to="/logbook-loans" className="text-white/40 hover:text-luxury-gold transition-colors text-[10px] uppercase tracking-[0.18em]">Logbook Financing</Link></li>
              <li><Link to="/land-title-loans" className="text-white/40 hover:text-luxury-gold transition-colors text-[10px] uppercase tracking-[0.18em]">Land Title Loans</Link></li>
              <li><Link to="/apply" className="text-white/40 hover:text-luxury-gold transition-colors text-[10px] uppercase tracking-[0.18em]">Apply Online</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-sans font-bold text-[10px] mb-4 text-white uppercase tracking-[0.2em]">Contact</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-white/40 hover:text-luxury-gold transition-colors text-[10px] uppercase tracking-[0.18em]">About Us</Link></li>
              <li><Link to="/testimonials" className="text-white/40 hover:text-luxury-gold transition-colors text-[10px] uppercase tracking-[0.18em]">Success Stories</Link></li>
              <li><Link to="/blog" className="text-white/40 hover:text-luxury-gold transition-colors text-[10px] uppercase tracking-[0.18em]">Resources</Link></li>
              <li><Link to="/contact" className="text-white/40 hover:text-luxury-gold transition-colors text-[10px] uppercase tracking-[0.18em]">Contact</Link></li>
              <li className="text-white/40 text-[10px]">Mombasa Road, Nairobi</li>
              <li className="text-white/40 text-[10px]">sales@kiriromotors.co.ke</li>
              <li className="text-white/40 text-[10px]">+254 700 000 000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-white/40">
          <p>&copy; {new Date().getFullYear()} Kiriro Motors &amp; Investment Ltd.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 uppercase tracking-[0.18em]">
            <span className="flex items-center gap-2"><span className="w-1 h-1 bg-green-500 rounded-full"></span>256-Bit SSL</span>
            <Link to="#" className="hover:text-luxury-gold transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-luxury-gold transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
