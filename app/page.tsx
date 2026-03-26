"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import BookCard from "@/components/BookCard";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import Link from "next/link";

// Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch Data logic remains unchanged to preserve core functionality
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: booksData } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: bannerData } = await supabase
        .from("banners")
        .select("*")
        .order("priority", { ascending: true });

      const { data: campaignData } = await supabase
        .from("campaigns")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .single();

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

  const resetAll = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setFilteredBooks(allBooks);
  };

  const categories = ["All", ...new Set(allBooks.map((b) => b.category).filter(Boolean))] as string[];

  const applyFilters = useCallback((query: string, category: string) => {
    let baseResults = [...allBooks];
    if (category !== "All") baseResults = baseResults.filter(book => book.category === category);

    if (!query.trim()) {
      setFilteredBooks(baseResults);
      return;
    }

    const q = query.toLowerCase();
    const results = baseResults
      .map(book => {
        let priority = 0;
        if (book.title?.toLowerCase().includes(q)) priority = 4;
        else if (book.author?.toLowerCase().includes(q)) priority = 3;
        else if (book.publication?.toLowerCase().includes(q)) priority = 2;
        return { ...book, priority };
      })
      .filter(book => book.priority > 0)
      .sort((a, b) => b.priority - a.priority);

    setFilteredBooks(results);
  }, [allBooks]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    applyFilters(val, selectedCategory);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f8f7f4]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-stone-200 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="mt-4 font-serif italic text-stone-500 animate-pulse">Curating your library...</p>
      </div>
    </div>
  );

  const bestSellers = allBooks.filter(b => b.is_bestseller);
  const collections = [...new Set(filteredBooks.map((b) => b.collection_name))].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-[#fcfbf9] text-stone-900 selection:bg-teal-100 selection:text-teal-900">
      
      {/* 🎭 MODERN HERO SECTION */}
      <section className="relative h-[75vh] md:h-[90vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            {banners.length > 0 ? (
              <img 
                src={banners[currentSlide].image_url} 
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-stone-900" />
            )}
            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#fcfbf9]" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 flex flex-col items-center justify-center h-full px-6">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full max-w-5xl text-center"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-bold tracking-[0.3em] uppercase bg-white/10 backdrop-blur-md border border-white/20 text-teal-400 rounded-full">
              EST. 2024 • Premier Literary Hub
            </span>
            <h1 className="font-serif text-5xl md:text-9xl text-white mb-8 italic leading-tight drop-shadow-sm">
              Karuna <span className="text-teal-400">Book</span> Center
            </h1>
            
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search titles, authors, or genres..." 
                className="relative w-full bg-white/90 backdrop-blur-xl border-none py-5 md:py-6 px-10 rounded-full text-stone-800 shadow-2xl focus:ring-2 ring-teal-500 outline-none transition-all placeholder:text-stone-400"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-stone-900 text-white rounded-full hover:bg-teal-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Slide Indicators */}
          <div className="absolute bottom-12 flex gap-3">
            {banners.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1 transition-all duration-500 rounded-full ${idx === currentSlide ? 'w-12 bg-teal-500' : 'w-4 bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 🎊 REFINED CAMPAIGN SECTION */}
      {campaign && !searchQuery && selectedCategory === "All" && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-6 -mt-20 relative z-30"
        >
          <div className="group relative bg-white rounded-3xl overflow-hidden flex flex-col md:flex-row items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-stone-100">
            <div className="p-10 md:p-20 md:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">Limited Collection</span>
              </div>
              <h2 className="font-serif text-4xl md:text-6xl text-stone-800 italic leading-tight">
                {campaign.title}
              </h2>
              <p className="text-stone-500 font-serif text-lg leading-relaxed">
                {campaign.description}
              </p>
              <Link 
                href={campaign.target_url || "#"} 
                className="group inline-flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-teal-600 transition-all transform hover:scale-105"
              >
                {campaign.button_text || "Explore Now"}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            <div className="md:w-1/2 w-full h-80 md:h-[550px] overflow-hidden">
              <img src={campaign.image_url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Campaign" />
            </div>
          </div>
        </motion.section>
      )}

      {/* ✅ STICKY PREMIUM NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black uppercase tracking-tighter text-stone-400 bg-stone-100 px-2 py-1 rounded">
              Filters
            </span>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); applyFilters(searchQuery, cat); }}
                  className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                    ? 'bg-stone-900 text-white shadow-lg scale-105' 
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ BEST SELLERS: HORIZONTAL ELEGANCE */}
      {selectedCategory === "All" && bestSellers.length > 0 && !searchQuery && (
        <section className="py-20 bg-[#f8f7f4]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-serif text-4xl md:text-5xl italic text-stone-800">The Bestsellers</h2>
                <p className="text-stone-500 mt-2 font-serif">Handpicked literary masterpieces loved by thousands.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {bestSellers.map((book) => (
                <motion.div 
                  key={book.id}
                  whileHover={{ y: -10 }}
                  className="relative"
                >
                  <div className="absolute -top-3 -right-3 z-30 bg-teal-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-xl">
                    Top Rated
                  </div>
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {filteredBooks.length === 0 ? (
          <div className="py-40 text-center">
            <h3 className="font-serif italic text-3xl text-stone-400">Our shelves are quiet today...</h3>
            <button onClick={resetAll} className="mt-6 text-teal-600 font-bold uppercase tracking-widest text-xs border-b-2 border-teal-600 pb-1 hover:text-teal-700 transition-colors">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-32">
            {collections.map((colName) => (
              <motion.section 
                key={colName}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="scroll-mt-32"
              >
                <div className="flex items-center gap-6 mb-12">
                  <h3 className="font-serif text-3xl md:text-4xl italic font-light text-stone-800 shrink-0">
                    {colName}
                  </h3>
                  <div className="h-[1px] bg-stone-200 w-full" />
                  <span className="text-[10px] text-stone-400 font-black uppercase tracking-widest shrink-0">
                    {filteredBooks.filter(b => b.collection_name === colName).length} Works
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-16">
                  {filteredBooks
                    .filter((b) => b.collection_name === colName)
                    .map((book) => (
                      <motion.div key={book.id} variants={fadeInUp}>
                        <BookCard book={book} />
                      </motion.div>
                    ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER MINI */}
      <footer className="bg-stone-900 text-stone-400 py-20 px-6 mt-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h4 className="font-serif text-2xl text-white italic">Karuna Book Center</h4>
            <p className="text-sm leading-relaxed max-w-xs">Your sanctuary for timeless literature and modern thoughts. Curating the best for the curious mind.</p>
          </div>
          <div className="flex flex-col gap-2 uppercase text-[10px] font-bold tracking-[0.2em]">
            <span className="text-stone-500 mb-2">Connect</span>
            <a href="#" className="hover:text-teal-400 transition-colors">Instagram</a>
            <a href="#" className="hover:text-teal-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-teal-400 transition-colors">Newsletter</a>
          </div>
          <div className="text-right flex flex-col justify-end">
            <p className="text-[10px] font-medium tracking-widest uppercase">© 2026 Karuna Book Center • All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </main>
  );
}