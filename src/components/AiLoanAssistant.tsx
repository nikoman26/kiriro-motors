import { FormEvent, useState } from 'react';
import { Bot, Send } from 'lucide-react';

const answers = [
  {
    keywords: ['logbook', 'vehicle'],
    answer: 'For logbook financing, prepare your original logbook copy, ID, KRA PIN, vehicle photos, proof of income, and recent bank statements.',
  },
  {
    keywords: ['land', 'title', 'property'],
    answer: 'For land title financing, prepare the title deed copy, ID, KRA PIN, valuation report, property location details, and supporting income records.',
  },
  {
    keywords: ['rate', 'interest', 'repayment'],
    answer: 'The calculator provides estimates only. Final repayment terms depend on asset verification, risk review, requested amount, and approved duration.',
  },
  {
    keywords: ['status', 'track', 'tracking'],
    answer: 'Use the application tracker in the Apply portal with your tracking number. The admin workflow supports Submitted, Under Review, Approved, Disbursed, and Rejected.',
  },
];

export default function AiLoanAssistant() {
  const [messages, setMessages] = useState([
    { from: 'assistant', text: 'Ask me about loan requirements, eligibility, repayments, or tracking.' },
  ]);

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const question = String(form.get('question') ?? '').trim();
    if (!question) return;

    const lower = question.toLowerCase();
    const match = answers.find(item => item.keywords.some(keyword => lower.includes(keyword)));
    const response = match?.answer ?? 'For this prototype, I can answer common questions about logbook loans, land title loans, repayments, and application tracking. For anything complex, submit the contact form or WhatsApp Kiriro.';

    setMessages(prev => [...prev, { from: 'user', text: question }, { from: 'assistant', text: response }]);
    event.currentTarget.reset();
  };

  return (
    <section className="bg-[#0E0E0E] border border-white/8 text-white p-6 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 border border-luxury-gold/40 text-luxury-gold flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/40 font-bold">AI Loan Assistant</p>
          <h3 className="font-editorial text-2xl font-light">Quick Finance Help</h3>
        </div>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto mb-5 pr-1">
        {messages.map((message, index) => (
          <div key={index} className={`p-3 text-sm leading-relaxed ${message.from === 'assistant' ? 'bg-white/8 text-white/75' : 'bg-luxury-gold text-black ml-8'}`}>
            {message.text}
          </div>
        ))}
      </div>

      <form onSubmit={submitQuestion} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
        <input name="question" placeholder="Ask about requirements..." className="bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-luxury-gold" />
        <button aria-label="Send question" className="w-full sm:w-12 min-h-12 bg-white text-black flex items-center justify-center hover:bg-luxury-gold transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
}
