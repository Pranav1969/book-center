"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";

export default function DetailedInventoryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    setLoading(true);
    const { data } = await supabase
      .from("books")
      .select("*, authors(name)")
      .order("created_at", { ascending: false });
    setBooks(data || []);
    setLoading(false);
  }

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    book.authors?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex justify-between items-center mb-10 border-b border-stone-200 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold italic">Full Inventory</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Stock Management</p>
          </div>
          <Link href="/admin" className="px-6 py-2 bg-stone-900 text-white text-[10px] font-bold uppercase rounded-full">
            Back to Dashboard
          </Link>
        </header>

        <div className="mb-8">
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            className="w-full max-w-md border-b border-stone-300 bg-transparent py-2 outline-none text-sm font-serif italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-stone-400 uppercase text-[10px] font-bold tracking-widest animate-pulse">Loading Archive...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className="bg-white border border-stone-200 p-5 rounded-sm shadow-sm flex gap-4 transition-all hover:shadow-md group">
                <div className="relative h-32 w-20 flex-shrink-0 bg-stone-100 shadow-inner overflow-hidden">
                  <img src={book.image_url} alt="" className="h-full w-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
                </div>
                
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-serif text-lg font-bold leading-tight line-clamp-2">{book.title}</h3>
                    <p className="text-[10px] text-teal-600 font-bold uppercase mt-1 italic">{book.authors?.name}</p>
                    <p className="text-[9px] text-stone-400 uppercase tracking-tighter mt-1">{book.category || "General"}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-bold text-stone-900 text-sm">₹{book.price}</span>
                    <Link href={`/admin?edit=${book.id}`} className="text-[9px] font-black uppercase text-stone-400 hover:text-black">
                      Edit Record
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredBooks.length === 0 && (
          <div className="py-20 text-center text-stone-400 text-xs italic">No matching records found in the library.</div>
        )}
      </div>
    </div>
  );
}