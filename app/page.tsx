"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import BookCard from "@/components/BookCard";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // 1. Fetch Books
      const { data: booksData } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      // 2. Fetch Banners from Supabase 'banners' table
      const { data: bannerData } = await supabase
        .from("banners")
        .select("*")
        .order("priority", { ascending: true });

      setAllBooks(booksData || []);
      setFilteredBooks(booksData || []);
      setBanners(bannerData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // ✅ AUTO-SLIDE LOGIC (Every 5 seconds)
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  // ✅ SEARCH LOGIC
  const executeSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredBooks(allBooks);
      return;
    }

    const q = query.toLowerCase();
    const results = allBooks
      .map(book => {
        let priority = 0;
        if (book.title?.toLowerCase().includes(q)) priority = 4;
        else if (book.author?.toLowerCase().includes(q)) priority = 3;
        else if (book.publication?.toLowerCase().includes(q)) priority = 2;
        else if (book.description?.toLowerCase().includes(q)) priority = 1;
        
        return { ...book, priority };
      })
      .filter(book => book.priority > 0)
      .sort((a, b) => b.priority - a.priority);

    setFilteredBooks(results);
  }, [allBooks]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    executeSearch(val);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#fdfcfb] font-serif italic text-stone-400">
      <motion.p 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
      >
        Loading Library...
      </motion.p>
    </div>
  );

  const bestSellers = allBooks.filter(b => b.is_bestseller);
  const collections = [...new Set(filteredBooks.map((b) => b.collection_name))]
    .filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-[#fdfcfb]">
      
      {/* 🎭 DYNAMIC ANIMATED HERO SECTION */}
      <section className="relative h-[75vh] md:h-[85vh] w-full overflow-hidden bg-stone-900">
        
        {/* Background Image Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {banners.length > 0 ? (
              <img 
                src={banners[currentSlide].image_url} 
                alt="Promotion Banner"
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full bg-stone-800" /> // Fallback if no images
            )}
            {/* Dark Overlay for Text Legibility */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
          </motion.div>
        </AnimatePresence>

        {/* Floating Content Overlay */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full px-6 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-full max-w-4xl"
          >
            <h1 className="font-serif text-5xl md:text-8xl text-white mb-6 italic drop-shadow-2xl">
              Karuna Book Center
            </h1>
            
            <AnimatePresence mode="wait">
              <motion.p 
                key={currentSlide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-teal-400 uppercase tracking-[0.4em] text-[10px] md:text-xs font-bold mb-10 drop-shadow-md"
              >
                {banners[currentSlide]?.title || "Explore Our Exclusive Collection"}
              </motion.p>
            </AnimatePresence>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <input 
                type="text" 
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search by Title, Author, or Publication..." 
                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 py-5 px-10 rounded-full text-sm text-white focus:bg-white focus:text-stone-900 focus:ring-4 ring-teal-500/50 outline-none transition-all duration-300 shadow-2xl"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <span className="text-teal-400 text-2xl group-hover:scale-110 transition-transform inline-block">🔍</span>
              </div>
            </div>
          </motion.div>

          {/* Slide Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-10 flex gap-3">
              {banners.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-10 bg-teal-500' : 'w-3 bg-white/30'}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ✅ BEST SELLERS SECTION */}
      {bestSellers.length > 0 && !searchQuery && (
        <section className="bg-white py-20 border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-6 mb-12">
              <div className="h-[1px] bg-stone-200 flex-1"></div>
              <h2 className="font-serif text-4xl italic font-medium text-stone-800 tracking-tight">
                Our Best Sellers
              </h2>
              <div className="h-[1px] bg-stone-200 flex-1"></div>
            </div>

            <div className="flex overflow-x-auto pb-8 gap-8 no-scrollbar md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible">
              {bestSellers.map((book) => (
                <div key={book.id} className="min-w-[220px] flex-shrink-0 relative group">
                  <div className="absolute -top-3 -left-3 z-30 bg-amber-500 text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-widest shadow-xl transform -rotate-12 group-hover:rotate-0 transition-transform">
                    Must Read
                  </div>
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STICKY CATEGORY NAV */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-100 overflow-x-auto no-scrollbar shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex gap-10 items-center justify-center whitespace-nowrap">
          <button 
            onClick={() => {setSearchQuery(""); setFilteredBooks(allBooks);}} 
            className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all ${
              !searchQuery ? 'text-stone-900 border-b-2 border-teal-500 pb-1' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            All Books
          </button>

          {collections.map(col => (
            <a 
              key={col} 
              href={`#${col}`} 
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-teal-600 transition-colors"
            >
              {col}
            </a>
          ))}
        </div>
      </nav>

      {/* BOOKS GRID */}
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-24">
        {filteredBooks.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-stone-400 font-serif italic text-2xl">
              "No treasures found for this search..."
            </p>
            <button 
              onClick={() => {setSearchQuery(""); setFilteredBooks(allBooks);}} 
              className="mt-6 text-teal-600 text-[10px] font-black uppercase tracking-widest hover:tracking-[0.2em] transition-all underline underline-offset-8"
            >
              Reset Library
            </button>
          </div>
        ) : (
          collections.map((colName) => (
            <section key={colName} id={colName} className="scroll-mt-32">
              <div className="flex items-baseline justify-between mb-10 border-b border-stone-100 pb-4">
                <h3 className="font-serif text-3xl font-light text-stone-800 italic">
                  {colName}
                </h3>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                  {filteredBooks.filter(b => b.collection_name === colName).length} Titles
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-16">
                {filteredBooks
                  .filter((b) => b.collection_name === colName)
                  .map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}