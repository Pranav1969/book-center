"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import BookCard from "@/components/BookCard";

export default function AuthorProfile() {
  const params = useParams();
  const authorName = decodeURIComponent(params.name as string);
  const [authorData, setAuthorData] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    async function getData() {
      // 1. Get Author Info
      const { data: author } = await supabase
        .from("authors")
        .select("*")
        .eq("name", authorName)
        .single();
      
      setAuthorData(author);

      // 2. Get their Books
      const { data: booksData } = await supabase
        .from("books")
        .select("*")
        .eq("author", authorName);
      
      setBooks(booksData || []);
    }
    getData();
  }, [authorName]);

  return (
    <main className="min-h-screen bg-[#fdfcfb] py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 mb-20 items-center md:items-start">
          {/* Author Image */}
          <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 bg-stone-200 rounded-full overflow-hidden shadow-2xl border-4 border-white">
            <img 
              src={authorData?.profile_image_url || "https://ui-avatars.com/api/?name=" + authorName} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Author Bio */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-serif italic mb-6">{authorName}</h1>
            <p className="text-stone-600 leading-relaxed font-serif text-lg italic whitespace-pre-wrap">
              {authorData?.bio || `We are currently gathering information about ${authorName}. Stay tuned for a complete biography.`}
            </p>
          </div>
        </div>

        {/* Bibliography */}
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-10 border-b pb-4">
          Bibliography
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {books.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      </div>
    </main>
  );
}