"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import BookCard from "@/components/BookCard";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AuthorProfile() {
  const params = useParams();
  // Using decodeURIComponent to handle names with spaces in the URL
  const authorName = decodeURIComponent(params?.name as string || "");
  const [authorData, setAuthorData] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorName) return;

    async function getData() {
      setLoading(true);
      // 1. Get Author Info
      const { data: author } = await supabase
        .from("authors")
        .select("*")
        .eq("name", authorName)
        .maybeSingle();
      
      setAuthorData(author);

      // 2. Get their Books
      const { data: booksData } = await supabase
        .from("books")
        .select("*")
        .eq("author", authorName);
      
      setBooks(booksData || []);
      setLoading(false);
    }
    getData();
  }, [authorName]);

  if (loading) return (
    <div className="min-h-screen bg-[#05010d] flex items-center justify-center">
       <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#05010d] text-gray-200 selection:bg-purple-500/30 pb-20">
      
      {/* 🧭 BREADCRUMBS */}
      <nav className="max-w-7xl mx-auto px-6 py-10 flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] font-black text-gray-500">
        <Link href="/" className="hover:text-purple-400 transition-colors">Archive</Link>
        <span className="text-gray-800">/</span>
        <span className="text-white">Curators</span>
        <span className="text-gray-800">/</span>
        <span className="text-purple-500">{authorName}</span>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- AUTHOR HERO SECTION --- */}
        <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-32 items-center">
          
          {/* Portrait with Decorative Glow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-4 relative group"
          >
            <div className="absolute -inset-4 bg-purple-600/10 blur-[60px] rounded-full group-hover:bg-purple-600/20 transition-all duration-700" />
            <div className="relative aspect-square w-full max-w-[320px] mx-auto overflow-hidden rounded-[3rem] border border-white/10 shadow-2xl">
              <img 
                src={authorData?.profile_image_url || `https://ui-avatars.com/api/?name=${authorName}&background=151025&color=fff&size=512`} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                alt={authorName}
              />
            </div>
          </motion.div>

          {/* Biography Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 space-y-8"
          >
            <div className="space-y-2">
              <span className="text-purple-500 text-[10px] font-black uppercase tracking-[0.5em]">The Visionary</span>
              <h1 className="text-6xl md:text-8xl font-serif italic text-white tracking-tighter leading-none">
                {authorName}
              </h1>
            </div>

            <div className="relative">
               <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-purple-500/50 to-transparent hidden md:block" />
               <p className="text-gray-400 font-light leading-relaxed text-lg md:text-xl font-serif italic max-w-3xl">
                {authorData?.bio || `We are currently documenting the legacy of ${authorName} in our private archive.`}
              </p>
            </div>
          </motion.div>
        </section>

        {/* --- BIBLIOGRAPHY / COLLECTION --- */}
        <div className="space-y-12">
          <div className="flex items-center gap-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 whitespace-nowrap">
              Published Volumes
            </h2>
            <div className="h-[1px] w-full bg-white/5" />
            <span className="text-[10px] font-serif italic text-purple-400">{books.length} Editions</span>
          </div>

          {books.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {books.map((book, idx) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-white/5 rounded-[3rem]">
              <p className="font-serif italic text-gray-600">No public volumes available in this curation.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}