"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import ReactMarkdown from "react-markdown"; // For rich descriptions
import BookCard from "../../../components/BookCard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState<any>(null);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFullData() {
      setLoading(true);
      const { data: currentBook } = await supabase.from("books").select("*").eq("id", id).single();

      if (currentBook) {
        setBook(currentBook);
        const { data: related } = await supabase
          .from("books")
          .select("*")
          .eq("category", currentBook.category)
          .neq("id", id)
          .limit(4);
        setRelatedBooks(related || []);
      }
      setLoading(false);
    }
    fetchFullData();
  }, [id]);

  if (loading) return <div className="p-20 text-center font-serif animate-pulse text-stone-400">Opening the vault...</div>;
  if (!book) return <div className="p-20 text-center font-serif">Title not found in our records.</div>;

  return (
    <main className="min-h-screen bg-[#fcfaf7] pb-32">
      {/* 1. BREADCRUMBS */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
        <Link href="/" className="hover:text-stone-900 transition-colors">Library</Link>
        <span>/</span>
        <span className="text-stone-300">{book.category}</span>
        <span>/</span>
        <span className="text-stone-900 truncate max-w-[150px]">{book.title}</span>
      </nav>

      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 py-4">
        {/* Book Cover */}
        <div className="relative group">
          <div className="bg-white shadow-2xl border border-stone-200 aspect-[3/4] overflow-hidden sticky top-24">
            <img src={book.image_url} alt={book.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Text Details */}
        <div className="flex flex-col">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-900 leading-tight">
            {book.title}
          </h1>
          <p className="text-2xl italic font-serif text-stone-500 mt-4">by {book.author}</p>
          
          <div className="h-px bg-stone-200 w-full my-8" />
          
          {/* 2. RICH DESCRIPTION (Markdown) */}
          <div className="prose prose-stone prose-sm max-w-none text-stone-700 leading-relaxed">
            <ReactMarkdown>
              {book.description || "No summary available."}
            </ReactMarkdown>
          </div>

          {/* Desktop Desktop Buy Button (Hidden on Mobile) */}
          <div className="mt-12 hidden md:flex items-center gap-8">
            <span className="text-4xl font-black text-stone-900">${Number(book.price).toFixed(2)}</span>
            <button className="flex-1 bg-stone-900 text-white py-5 px-8 text-xs font-bold uppercase tracking-[0.3em] hover:bg-teal-900 transition-all shadow-xl">
              Add to Collection
            </button>
          </div>
        </div>
      </section>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 mt-32">
          <h2 className="text-xl font-serif font-bold italic text-stone-800 mb-8 border-b border-stone-200 pb-4">
            Similar Titles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {relatedBooks.map((r) => (
              <BookCard key={r.id} {...r} />
            ))}
          </div>
        </section>
      )}

      {/* 3. STICKY MOBILE BUY BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 p-4 z-50 md:hidden flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-stone-400">Total</span>
          <span className="text-xl font-black text-stone-900">${Number(book.price).toFixed(2)}</span>
        </div>
        <button className="bg-stone-900 text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform">
          Add to Cart
        </button>
      </div>
    </main>
  );
}