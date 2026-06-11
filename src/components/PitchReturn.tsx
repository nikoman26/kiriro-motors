import { ArrowLeft, Presentation } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function PitchReturn() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fromPitch = params.get('from') === 'pitch';

  if (!fromPitch || location.pathname === '/pitch') return null;

  return (
    <Link
      to="/pitch"
      className="fixed bottom-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 bg-white text-black border border-black/10 px-4 py-3 text-[10px] uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2 shadow-2xl hover:bg-luxury-gold transition-colors sm:left-4 sm:w-auto sm:translate-x-0"
    >
      <ArrowLeft className="w-4 h-4" />
      <Presentation className="w-4 h-4" />
      Back to Pitch
    </Link>
  );
}
