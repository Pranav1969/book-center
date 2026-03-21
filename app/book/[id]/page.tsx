"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState<any>(null);

  useEffect(() => {
    async function fetchBook() {
      const { data } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();
      setBook(data);
    }
    fetchBook();
  }, [id]);

  if (!book) return <div className="p-20 text-center font-serif">Loading book details...</div>;

  return (
    <main className="min-h-screen bg-[#fcfaf7] p-8 md:p-24">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Book Cover */}
        <div className="bg-white shadow-2xl border border-stone-200 aspect-[3/4] flex items-center justify-center overflow-hidden">
          {book.image_url ? (
            <img src={book.image_url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-stone-300 italic">No Cover Available</span>
          )}
        </div>

        {/* Text Details */}
        <div className="flex flex-col justify-center space-y-6">
          <nav className="text-xs uppercase tracking-widest text-teal-700 font-bold mb-4">
            &larr; <a href="/">Back to Library</a>
          </nav>
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight">{book.title}</h1>
          <p className="text-2xl italic font-serif text-stone-600">by {book.author}</p>
          <div className="h-px bg-stone-200 w-24" />
          <p className="text-stone-700 leading-relaxed text-lg">{book.description}</p>
          <div className="flex items-center gap-6 pt-6">
            <span className="text-3xl font-bold">${book.price}</span>
            <button className="bg-stone-900 text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-teal-800 transition-colors">
              Add to Collection
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}