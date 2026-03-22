"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";

export default function StockManagement() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("title"); 
  const [filterLowStock, setFilterLowStock] = useState(false);

  useEffect(() => {
    fetchStockData();
  }, []);

  async function fetchStockData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("id, title, price, stock_count, category, publication")
      .order("stock_count", { ascending: true });

    if (!error) setBooks(data || []);
    setLoading(false);
  }

  // --- STOCK ACTIONS ---
  
  async function handleUpdateStock(id: string, currentStock: number, change: number) {
    // Prevent stock from going below zero
    const newCount = Math.max(0, (currentStock || 0) + change);
    
    const { error } = await supabase
      .from("books")
      .update({ stock_count: newCount })
      .eq("id", id);

    if (!error) {
      // Optimistic UI update
      setBooks(prevBooks => 
        prevBooks.map(b => b.id === id ? { ...b, stock_count: newCount } : b)
      );
    } else {
      console.error("Update failed:", error.message);
      alert("Could not update stock: " + error.message);
    }
  }

  async function handleDeleteBook(id: string, title: string) {
    if (!confirm(`Permanently delete "${title}"?`)) return;
    
    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", id);
      
    if (!error) {
      setBooks(prevBooks => prevBooks.filter(b => b.id !== id));
    } else {
      alert("Delete failed: " + error.message);
    }
  }

  // --- FILTER & SORT LOGIC ---
  const filteredBooks = books
    .filter(book => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        book.title?.toLowerCase().includes(searchLower) || 
        book.publication?.toLowerCase().includes(searchLower);
        
      const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
      const matchesLowStock = filterLowStock ? (book.stock_count || 0) < 5 : true;
      
      return matchesSearch && matchesCategory && matchesLowStock;
    })
    .sort((a, b) => {
      if (sortBy === "stock_count" || sortBy === "price") {
        return (a[sortBy] || 0) - (b[sortBy] || 0);
      }
      return (a.title || "").localeCompare(b.title || "");
    });

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSortBy("title");
    setFilterLowStock(false);
  };

  return (
    <div className="p-8 bg-stone-50 min-h-screen text-stone-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-stone-200">
          <div>
            <h1 className="text-4xl font-serif font-bold italic text-stone-800">Inventory Controller</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mt-1">Stock & Asset Management</p>
          </div>
          <Link href="/admin" className="mt-4 md:mt-0 text-[10px] font-bold uppercase border-b-2 border-stone-900 pb-1 hover:text-stone-500 transition-all">
            Return to Dashboard
          </Link>
        </header>

        {/* SEARCH & FILTERS BAR */}
        <section className="bg-white p-6 border border-stone-200 shadow-sm rounded-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="md:col-span-2">
              <label className="text-[9px] font-bold uppercase text-stone-400 mb-2 block">Search Library</label>
              <input 
                type="text" 
                placeholder="Search by Title or Publication..." 
                className="w-full border-b border-stone-200 py-2 outline-none focus:border-stone-900 transition-colors bg-transparent font-serif italic text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-[9px] font-bold uppercase text-stone-400 mb-2 block">Category</label>
              <select 
                className="w-full border-b border-stone-200 py-2 outline-none bg-transparent text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {[...new Set(books.map(b => b.category).filter(Boolean))].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
               <button 
                onClick={resetFilters}
                className="text-[9px] font-bold uppercase text-red-400 hover:text-red-600 self-end mb-2 transition-colors"
               >
                Clear All Filters ×
               </button>
               <select 
                className="w-full border-b border-stone-200 py-2 outline-none bg-transparent text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="title">Sort: Title (A-Z)</option>
                <option value="stock_count">Sort: Stock (Low-High)</option>
                <option value="price">Sort: Price (Low-High)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <input 
              type="checkbox" 
              id="lowStock"
              checked={filterLowStock} 
              onChange={(e) => setFilterLowStock(e.target.checked)}
              className="accent-stone-800"
            />
            <label htmlFor="lowStock" className="text-[10px] font-bold uppercase text-stone-600 cursor-pointer">
              Show only low stock ( {`<`} 5 )
            </label>
          </div>
        </section>

        {/* TABLE BODY */}
        <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-stone-400 font-serif italic">Loading inventory...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100/50 border-b border-stone-200">
                  <th className="p-5 text-[10px] font-black uppercase text-stone-500">Book & Publisher</th>
                  <th className="p-5 text-[10px] font-black uppercase text-stone-500">Status</th>
                  <th className="p-5 text-[10px] font-black uppercase text-stone-500 text-center">Qty</th>
                  <th className="p-5 text-[10px] font-black uppercase text-stone-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="group hover:bg-stone-50/80 transition-colors">
                    <td className="p-5">
                      <p className="font-serif font-bold text-base text-stone-800 leading-tight">{book.title}</p>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-[9px] font-bold uppercase text-stone-400">{book.publication || "Unknown Publisher"}</span>
                        <span className="text-[14px] text-stone-200">•</span>
                        <span className="text-[9px] font-bold uppercase text-teal-600">{book.category}</span>
                      </div>
                    </td>
                    <td className="p-5 w-48">
                      <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${book.stock_count < 5 ? 'bg-red-500' : 'bg-stone-800'}`} 
                          style={{ width: `${Math.min(((book.stock_count || 0) / 25) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-5 text-center font-mono font-bold text-lg">
                      <span className={book.stock_count < 5 ? "text-red-600" : "text-stone-900"}>{book.stock_count}</span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <div className="flex bg-stone-50 rounded-full border border-stone-200 px-1">
                          <button 
                            onClick={() => handleUpdateStock(book.id, book.stock_count, -1)} 
                            className="w-7 h-7 flex items-center justify-center hover:text-red-500 transition-colors"
                          >−</button>
                          <button 
                            onClick={() => handleUpdateStock(book.id, book.stock_count, 1)} 
                            className="w-7 h-7 flex items-center justify-center hover:text-teal-600 transition-colors"
                          >+</button>
                        </div>
                        <button 
                          onClick={() => handleDeleteBook(book.id, book.title)} 
                          className="text-[9px] font-black uppercase text-stone-300 hover:text-red-600 transition-colors"
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredBooks.length === 0 && (
            <div className="p-20 text-center text-stone-400 font-serif italic">No books found matching your criteria.</div>
          )}
        </div>
      </div>
    </div>
  );
}