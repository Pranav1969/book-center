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

      // 2. Fetch Banners (Ensure you have a 'banners' table in Supabase)
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

  // ✅ AUTO-SLIDE LOGIC FOR HERO BANNER
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, [banners]);

  // ✅ BEST SELLERS LOGIC
  const bestSellers = allBooks.filter(b => b.is_bestseller);

  // 🔍 SEARCH LOGIC
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
    <div className="p-20 text-center font-serif italic text-stone-400">
      Loading Library...
    </div>
  );

  const collections = [...new Set(filteredBooks.map((b) => b.collection_name))]
    .filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-[#fdfcfb]">
      
      {/* 🎭 DYNAMIC ANIMATED HERO SECTION */}
      <section className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden bg-stone-900">
        
        {/* Background Image Carousel */}
        <AnimatePresence mode="wait">
          {banners.length > 0 ? (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={banners[currentSlide].image_url} 
                alt="Banner"
                className="w-full h-full object-cover"
              />
              {/* Dark Overlay for Readability */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-stone-900" />
          )}
        </AnimatePresence>

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center text-white">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="font-serif text-5xl md:text-7xl mb-6 italic drop-shadow-2xl">
              Karuna Book Center
            </h1>
            
            <p className="text-stone-300 uppercase tracking-[0.3em] text-[10px] mb-10 drop-shadow-md">
              {banners[currentSlide]?.title || "Search by Title, Author, or Publication"}
            </p>
            
            <div className="max-w-2xl mx-auto relative group">
              <input 
                type="text" 
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="What are you looking for?" 
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 py-4 px-8 rounded-full text-sm text-white focus:bg-white focus:text-stone-900 focus:ring-4 ring-teal-500/40 outline-none transition-all shadow-2xl"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <span className="text-teal-400 text-xl group-hover:scale-110 transition-transform inline-block">🔍</span>
              </div>
            </div>
          </motion.div>

          {/* Slide Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-10 flex gap-2">
              {banners.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 transition-all duration-500 rounded-full ${idx === currentSlide ? 'w-8 bg-teal-500' : 'w-2 bg-white/30'}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ✅ BEST SELLERS SECTION */}
      {bestSellers.length > 0 && !searchQuery && (
        <section className="bg-stone-50 py-16 border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-10">
              <span className="h-px bg-amber-400 flex-1"></span>
              <h2 className="font-serif text-3xl italic font-bold text-stone-800 text-center">
                Our Best Sellers
              </h2>
              <span className="h-px bg-amber-400 flex-1"></span>
            </div>

            <div className="flex overflow-x-auto pb-8 gap-8 no-scrollbar md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible">
              {bestSellers.map((book) => (
                <div key={book.id} className="min-w-[200px] flex-shrink-0 relative group">
                  <div className="absolute -top-2 -left-2 z-30 bg-amber-500 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest shadow-lg transform -rotate-12">
                    Must Read
                  </div>
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORY NAV (Sticky) */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-8 whitespace-nowrap">
          <button 
            onClick={() => {setSearchQuery(""); setFilteredBooks(allBooks);}} 
            className={`text-[10px] font-bold uppercase tracking-widest ${
              !searchQuery ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400'
            }`}
          >
            All Books
          </button>

          {collections.map(col => (
            <a key={col} href={`#${col}`} className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">
              {col}
            </a>
          ))}
        </div>
      </div>

      {/* RESULTS DISPLAY */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        {filteredBooks.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-stone-400 font-serif italic text-xl">
              "No results found for your search..."
            </p>
            <button 
              onClick={() => {setSearchQuery(""); setFilteredBooks(allBooks);}} 
              className="mt-4 text-teal-600 text-xs font-bold uppercase underline"
            >
              Clear Search
            </button>
          </div>
        ) : (
          collections.map((colName) => (
            <section key={colName} id={colName} className="scroll-mt-28">
              <h3 className="font-serif text-2xl font-bold mb-8 border-b border-stone-100 pb-4 text-stone-800">
                {colName}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
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