"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import BookCard from "@/components/BookCard";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import Link from "next/link";

// 🌟 Premium Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
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

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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
    }, 8000);
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
    <div className="flex h-screen items-center justify-center bg-[#05010d]">
      <div className="relative flex flex-col items-center">
        <div className="w-20 h-20 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-20 h-20 border-2 border-transparent border-b-indigo-400 rounded-full animate-reverse-spin opacity-50"></div>
        <p className="mt-8 font-serif italic text-purple-300/60 tracking-widest animate-pulse">Curating Excellence...</p>
      </div>
    </div>
  );

  const bestSellers = allBooks.filter(b => b.is_bestseller);
  const collections = [...new Set(filteredBooks.map((b) => b.collection_name))].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-[#05010d] text-gray-200 selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
      
      {/* 🚀 Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-400 z-[100] origin-left" style={{ scaleX }} />

      {/* 🎭 LUXURY HERO SECTION */}
      <section className="relative h-[85vh] md:h-[95vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {banners.length > 0 ? (
              <img 
                src={banners[currentSlide].image_url} 
                alt="Banner"
                className="w-full h-full object-cover opacity-60"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-950 to-black" />
            )}
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#05010d] via-[#05010d]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#05010d] via-transparent to-[#05010d]/40" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 flex flex-col items-center justify-center h-full px-6">
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-6xl text-center"
          >
            <span className="inline-block px-5 py-2 mb-8 text-[11px] font-bold tracking-[0.4em] uppercase bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 text-purple-300 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.15)]">
              The Sovereign Collection
            </span>
            <h1 className="font-serif text-6xl md:text-[10rem] text-white mb-10 italic leading-[0.85] tracking-tight">
              Karuna <span className="text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-purple-600 drop-shadow-2xl">Luxe</span>
            </h1>
            
            <div className="max-w-3xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
              <div className="relative flex items-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden p-1 shadow-2xl transition-all duration-500 group-focus-within:border-purple-500/50">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="Find your next masterpiece..." 
                  className="w-full bg-transparent py-5 md:py-6 px-8 text-white outline-none placeholder:text-gray-500 font-light text-lg"
                />
                <button className="mr-2 w-14 h-14 flex items-center justify-center bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Luxury Slide Indicators */}
          <div className="absolute bottom-16 flex gap-4">
            {banners.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 transition-all duration-700 rounded-full ${idx === currentSlide ? 'w-16 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]' : 'w-4 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 🎊 PREMIUM CAMPAIGN BANNER */}
      {campaign && !searchQuery && selectedCategory === "All" && (
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-7xl mx-auto px-6 -mt-24 relative z-30"
        >
          <div className="group relative bg-[#0d071a] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row items-center border border-white/10 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.1),transparent)] pointer-events-none" />
            
            <div className="p-12 md:p-24 md:w-1/2 space-y-8 relative z-10">
              <div className="flex items-center gap-3">
                <span className="w-12 h-[1px] bg-purple-500" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-purple-400">Exclusive Event</span>
              </div>
              <h2 className="font-serif text-5xl md:text-7xl text-white italic leading-tight">
                {campaign.title}
              </h2>
              <p className="text-gray-400 font-light text-xl leading-relaxed max-w-md">
                {campaign.description}
              </p>
              <Link 
                href={campaign.target_url || "#"} 
                className="group relative inline-flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all duration-500"
              >
                {campaign.button_text || "Discover Now"}
                <div className="absolute inset-0 rounded-full group-hover:blur-xl group-hover:bg-purple-500/50 transition-all -z-10" />
              </Link>
            </div>
            <div className="md:w-1/2 w-full h-[400px] md:h-[650px] overflow-hidden relative">
              <img src={campaign.image_url} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="Campaign" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d071a] via-transparent to-transparent" />
            </div>
          </div>
        </motion.section>
      )}

      {/* ✅ GLASS CATEGORY NAV */}
      <nav className="sticky top-0 z-50 bg-[#05010d]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center">
          <div className="flex items-center gap-12 w-full overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500/60 border border-purple-500/20 px-3 py-1 rounded-md">
              Collection
            </span>
            <div className="flex gap-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); applyFilters(searchQuery, cat); }}
                  className={`relative px-6 py-2 rounded-full text-[12px] font-medium tracking-widest transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {cat}
                  {selectedCategory === cat && (
                    <motion.div 
                      layoutId="activePill" 
                      className="absolute inset-0 bg-purple-600/20 border border-purple-500/30 rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ BEST SELLERS: CAROUSEL EXPERIENCE */}
      {selectedCategory === "All" && bestSellers.length > 0 && !searchQuery && (
        <section className="py-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -mr-64 -mt-64" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="font-serif text-5xl md:text-6xl text-white italic mb-4">The Bestsellers</h2>
              <p className="text-gray-500 text-lg font-light tracking-wide">Timeless works that define our era.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
              {bestSellers.map((book) => (
                <motion.div 
                  key={book.id}
                  whileHover={{ y: -15 }}
                  className="relative group"
                >
                  <div className="absolute -top-4 -right-2 z-30 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-2xl border border-white/20 transform -rotate-12 group-hover:rotate-0 transition-transform">
                    BEST SELLER
                  </div>
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 py-24 relative">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[150px] rounded-full -ml-96 pointer-events-none" />
        
        {filteredBooks.length === 0 ? (
          <div className="py-60 text-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="font-serif italic text-4xl text-gray-700 mb-8">The archive is silent...</h3>
              <button onClick={resetAll} className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-purple-400 text-xs font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all">
                Clear all filters
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-40">
            {collections.map((colName) => (
              <motion.section 
                key={colName}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="scroll-mt-32"
              >
                <div className="flex items-end justify-between mb-16 border-b border-white/5 pb-8">
                  <div className="flex items-center gap-8">
                    <h3 className="font-serif text-4xl md:text-5xl italic font-light text-white tracking-tight">
                      {colName}
                    </h3>
                    <span className="text-[11px] text-purple-500 font-black uppercase tracking-[0.3em] bg-purple-500/10 px-4 py-1.5 rounded-full">
                      {filteredBooks.filter(b => b.collection_name === colName).length} Vol.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-12 gap-y-24">
                  {filteredBooks
                    .filter((b) => b.collection_name === colName)
                    .map((book) => (
                      <motion.div key={book.id} variants={fadeInUp} className="relative group">
                        <BookCard book={book} />
                      </motion.div>
                    ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>

      {/* 🏛 LUXURY FOOTER */}
      <footer className="relative bg-[#020005] pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
            <div className="space-y-8 col-span-2">
              <h4 className="font-serif text-5xl text-white italic tracking-tighter">Karuna Luxe</h4>
              <p className="text-gray-500 text-xl font-light leading-relaxed max-w-md">
                Dedicated to the curation of human thought. We provide an elevated literary experience for the modern connoisseur.
              </p>
            </div>
            <div className="flex flex-col gap-6 uppercase text-[11px] font-bold tracking-[0.3em]">
              <span className="text-purple-500/60">Curation</span>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Private Library</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">First Editions</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Membership</a>
            </div>
            <div className="flex flex-col gap-6 uppercase text-[11px] font-bold tracking-[0.3em]">
              <span className="text-purple-500/60">Society</span>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Journal</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Concierge</a>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-medium tracking-[0.4em] uppercase text-gray-600">
              © 2026 Karuna Book Center • A Luxury Literary Experience
            </p>
            <div className="flex gap-12 text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <a href="#" className="hover:text-purple-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-purple-500 transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}