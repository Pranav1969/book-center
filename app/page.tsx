// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import BookCard from "../components/BookCard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function getBooks() {
      // Ensure your SQL table has 'image_url' and 'back_image_url'
      const { data, error } = await supabase
        .from("books")
        .select("id, title, author, price, category, image_url, back_image_url")
        .order('created_at', { ascending: false });
      
      if (!error && data) setBooks(data);
      setLoading(false);
    }
    getBooks();
  }, []);

  const filtered = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#fcfaf7]">
      {/* Navigation */}
      <nav className="h-16 border-b border-stone-200 bg-white/70 backdrop-blur-md sticky top-0 z-50 px-6">
        <div className="max-w-6xl mx-auto h-full flex justify-between items-center">
          <span className="font-serif font-black text-2xl tracking-tighter">BC.</span>
          <div className="flex-1 max-w-sm mx-10">
            <input 
              type="text" 
              placeholder="Search by title or author..." 
              className="w-full bg-stone-100 border-none rounded-full px-6 py-2 text-sm focus:ring-2 focus:ring-teal-800 outline-none transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="hidden md:flex gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
            <span className="text-stone-900 cursor-pointer">Catalog</span>
            <span className="hover:text-stone-900 cursor-pointer">About</span>
          </div>
        </div>
      </nav>

      <header className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter text-stone-900">
          Karuna Book <br/>Center
        </h1>
        <div className="mt-8 flex items-center gap-4 text-stone-500">
          <div className="h-px w-12 bg-stone-300" />
          <p className="uppercase tracking-[0.3em] text-xs font-medium">
            Curating {books.length} unique titles
          </p>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-[3/4] bg-stone-200 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filtered.map((book) => (
              <BookCard 
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                price={book.price}
                category={book.category}
                image_url={book.image_url}
                back_image_url={book.back_image_url}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}