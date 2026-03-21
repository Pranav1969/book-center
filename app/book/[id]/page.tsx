"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import BookCard from "@/components/BookCard";
import { useCart } from "@/context/CartContext";

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

      // ✅ Fetch current book (safe)
      const { data: currentBook, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Fetch Error:", error);
        setLoading(false);
        return;
      }

      if (!currentBook) {
        setBook(null);
        setLoading(false);
        return;
      }

      setBook(currentBook);

      // ✅ Related logic from FIRST CODE (category based)
      const { data: related } = await supabase
        .from("books")
        .select("*")
        .eq("category", currentBook.category) // 👈 FROM FIRST CODE
        .neq("id", id)
        .limit(4);

      setRelatedBooks((related || []).filter(Boolean));

      setLoading(false);
    }

    fetchFullData();
  }, [id]);

  // ✅ Loading
  if (loading)
    return (
      <div className="p-20 text-center font-serif animate-pulse text-stone-400">
        Opening the vault...
      </div>
    );

  // ✅ Not found
  if (!book)
    return (
      <div className="p-20 text-center font-serif">
        Title not found in our records.
      </div>
    );

  // ✅ Price Logic
  const discount = Number(book?.discount_percent) || 0;
  const actualPrice = Number(book?.price) || 0;
  const finalPrice = actualPrice - (actualPrice * discount) / 100;

  return (
    <main className="min-h-screen bg-[#fcfaf7] pb-32">
      
      {/* Breadcrumbs */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
        <Link href="/" className="hover:text-stone-900">Library</Link>
        <span>/</span>
        <span className="text-stone-600">
          {book?.collection_name || book?.category || "General"}
        </span>
        <span>/</span>
        <span className="text-stone-900 truncate max-w-[150px]">
          {book?.title}
        </span>
      </nav>

      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 py-4">
        
        {/* IMAGE SECTION */}
        <div className="space-y-8">
          <div className="relative bg-white shadow-2xl border aspect-[3/4] overflow-hidden sticky top-24">
            
            {discount > 0 && (
              <div className="absolute top-4 left-4 z-30 bg-red-600 text-white text-[10px] px-3 py-1 font-bold">
                {discount}% OFF
              </div>
            )}

            {/* BACK IMAGE */}
            <img
              src={book?.back_image_url || book?.image_url}
              alt="Back Cover"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* FRONT IMAGE (Auto Slide) */}
            <img
              src={book?.image_url || "/placeholder.jpg"}
              alt={book?.title}
              className="absolute inset-0 w-full h-full object-cover animate-slide"
            />
          </div>
        </div>

        {/* TEXT SECTION */}
        <div className="flex flex-col">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900">
            {book?.title}
          </h1>

          <p className="text-2xl italic text-stone-500 mt-4">
            by {book?.author || "Unknown Author"}
          </p>

          <p className="text-[10px] font-bold uppercase text-stone-400 mt-2">
            Published by: {book?.publication || "Karuna Publications"}
          </p>

          <div className="h-px bg-stone-200 my-8" />

          {/* Description */}
          <div className="prose prose-sm text-stone-700 min-h-[200px]">
            <h4 className="text-[10px] uppercase font-bold text-stone-400 mb-4">
              About this title
            </h4>
            <ReactMarkdown>
              {book?.description || "No summary available."}
            </ReactMarkdown>
          </div>

          {/* Desktop Buy */}
          <div className="mt-12 hidden md:flex items-center gap-8">
            <div>
              {discount > 0 && (
                <span className="text-sm text-red-500 line-through">
                  ₹{actualPrice.toFixed(0)}
                </span>
              )}
              <div className="text-4xl font-black">
                ₹{finalPrice.toFixed(0)}
              </div>
            </div>

            <button
              onClick={() => addToCart({ ...book, price: finalPrice })}
              className="flex-1 bg-stone-900 text-white py-5 text-xs font-bold uppercase hover:bg-teal-900"
            >
              Add to Collection
            </button>
          </div>
        </div>
      </section>

      {/* RELATED BOOKS */}
      {relatedBooks.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 mt-32">
          <h2 className="text-xl font-serif font-bold italic mb-8 border-b pb-4">
            More from {book?.category || book?.collection_name}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {relatedBooks.map((r) => (
              <BookCard key={r.id} book={r} />
            ))}
          </div>
        </section>
      )}

      {/* MOBILE BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:hidden flex justify-between">
        <div>
          <span className="text-[10px] text-stone-400">Total</span>
          <div className="text-xl font-black">
            ₹{finalPrice.toFixed(0)}
          </div>
        </div>

        <button
          onClick={() => addToCart({ ...book, price: finalPrice })}
          className="bg-stone-900 text-white px-6 py-3 text-[10px] font-bold"
        >
          Add to Cart
        </button>
      </div>
    </main>
  );
}