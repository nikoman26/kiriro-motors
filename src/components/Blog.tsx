import { ArrowRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BLOG_POSTS } from '../data';
import { readableDate } from '../utils/format';

export default function Blog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const categories = Array.from(new Set(BLOG_POSTS.map(post => post.category)));
  const posts = useMemo(() => BLOG_POSTS.filter(post => {
    const text = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (!category || post.category === category);
  }), [category, query]);

  return (
    <div className="bg-luxury-cream min-h-screen text-black">
      <section className="bg-[#0E0E0E] text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-luxury-gold uppercase tracking-[0.35em] text-[10px] mb-4 font-bold">Blog & Resources</p>
          <h1 className="font-editorial text-5xl md:text-6xl font-light mb-5">Guides that bring buyers in.</h1>
          <p className="text-white/55 max-w-2xl leading-relaxed">SEO-focused education for car buying, vehicle financing, logbook loans, property-backed finance, and automotive decisions.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/70 border border-black/5 p-5 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search buying, financing, logbook, property..." className="w-full border border-black/10 bg-white/80 pl-11 pr-4 py-3 text-sm outline-none focus:border-black" />
          </div>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:border-black">
            <option value="">All Categories</option>
            {categories.map(item => <option key={item}>{item}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map(post => (
            <article key={post.slug} className="bg-white/70 border border-black/5 p-7 hover:border-black/30 transition-colors">
              <p className="text-[10px] uppercase tracking-widest text-black/45 font-bold mb-4">{post.category} - {readableDate(post.date)} - {post.readTime}</p>
              <h2 className="font-editorial text-3xl font-light mb-4">{post.title}</h2>
              <p className="text-sm text-black/60 leading-relaxed mb-8">{post.excerpt}</p>
              <button className="text-[10px] uppercase tracking-widest font-bold inline-flex items-center gap-2 border-b border-black pb-1">Read Resource <ArrowRight className="w-4 h-4" /></button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
