"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import BookCard from "@/components/BookCard";
import { motion, AnimatePresence } from "framer-motion";
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
    }, 5000);
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

    if (category !== "All") {
      baseResults = baseResults.filter(book => book.category === category);
    }

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-stone-900 to-black text-white">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-xl tracking-widest"
        >
          Loading Library...
        </motion.div>
      </div>
    );
  }

  const bestSellers = allBooks.filter(b => b.is_bestseller);
  const collections = [...new Set(filteredBooks.map((b) => b.collection_name))].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white">

      {/* HERO */}
      <section className="relative h-[85vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img
              src={banners[currentSlide]?.image_url}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-serif italic mb-6"
          >
            Karuna Library
          </motion.h1>

          <motion.p className="text-teal-400 tracking-[0.4em] text-xs uppercase mb-8">
            {banners[currentSlide]?.title}
          </motion.p>

          {/* PREMIUM SEARCH */}
          <div className="relative w-full max-w-2xl group">
            <input
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search books, authors..."
              className="w-full px-8 py-5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 focus:bg-white focus:text-black transition-all outline-none shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* CAMPAIGN */}
      {campaign && (
        <section className="p-10">
          <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-teal-600/20 to-transparent border border-white/10 flex flex-col md:flex-row">
            <div className="p-10 space-y-4">
              <h2 className="text-4xl font-serif">{campaign.title}</h2>
              <p className="text-white/70">{campaign.description}</p>
              <Link
                href={campaign.target_url || "#"}
                className="inline-block px-6 py-3 bg-teal-500 rounded-full hover:scale-105 transition"
              >
                Explore
              </Link>
            </div>
            <img src={campaign.image_url} className="w-full md:w-1/2 object-cover" />
          </div>
        </section>
      )}

      {/* CATEGORY BAR */}
      <nav className="sticky top-0 backdrop-blur-xl bg-black/40 border-b border-white/10 z-50">
        <div className="flex gap-4 overflow-x-auto p-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-5 py-2 rounded-full transition ${
                selectedCategory === cat
                  ? "bg-teal-500 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="p-10">
          <h2 className="text-3xl font-serif mb-6">Best Sellers</h2>
          <div className="flex gap-6 overflow-x-auto">
            {bestSellers.map(book => (
              <motion.div
                whileHover={{ scale: 1.08 }}
                key={book.id}
                className="min-w-[220px]"
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* BOOK GRID */}
      <div className="p-10 space-y-16">
        {filteredBooks.length === 0 ? (
          <div className="text-center">
            <p>No books found</p>
            <button onClick={resetAll}>Reset</button>
          </div>
        ) : (
          collections.map(col => (
            <section key={col}>
              <h3 className="text-2xl font-serif mb-6">{col}</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {filteredBooks
                  .filter(b => b.collection_name === col)
                  .map(book => (
                    <motion.div
                      key={book.id}
                      whileHover={{ scale: 1.05 }}
                      className="transition"
                    >
                      <BookCard book={book} />
                    </motion.div>
                  ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}