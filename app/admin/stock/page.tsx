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
  
  // State to track manual input values for each book
  const [stockInputs, setStockInputs] = useState<{ [key: string]: string }>({});

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

  // Handle manual input change
  const handleInputChange = (id: string, value: string) => {
    setStockInputs(prev => ({ ...prev, [id]: value }));
  };

  // NEW: Update stock by any amount (Positive or Negative)
  async function handleBulkUpdate(id: string, currentStock: number) {
    const change = parseInt(stockInputs[id] || "0");
    if (isNaN(change) || change === 0) return;

    const newCount = Math.max(0, (currentStock || 0) + change);
    
    const { error } = await supabase
      .from("books")
      .update({ stock_count: newCount })
      .eq("id", id);

    if (!error) {
      setBooks(prevBooks => 
        prevBooks.map(b => b.id === id ? { ...b, stock_count: newCount } : b)
      );
      setStockInputs(prev => ({ ...prev, [id]: "" })); // Clear input
    } else {
      alert("Update failed: " + error.message);
    }
  }

  async function handleQuickAdjust(id: string, currentStock: number, change: number) {
    const newCount = Math.max(0, (currentStock || 0) + change);
    const { error } = await supabase.from("books").update({ stock_count: newCount }).eq("id", id);
    if (!error) {
      setBooks(prev => prev.map(b => b.id === id ? { ...b, stock_count: newCount } : b));
    }
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    const matchesLowStock = filterLowStock ? (book.stock_count || 0) < 5 : true;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="p-4 md:p-8 bg-stone-50 min-h-screen text-stone-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 pb-6 border-b border-stone-200">
          <div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold italic text-stone-800">Inventory Controller</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mt-1">Stock & Asset Management</p>
          </div>
          <Link href="/admin" className="mt-4 md:mt-0 text-[10px] font-bold uppercase border-b border-stone-900 pb-1">
            ← Back to Dashboard
          </Link>
        </header>

        {/* FILTERS SECTION */}
        <section className="bg-white p-4 md:p-6 border border-stone-200 shadow-sm rounded-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Search title..." 
              className="w-full border-b border-stone-200 py-2 outline-none focus:border-stone-900 bg-transparent font-serif"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="w-full border-b border-stone-200 py-2 outline-none bg-transparent text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {[...new Set(books.map(b => b.category))].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="lowStock" checked={filterLowStock} onChange={(e) => setFilterLowStock(e.target.checked)} />
              <label htmlFor="lowStock" className="text-[10px] font-bold uppercase text-stone-600">Low Stock Only</label>
            </div>
          </div>
        </section>

        {/* MOBILE CARDS / DESKTOP TABLE */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-20 text-center italic text-stone-400">Loading...</div>
          ) : (
            filteredBooks.map((book) => (
              <div key={book.id} className="bg-white p-4 md:p-6 border border-stone-200 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* INFO AREA */}
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-lg text-stone-800">{book.title}</h3>
                  <div className="flex gap-3 text-[10px] font-bold uppercase text-stone-400 mt-1">
                    <span>{book.publication}</span>
                    <span className="text-teal-600">{book.category}</span>
                  </div>
                  <p className="mt-2 text-sm font-mono font-bold">Current Stock: 
                    <span className={book.stock_count < 5 ? "text-red-500 ml-2" : "text-stone-900 ml-2"}>
                      {book.stock_count}
                    </span>
                  </p>
                </div>

                {/* ACTION AREA - Mobile Friendly */}
                <div className="flex flex-wrap items-center gap-3 bg-stone-50 p-3 md:p-0 md:bg-transparent rounded-sm">
                  
                  {/* Plus/Minus Quick Buttons */}
                  <div className="flex border border-stone-300 rounded-md overflow-hidden bg-white">
                    <button onClick={() => handleQuickAdjust(book.id, book.stock_count, -1)} className="px-3 py-2 hover:bg-red-50 text-stone-600 border-r border-stone-300">-</button>
                    <button onClick={() => handleQuickAdjust(book.id, book.stock_count, 1)} className="px-3 py-2 hover:bg-teal-50 text-stone-600">+</button>
                  </div>

                  {/* Manual Multi-Add/Minus Input */}
                  <div className="flex gap-2 items-center flex-1 sm:flex-none">
                    <input 
                      type="number" 
                      placeholder="+/- Qty" 
                      className="w-20 border border-stone-300 rounded-md px-2 py-2 text-sm text-center outline-none focus:ring-1 focus:ring-teal-500"
                      value={stockInputs[book.id] || ""}
                      onChange={(e) => handleInputChange(book.id, e.target.value)}
                    />
                    <button 
                      onClick={() => handleBulkUpdate(book.id, book.stock_count)}
                      className="bg-stone-900 text-white text-[10px] font-bold uppercase px-4 py-2.5 rounded-md hover:bg-stone-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}