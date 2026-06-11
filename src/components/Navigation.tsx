import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { whatsappUrl } from '../utils/whatsapp';

/**
 * Global responsive navigation.
 *
 * The current nav is intentionally small because only showroom and loan pages
 * exist. Add links here as new public and admin routes become real.
 */
export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'Cars', path: '/cars' },
    { name: 'Logbook', path: '/logbook-loans' },
    { name: 'Land Title', path: '/land-title-loans' },
    { name: 'Apply', path: '/apply' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="Kiriro Motors" className="h-8 w-auto max-w-[168px]" />
            </Link>
            <div className="hidden md:block h-4 w-px bg-white/20 mx-4"></div>
            <div className="hidden md:block text-[10px] uppercase tracking-[0.2em] text-white/50">Limited</div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center space-x-7">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="relative text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70 hover:text-luxury-gold transition-colors"
              >
                {link.name}
                {location.pathname.startsWith(link.path) && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 right-0 h-px bg-luxury-gold -bottom-2"
                  />
                )}
              </Link>
            ))}
            <Link
              to="/admin"
              className="border border-white/20 px-5 py-2 text-[10px] uppercase font-bold tracking-widest text-white hover:bg-white hover:text-black transition-all"
            >
              Admin
            </Link>
            <a href={whatsappUrl('Hello Kiriro, I need assistance.')} target="_blank" rel="noreferrer" className="w-9 h-9 border border-white/20 text-white hover:bg-white hover:text-black transition-all flex items-center justify-center" aria-label="WhatsApp Kiriro">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:hidden bg-[#0A0A0A] border-t border-white/10 px-4 pt-2 pb-4 space-y-1 shadow-lg"
        >
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 text-[10px] uppercase font-bold tracking-widest text-white/60 hover:text-luxury-gold hover:bg-white/5"
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/admin"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center mt-4 border border-white/20 px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-white hover:bg-white hover:text-black transition-colors"
          >
            Admin CMS
          </Link>
        </motion.div>
      )}
    </nav>
  );
}
