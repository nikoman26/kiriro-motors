import { FormEvent, useState } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import { Lead, Vehicle } from '../types';
import { createLead } from '../utils/storage';

interface LeadFormProps {
  title?: string;
  type: Lead['type'];
  source: string;
  vehicle?: Vehicle;
  submitLabel?: string;
}

export default function LeadForm({ title = 'Send Inquiry', type, source, vehicle, submitLabel = 'Submit Inquiry' }: LeadFormProps) {
  const [sent, setSent] = useState(false);

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await createLead({
      type,
      source,
      vehicleId: vehicle?.id,
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? ''),
      message: String(form.get('message') ?? ''),
    });

    event.currentTarget.reset();
    setSent(true);
  };

  return (
    <form onSubmit={submitLead} className="bg-white/60 border border-black/5 p-6 md:p-8 text-black">
      <h3 className="font-editorial text-2xl font-light mb-2">{title}</h3>
      {vehicle && <p className="text-sm text-black/55 mb-6">{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" required placeholder="Full name" className="border border-black/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black" />
        <input name="phone" required placeholder="Phone number" className="border border-black/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black" />
        <input name="email" type="email" placeholder="Email address" className="border border-black/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black md:col-span-2" />
        <textarea name="message" required rows={4} placeholder="Message" defaultValue={vehicle ? `I would like to know more about the ${vehicle.year} ${vehicle.make} ${vehicle.model}.` : ''} className="border border-black/15 bg-white/60 px-4 py-3 text-sm outline-none focus:border-black md:col-span-2" />
      </div>

      <button type="submit" className="mt-5 w-full bg-black text-white py-4 text-[10px] uppercase font-bold tracking-[0.25em] hover:bg-black/80 transition-colors inline-flex items-center justify-center gap-2">
        {submitLabel} <Send className="w-4 h-4" />
      </button>

      {sent && (
        <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 p-3">
          <CheckCircle className="w-4 h-4" />
          Submitted. The admin lead inbox can now view this submission.
        </div>
      )}
    </form>
  );
}
