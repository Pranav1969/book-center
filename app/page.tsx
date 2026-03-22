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
  const [selectedCategory, setSelectedCategory] = useState("All");

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

      setAllBooks(booksData || []);
      setFilteredBooks(booksData || []);
      setBanners(bannerData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  // ✅ DYNAMIC CATEGORIES LIST
  const categories = ["All", ...new Set(allBooks.map((b) => b.category).filter(Boolean))] as string[];

  // ✅ COMBINED FILTER LOGIC (Maintains the priority sorting from old code)
  const applyFilters = useCallback((query: string, category: string) => {
    let baseResults = [...allBooks];

    // Filter by Category first
    if (category !== "All") {
      baseResults = baseResults.filter(book => book.category === category);
    }

    // Then apply Search logic with priority
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
    applyFilters(val, selectedCategory);
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    applyFilters(searchQuery, cat);
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
      <section className="relative h-[60vh] md:h-[85vh] w-full overflow-hidden bg-stone-900">
        
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
              <div className="w-full h-full bg-stone-800" />
            )}
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
            <h1 className="font-serif text-4xl md:text-8xl text-white mb-3 md:mb-6 italic drop-shadow-2xl">
              Karuna Book Center
            </h1>
            
            <AnimatePresence mode="wait">
              <motion.p 
                key={currentSlide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-teal-400 uppercase tracking-[0.3em] md:tracking-[0.4em] text-[9px] md:text-xs font-bold mb-6 md:mb-10 drop-shadow-md"
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
                placeholder="Search by Title or Author..." 
                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 py-4 md:py-5 px-8 md:px-10 rounded-full text-sm text-white focus:bg-white focus:text-stone-900 focus:ring-4 ring-teal-500/50 outline-none transition-all duration-300 shadow-2xl"
              />
              <div className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2">
                <span className="text-teal-400 text-xl md:text-2xl group-hover:scale-110 transition-transform inline-block">🔍</span>
              </div>
            </div>
          </motion.div>

          {/* Slide Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 md:bottom-10 flex gap-2 md:gap-3">
              {banners.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 md:h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-8 md:w-10 bg-teal-500' : 'w-2 md:w-3 bg-white/30'}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ✅ CATEGORY FILTER BAR (New Integration) */}
      <nav className="sticky top-0 z-40 bg-white border-b border-stone-100 shadow-sm overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4 whitespace-nowrap">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-r pr-4 border-stone-200">
            Categories
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                selectedCategory === cat 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* ✅ BEST SELLERS SECTION (Only visible on "All" and no search) */}
      {selectedCategory === "All" && bestSellers.length > 0 && !searchQuery && (
        <section className="bg-white py-10 md:py-20 border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
              <div className="h-[1px] bg-stone-200 flex-1"></div>
              <h2 className="font-serif text-2xl md:text-4xl italic font-medium text-stone-800 tracking-tight">
                Best Sellers
              </h2>
              <div className="h-[1px] bg-stone-200 flex-1"></div>
            </div>

            <div className="flex overflow-x-auto pb-4 md:pb-8 gap-4 md:gap-8 no-scrollbar md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible">
              {bestSellers.map((book) => (
                <div key={book.id} className="min-w-[180px] md:min-w-[220px] flex-shrink-0 relative group">
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

      {/* BOOKS GRID */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-16 space-y-12 md:space-y-24">
        {filteredBooks.length === 0 ? (
          <div className="py-20 md:py-32 text-center">
            <p className="text-stone-400 font-serif italic text-xl md:text-2xl">
              "No treasures found in this selection..."
            </p>
            <button 
              onClick={() => {setSearchQuery(""); setSelectedCategory("All"); setFilteredBooks(allBooks);}} 
              className="mt-4 text-teal-600 text-[9px] font-black uppercase tracking-widest hover:tracking-[0.2em] transition-all underline underline-offset-8"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          collections.map((colName) => (
            <section key={colName} id={colName} className="scroll-mt-20 md:scroll-mt-32">
              <div className="flex items-baseline justify-between mb-6 md:mb-10 border-b border-stone-100 pb-3 md:pb-4">
                <h3 className="font-serif text-xl md:text-3xl font-light text-stone-800 italic">
                  {colName}
                </h3>
                <span className="text-[9px] md:text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                  {filteredBooks.filter(b => b.collection_name === colName).length} Titles
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-16">
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