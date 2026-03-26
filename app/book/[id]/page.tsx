"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import BookCard from "@/components/BookCard";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function BookDetail() {
  const params = useParams();
  const id = params?.id;
  const { addToCart } = useCart();

  const [book, setBook] = useState<any>(null);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");

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
      setActiveImage(currentBook.image_url);

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
        <p className="font-serif italic text-gray-500 animate-pulse tracking-widest uppercase text-[10px]">Retrieving Masterpiece...</p>
      </div>
    </div>
  );

  if (!book) return (
    <div className="min-h-screen bg-[#05010d] flex flex-col items-center justify-center text-gray-400 font-serif space-y-4">
      <p className="tracking-widest uppercase text-[10px]">This edition is currently unavailable in the vault.</p>
      <Link href="/" className="px-8 py-3 bg-white/5 border border-white/10 text-[9px] font-sans font-black uppercase tracking-[0.3em] text-white hover:bg-purple-600 transition-all rounded-full">Return to Archive</Link>
    </div>
  );

  const discount = Number(book?.discount_percent) || 0;
  const actualPrice = Number(book?.price) || 0;
  const finalPrice = actualPrice - (actualPrice * discount) / 100;

  return (
    <main className="min-h-screen bg-[#05010d] text-gray-200 selection:bg-purple-500/30 pb-32">
      
      {/* 🧭 NAVIGATION BREADCRUMBS */}
      <nav className="max-w-7xl mx-auto px-6 py-10 flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] font-black text-gray-600">
        <Link href="/" className="hover:text-purple-400 transition-colors">Archive</Link>
        <span className="text-gray-800">/</span>
        <span className="text-gray-400">{book?.category || "General"}</span>
        <span className="text-gray-800">/</span>
        <span className="text-white truncate max-w-[120px]">{book?.title}</span>
      </nav>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        
        {/* 🎨 VISUAL DISPLAY SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-6 space-y-8"
        >
          <div className="group relative bg-gradient-to-b from-white/5 to-transparent p-4 md:p-12 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
            {/* Ambient Backglow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 blur-[120px] pointer-events-none" />
            
            <div className="relative aspect-[3/4.5] rounded-2xl overflow-hidden shadow-3xl bg-[#0a0515] border border-white/5">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  src={activeImage || "/placeholder.jpg"}
                  alt={book?.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {discount > 0 && (
                <div className="absolute top-6 left-6 z-30 bg-purple-600 text-white text-[10px] px-4 py-1.5 font-black rounded-full shadow-xl">
                  {discount}% LUXE PRIVILEGE
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Selectors */}
          <div className="flex gap-4 justify-center">
             <button 
                onClick={() => setActiveImage(book.image_url)}
                className={`w-16 h-20 rounded-lg border-2 transition-all overflow-hidden ${activeImage === book.image_url ? 'border-purple-500 scale-110 shadow-lg shadow-purple-500/20' : 'border-white/5 opacity-40 hover:opacity-100'}`}
             >
                <img src={book?.image_url} className="w-full h-full object-cover" alt="Front" />
             </button>
             {book?.back_image_url && (
                <button 
                  onClick={() => setActiveImage(book.back_image_url)}
                  className={`w-16 h-20 rounded-lg border-2 transition-all overflow-hidden ${activeImage === book.back_image_url ? 'border-purple-500 scale-110 shadow-lg shadow-purple-500/20' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                >
                  <img src={book?.back_image_url} className="w-full h-full object-cover" alt="Back" />
                </button>
             )}
          </div>
        </motion.div>

        {/* 🖋 CONTENT SECTION */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-6 flex flex-col justify-center"
        >
          <div className="space-y-4 mb-8">
            <span className="text-purple-500 text-[10px] font-black uppercase tracking-[0.5em]">Private Collection</span>
            <h1 className="text-5xl md:text-7xl font-serif italic text-white leading-tight tracking-tighter">
              {book?.title}
            </h1>
            <div className="pt-2">
                <Link 
                href={`/author/${encodeURIComponent(book?.author || "Unknown")}`}
                className="text-xl text-gray-400 font-serif italic hover:text-white transition-colors underline underline-offset-[12px] decoration-white/10 hover:decoration-purple-500"
                >
                Curated by {book?.author || "Unknown Author"}
                </Link>
            </div>
          </div>

          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 mb-10">
            Source: {book?.publication || "Karuna Private Archive"}
          </p>

          {/* Luxury Pricing Card */}
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] mb-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.1 14.1H3.9L12 5.45z"/></svg>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Investment Value</p>
                <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-serif text-white">₹{finalPrice.toFixed(0)}</span>
                    {discount > 0 && (
                    <span className="text-lg text-gray-700 line-through italic font-serif">₹{actualPrice.toFixed(0)}</span>
                    )}
                </div>
                </div>

                <button
                onClick={() => addToCart({ ...book, price: finalPrice })}
                className="px-14 py-6 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-purple-600 hover:text-white transition-all duration-500 shadow-xl active:scale-95 whitespace-nowrap"
                >
                Add to Collection
                </button>
            </div>
          </div>

          {/* Narrative Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h4 className="text-[10px] uppercase font-black tracking-[0.4em] text-gray-600 whitespace-nowrap">The Narrative</h4>
              <div className="h-px w-full bg-white/5" />
            </div>
            <div className="prose prose-invert prose-purple max-w-none text-gray-400 leading-relaxed font-light text-lg italic font-serif">
              <ReactMarkdown>
                {book?.description || "No summary available for this restricted title."}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 📚 RELATED ARCHIVE SECTION */}
      {relatedBooks.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mt-48">
          <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
            <h2 className="text-4xl font-serif italic text-white">
              Related <span className="text-purple-500">Volumes</span>
            </h2>
            <Link href="/" className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all">
              View Full Archive →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {relatedBooks.map((r, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                key={r.id}
              >
                <BookCard book={r} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 📱 MOBILE PERSISTENT ACQUISITION BAR */}
      <div className="fixed bottom-8 left-6 right-6 md:hidden z-[60]">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-black/60 backdrop-blur-3xl border border-white/10 p-5 rounded-[2.5rem] flex justify-between items-center shadow-3xl"
        >
          <div>
            <span className="text-[8px] uppercase tracking-[0.2em] text-gray-500 font-black">Valuation</span>
            <div className="text-xl font-serif italic text-white leading-none">₹{finalPrice.toFixed(0)}</div>
          </div>
          <button
            onClick={() => addToCart({ ...book, price: finalPrice })}
            className="bg-purple-600 text-white px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 active:scale-95 transition-transform"
          >
            Collect Now
          </button>
        </motion.div>
      </div>
    </main>
  );
}