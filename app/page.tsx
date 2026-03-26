"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/app/lib/supabase";
import BookCard from "@/components/BookCard";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: booksData } = await supabase.from("books").select("*").order("created_at", { ascending: false });
      const { data: bannerData } = await supabase.from("banners").select("*").order("priority", { ascending: true });
      const { data: campaignData } = await supabase.from("campaigns").select("*").eq("is_active", true).limit(1).single();

      setAllBooks(booksData || []);
      setFilteredBooks(booksData || []);
      setBanners(bannerData || []);
      setCampaign(campaignData || null);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  const categories = ["All", ...new Set(allBooks.map((b) => b.category).filter(Boolean))] as string[];

  const applyFilters = useCallback((query: string, category: string) => {
    let baseResults = [...allBooks];
    if (category !== "All") baseResults = baseResults.filter(book => book.category === category);
    if (!query.trim()) { setFilteredBooks(baseResults); return; }
    
    const q = query.toLowerCase();
    const results = baseResults
      .map(book => ({
        ...book,
        priority: book.title?.toLowerCase().includes(q) ? 4 : book.author?.toLowerCase().includes(q) ? 3 : 0
      }))
      .filter(book => book.priority > 0)
      .sort((a, b) => b.priority - a.priority);
    setFilteredBooks(results);
  }, [allBooks]);

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0a] text-stone-400">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="font-serif italic text-2xl tracking-widest text-amber-200/50"
      >
        KARUNA
      </motion.div>
    </div>
  );

  const bestSellers = allBooks.filter(b => b.is_bestseller);
  const collections = [...new Set(filteredBooks.map((b) => b.collection_name))].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-[#faf9f6] text-stone-900 selection:bg-amber-200">
      
      {/* 🎭 PREMIUM HERO SECTION */}
      <section ref={heroRef} className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden bg-stone-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            style={{ y: y1 }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {banners[currentSlide] && (
              <img 
                src={banners[currentSlide].image_url} 
                alt=""
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#faf9f6]" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 flex flex-col items-center justify-center h-full px-6 text-center">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="w-full max-w-5xl"
          >
            <span className="inline-block text-amber-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] mb-4">
              Est. 1998 — The Curated Library
            </span>
            <h1 className="font-serif text-5xl md:text-9xl text-white mb-8 leading-tight drop-shadow-sm">
              Karuna <span className="italic font-light opacity-80 text-amber-100">Books</span>
            </h1>
            
            <div className="max-w-2xl mx-auto relative group">
              <motion.div 
                whileFocus-within={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 p-1 shadow-2xl"
              >
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); applyFilters(e.target.value, selectedCategory); }}
                  placeholder="Find your next masterpiece..." 
                  className="w-full bg-transparent py-4 md:py-6 px-10 rounded-full text-white placeholder:text-stone-400 focus:outline-none text-lg transition-all"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-amber-400 p-3 md:p-4 rounded-full hover:bg-amber-300 transition-colors">
                  <svg className="w-5 h-5 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🧭 PREMIUM CATEGORY BAR (STICKY) */}
      <nav className="sticky top-0 z-50 bg-[#faf9f6]/80 backdrop-blur-xl border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); applyFilters(searchQuery, cat); }}
                className={`relative py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  selectedCategory === cat ? 'text-stone-950' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {cat}
                {selectedCategory === cat && (
                  <motion.div layoutId="activeCat" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 🎊 LUXURY CAMPAIGN SECTION */}
      {campaign && !searchQuery && selectedCategory === "All" && (
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              whileHover={{ y: -5 }}
              className="relative rounded-[2rem] overflow-hidden bg-stone-900 flex flex-col md:flex-row items-center min-h-[500px]"
            >
              <div className="p-12 md:p-20 md:w-1/2 z-10 space-y-8">
                <span className="bg-amber-500/10 text-amber-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                  Limited Edition
                </span>
                <h2 className="font-serif text-4xl md:text-6xl text-white italic leading-[1.1]">
                  {campaign.title}
                </h2>
                <p className="text-stone-400 font-serif text-xl leading-relaxed">
                  {campaign.description}
                </p>
                <Link 
                  href={campaign.target_url || "#"} 
                  className="inline-flex items-center gap-4 bg-white text-stone-900 px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-all group"
                >
                  Explore Collection
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
              <div className="md:w-1/2 w-full h-[400px] md:h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-transparent to-transparent z-10" />
                <img 
                  src={campaign.image_url} 
                  className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-1000"
                />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* 🏆 BEST SELLERS (EDITORIAL CAROUSEL) */}
      {selectedCategory === "All" && bestSellers.length > 0 && !searchQuery && (
        <section className="py-24 bg-stone-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16 flex items-end justify-between">
              <div>
                <h2 className="font-serif text-5xl italic text-stone-900 mb-4">The Best Sellers</h2>
                <div className="h-1 w-20 bg-amber-400" />
              </div>
            </div>

            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex gap-10 overflow-x-auto pb-12 no-scrollbar"
            >
              {bestSellers.map((book) => (
                <div key={book.id} className="min-w-[280px] flex-shrink-0">
                  <div className="relative group">
                    <div className="absolute -top-4 left-4 z-40">
                      <div className="bg-stone-900 text-amber-400 text-[9px] font-bold px-4 py-2 uppercase tracking-tighter rounded-full border border-amber-400/30">
                        Top Pick
                      </div>
                    </div>
                    <BookCard book={book} />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* 📦 BOOK GRID (CURATED COLLECTIONS) */}
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        {filteredBooks.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-stone-400 font-serif italic text-3xl">"No such story exists in our archives..."</p>
            <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setFilteredBooks(allBooks); }} className="mt-8 text-amber-600 font-bold uppercase tracking-widest hover:underline underline-offset-8 transition-all">
              Clear All Filters
            </button>
          </div>
        ) : (
          collections.map((colName) => (
            <motion.section 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              key={colName} 
              className="scroll-mt-32"
            >
              <div className="flex items-center gap-6 mb-16">
                <h3 className="font-serif text-4xl text-stone-900 italic flex-shrink-0">{colName}</h3>
                <div className="h-[1px] bg-stone-200 w-full" />
                <span className="text-[10px] text-stone-400 font-black uppercase tracking-widest whitespace-nowrap">{filteredBooks.filter(b => b.collection_name === colName).length} TITLES</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-20">
                {filteredBooks.filter(b => b.collection_name === colName).map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </motion.section>
          ))
        )}
      </div>
    </main>
  );
}