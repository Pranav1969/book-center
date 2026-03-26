"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import BookCard from "@/components/BookCard";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

export default function BookDetail() {
  const params = useParams();
  const id = params?.id;
  const { addToCart } = useCart();

  const [book, setBook] = useState<any>(null);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchFullData() {
      setLoading(true);
      const { data: currentBook, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !currentBook) {
        setBook(null);
        setLoading(false);
        return;
      }
      setBook(currentBook);

      const { data: related } = await supabase
        .from("books")
        .select("*")
        .eq("category", currentBook.category)
        .neq("id", id)
        .limit(4);

      setRelatedBooks((related || []).filter(Boolean));
      setLoading(false);
    }
    fetchFullData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#05010d] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
        <p className="font-serif italic text-gray-500 animate-pulse">Unveiling the Masterpiece...</p>
      </div>
    </div>
  );

  if (!book) return (
    <div className="min-h-screen bg-[#05010d] flex items-center justify-center text-gray-400 font-serif">
      This edition is currently unavailable in the vault.
    </div>
  );

  const discount = Number(book?.discount_percent) || 0;
  const actualPrice = Number(book?.price) || 0;
  const finalPrice = actualPrice - (actualPrice * discount) / 100;

  return (
    <main className="min-h-screen bg-[#05010d] text-gray-200 selection:bg-purple-500/30">
      
      {/* 🧭 NAVIGATION BREADCRUMBS */}
      <nav className="max-w-7xl mx-auto px-6 py-10 flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] font-black text-gray-500">
        <Link href="/" className="hover:text-purple-400 transition-colors">Archive</Link>
        <span className="text-gray-800">/</span>
        <span className="text-gray-400">{book?.category || "General"}</span>
        <span className="text-gray-800">/</span>
        <span className="text-white truncate max-w-[120px]">{book?.title}</span>
      </nav>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        
        {/* 🎨 VISUAL DISPLAY SECTION */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-6 space-y-12"
        >
          <div className="group relative bg-gradient-to-b from-white/5 to-transparent p-4 md:p-12 rounded-[3rem] border border-white/10 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/20 blur-[120px] pointer-events-none" />
            
            <div className="relative aspect-[3/4.5] rounded-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
               {/* Image Switcher/Slider Logic */}
              <img
                src={book?.image_url || "/placeholder.jpg"}
                alt={book?.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {discount > 0 && (
                <div className="absolute top-6 right-6 z-30 bg-purple-600 text-white text-[10px] px-4 py-1.5 font-black rounded-full shadow-xl">
                  {discount}% PRIVILEGE
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery (Simulated) */}
          <div className="flex gap-4 justify-center">
             <div className="w-16 h-20 rounded-lg border border-purple-500/50 overflow-hidden opacity-100 cursor-pointer">
                <img src={book?.image_url} className="w-full h-full object-cover" />
             </div>
             {book?.back_image_url && (
                <div className="w-16 h-20 rounded-lg border border-white/10 overflow-hidden opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                  <img src={book?.back_image_url} className="w-full h-full object-cover" />
                </div>
             )}
          </div>
        </motion.div>

        {/* 🖋 CONTENT SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-6 flex flex-col justify-center"
        >
          <div className="space-y-2 mb-6">
            <span className="text-purple-500 text-[10px] font-black uppercase tracking-[0.5em]">Available Edition</span>
            <h1 className="text-5xl md:text-7xl font-serif italic text-white leading-tight tracking-tighter">
              {book?.title}
            </h1>
          </div>

          <div className="flex items-center gap-4 mb-10">
            <div className="h-[1px] w-12 bg-purple-500/50" />
            <Link 
              href={`/author/${encodeURIComponent(book?.author || "Unknown")}`}
              className="text-xl text-gray-400 font-serif italic hover:text-white transition-colors"
            >
              Curation by {book?.author || "Unknown Author"}
            </Link>
          </div>

          {/* Luxury Pricing Card */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Investment</p>
               <div className="flex items-baseline gap-3">
                 <span className="text-4xl font-serif text-white">₹{finalPrice.toFixed(0)}</span>
                 {discount > 0 && (
                   <span className="text-sm text-gray-600 line-through">₹{actualPrice.toFixed(0)}</span>
                 )}
               </div>
            </div>

            <button
              onClick={() => addToCart({ ...book, price: finalPrice })}
              className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-purple-600 hover:text-white transition-all shadow-2xl hover:shadow-purple-500/20 active:scale-95"
            >
              Add to Collection
            </button>
          </div>

          {/* Description Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-500">The Narrative</h4>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            <div className="prose prose-invert prose-purple max-w-none text-gray-400 leading-relaxed font-light">
              <ReactMarkdown>
                {book?.description || "No summary available for this restricted title."}
              </ReactMarkdown>
            </div>
          </div>

          {/* Meta Stats */}
          <div className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t border-white/5">
            <div>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Publication</p>
              <p className="text-sm text-gray-300 mt-1">{book?.publication || "Karuna Publications"}</p>
            </div>
            <div>
               <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Category</p>
               <p className="text-sm text-gray-300 mt-1">{book?.category || "General Archive"}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 📚 RELATED ARCHIVE SECTION */}
      {relatedBooks.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mt-40 pb-20">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-serif italic text-white">
              Related <span className="text-purple-500 underline underline-offset-8 decoration-white/10">Volumes</span>
            </h2>
            <Link href="/shop" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-purple-400">View All</Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {relatedBooks.map((r) => (
              <div key={r.id} className="transform hover:-translate-y-2 transition-transform duration-500">
                <BookCard book={r} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 📱 MOBILE PERSISTENT BAR (Premium) */}
      <div className="fixed bottom-6 left-6 right-6 md:hidden z-[60]">
        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl flex justify-between items-center shadow-2xl">
          <div>
            <span className="text-[8px] uppercase tracking-tighter text-gray-500">Final Valuation</span>
            <div className="text-lg font-serif text-white">₹{finalPrice.toFixed(0)}</div>
          </div>
          <button
            onClick={() => addToCart({ ...book, price: finalPrice })}
            className="bg-white text-black px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95"
          >
            Collect
          </button>
        </div>
      </div>
    </main>
  );
}