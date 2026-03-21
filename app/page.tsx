"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import BookCard from "../components/BookCard";
import Navbar from "../components/Navbar"; // ✅ Imported Navbar for Cart support

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
      // ✅ Fetching all necessary columns including discount_percent
      const { data, error } = await supabase
        .from("books")
        .select("id, title, author, price, category, image_url, back_image_url, discount_percent")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBooks(data);
      } else if (error) {
        console.error("Error fetching books:", error.message);
      }
      setLoading(false);
    }
    getBooks();
  }, []);

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#fcfaf7]">
      {/* ✅ Replaced static nav with our dynamic Navbar component */}
      <Navbar />

      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Updated Brand Name: Karuna Book Center */}
        <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter text-stone-900 leading-none">
          Karuna <br /> Book Center
        </h1>

        <div className="mt-8 flex items-center gap-4 text-stone-500">
          <div className="h-px w-12 bg-stone-300" />
          <p className="uppercase tracking-[0.3em] text-[10px] font-bold">
            Curating {books.length} unique titles
          </p>
        </div>

        {/* Integrated Search within Header for cleaner UI */}
        <div className="mt-12 max-w-md">
          <input
            type="text"
            placeholder="Search by title or author..."
            className="w-full bg-white border border-stone-200 rounded-full px-6 py-4 text-sm focus:ring-2 focus:ring-teal-800 outline-none transition-all shadow-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Books Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-stone-200 animate-pulse rounded-sm"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filtered.length > 0 ? (
              filtered.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  price={book.price}
                  category={book.category}
                  image_url={book.image_url}
                  back_image_url={book.back_image_url}
                  discount_percent={book.discount_percent} // ✅ Correctly passing to Card
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center font-serif text-stone-400 italic">
                No titles match your search criteria.
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}