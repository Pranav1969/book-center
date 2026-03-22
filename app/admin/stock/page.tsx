"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";

export default function StockManagement() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Updated Sort State
  const [sortBy, setSortBy] = useState("title_asc"); 
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [stockInputs, setStockInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchStockData();
  }, []);

  async function fetchStockData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("id, title, price, stock_count, category, publication")
      .order("title", { ascending: true });

    if (!error) setBooks(data || []);
    setLoading(false);
  }

  const handleInputChange = (id: string, value: string) => {
    setStockInputs(prev => ({ ...prev, [id]: value }));
  };

  async function handleBulkUpdate(id: string, currentStock: number) {
    const change = parseInt(stockInputs[id] || "0");
    if (isNaN(change) || change === 0) return;

    const newCount = Math.max(0, (currentStock || 0) + change);
    const { error } = await supabase.from("books").update({ stock_count: newCount }).eq("id", id);

    if (!error) {
      setBooks(prev => prev.map(b => b.id === id ? { ...b, stock_count: newCount } : b));
      setStockInputs(prev => ({ ...prev, [id]: "" }));
    } else {
      alert("Error: " + error.message);
    }
  }

  // --- REFINED FILTER & SORT LOGIC ---
  const processedBooks = books
    .filter(book => {
      const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
      const matchesLowStock = filterLowStock ? (book.stock_count || 0) < 5 : true;
      return matchesSearch && matchesCategory && matchesLowStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "stock_asc": return (a.stock_count || 0) - (b.stock_count || 0);
        case "stock_desc": return (b.stock_count || 0) - (a.stock_count || 0);
        case "price_asc": return (a.price || 0) - (b.price || 0);
        case "price_desc": return (b.price || 0) - (a.price || 0);
        default: return (a.title || "").localeCompare(b.title || "");
      }
    });

  return (
    <div className="p-4 md:p-8 bg-stone-50 min-h-screen text-stone-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 pb-6 border-b border-stone-200">
          <div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold italic text-stone-800">Inventory Controller</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mt-1">Stock & Pricing Management</p>
          </div>
          <Link href="/admin" className="mt-4 md:mt-0 text-[10px] font-bold uppercase border-b border-stone-900 pb-1">
            ← Back to Dashboard
          </Link>
        </header>

        {/* REFINED FILTERS & SORTING */}
        <section className="bg-white p-4 md:p-6 border border-stone-200 shadow-sm rounded-sm mb-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="text-[9px] font-bold uppercase text-stone-400 mb-1 block">Search Title</label>
              <input 
                type="text" 
                placeholder="Find a book..." 
                className="w-full border-b border-stone-200 py-2 outline-none focus:border-stone-900 bg-transparent font-serif italic text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-[9px] font-bold uppercase text-stone-400 mb-1 block">Category</label>
              <select 
                className="w-full border-b border-stone-200 py-2 outline-none bg-transparent text-sm h-10"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {[...new Set(books.map(b => b.category).filter(Boolean))].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Updated Sorting Dropdown */}
            <div>
              <label className="text-[9px] font-bold uppercase text-stone-400 mb-1 block">Sort Inventory By</label>
              <select 
                className="w-full border-b border-stone-200 py-2 outline-none bg-transparent text-sm font-bold h-10 text-teal-700"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="title_asc">Title (A-Z)</option>
                <option value="stock_asc">Stock: Low to High ↑</option>
                <option value="stock_desc">Stock: High to Low ↓</option>
                <option value="price_asc">Price: Low to High ↑</option>
                <option value="price_desc">Price: High to Low ↓</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-stone-50">
            <input 
              type="checkbox" 
              id="lowStock" 
              checked={filterLowStock} 
              onChange={(e) => setFilterLowStock(e.target.checked)}
              className="w-4 h-4 accent-stone-800"
            />
            <label htmlFor="lowStock" className="text-[10px] font-bold uppercase text-stone-600 cursor-pointer">
              Show critical low stock only ({`<`} 5 units)
            </label>
          </div>
        </section>

        {/* LISTING */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-20 text-center italic text-stone-400 font-serif">Updating Archive...</div>
          ) : (
            processedBooks.map((book) => (
              <div key={book.id} className="bg-white p-4 md:p-6 border border-stone-200 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-stone-300">
                
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-lg text-stone-800">{book.title}</h3>
                  <div className="flex gap-3 text-[10px] font-bold uppercase text-stone-400 mt-1 items-center">
                    <span>{book.publication}</span>
                    <span className="w-1 h-1 bg-stone-200 rounded-full"></span>
                    <span className="text-teal-600">{book.category}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <p className="text-sm font-mono font-bold bg-stone-100 px-2 py-1 rounded">
                      ₹{book.price}
                    </p>
                    <p className="text-xs font-bold uppercase text-stone-500">
                      In Stock: <span className={book.stock_count < 5 ? "text-red-500 underline" : "text-stone-900"}>{book.stock_count}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-stone-50 md:bg-transparent p-3 md:p-0 border-t md:border-t-0 border-stone-100">
                  <div className="flex gap-2 items-center w-full sm:w-auto">
                    <input 
                      type="number" 
                      placeholder="+/- Qty" 
                      className="w-24 border border-stone-300 rounded-md px-3 py-2 text-sm text-center outline-none focus:ring-1 focus:ring-stone-800 bg-white"
                      value={stockInputs[book.id] || ""}
                      onChange={(e) => handleInputChange(book.id, e.target.value)}
                    />
                    <button 
                      onClick={() => handleBulkUpdate(book.id, book.stock_count)}
                      className="flex-1 sm:flex-none bg-stone-900 text-white text-[10px] font-bold uppercase px-6 py-2.5 rounded-md hover:bg-stone-700 transition-colors shadow-sm"
                    >
                      Update
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
          
          {!loading && processedBooks.length === 0 && (
            <div className="p-20 text-center text-stone-400 font-serif italic border-2 border-dashed border-stone-200 rounded-sm">
              No matching records found in the library.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}