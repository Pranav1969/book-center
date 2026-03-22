"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";

export default function StockManagement() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPublication, setSelectedPublication] = useState("All");
  const [sortBy, setSortBy] = useState("title_asc"); 
  const [filterLowStock, setFilterLowStock] = useState(false);
  
  // Stock Input State
  const [stockInputs, setStockInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchStockData();
  }, []);

  async function fetchStockData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("id, title, price, stock_count, category, publication, image_url")
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
      alert("Update failed: " + error.message);
    }
  }

  // --- COMPREHENSIVE FILTER & SORT ---
  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
      const matchesPub = selectedPublication === "All" || book.publication === selectedPublication;
      const matchesLowStock = filterLowStock ? (book.stock_count || 0) < 5 : true;
      return matchesSearch && matchesCategory && matchesPub && matchesLowStock;
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

  // Unique lists for dropdowns
  const categories = ["All", ...new Set(books.map(b => b.category).filter(Boolean))];
  const publications = ["All", ...new Set(books.map(b => b.publication).filter(Boolean))];

  return (
    <div className="p-4 md:p-8 bg-stone-50 min-h-screen text-stone-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 pb-6 border-b border-stone-200">
          <div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold italic text-stone-800">Visual Inventory</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mt-1">Stock, Media & Archives</p>
          </div>
          <Link href="/admin" className="mt-4 md:mt-0 text-[10px] font-bold uppercase border-b border-stone-900 pb-1">
            ← Dashboard
          </Link>
        </header>

        {/* ADVANCED FILTERING BAR */}
        <section className="bg-white p-4 md:p-6 border border-stone-200 shadow-sm rounded-sm mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            
            <div className="lg:col-span-1">
              <label className="text-[9px] font-bold uppercase text-stone-400 mb-1 block">Search</label>
              <input 
                type="text" 
                placeholder="Title..." 
                className="w-full border-b py-2 outline-none focus:border-stone-900 bg-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase text-stone-400 mb-1 block">Category</label>
              <select className="w-full border-b py-2 outline-none bg-transparent text-xs" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase text-stone-400 mb-1 block">Publisher</label>
              <select className="w-full border-b py-2 outline-none bg-transparent text-xs" value={selectedPublication} onChange={(e) => setSelectedPublication(e.target.value)}>
                {publications.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase text-stone-400 mb-1 block">Sort By</label>
              <select className="w-full border-b py-2 outline-none bg-transparent text-xs font-bold text-teal-700" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="title_asc">Title (A-Z)</option>
                <option value="stock_asc">Stock: Low-High</option>
                <option value="stock_desc">Stock: High-Low</option>
                <option value="price_asc">Price: Low-High</option>
                <option value="price_desc">Price: High-Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="lowStock" checked={filterLowStock} onChange={(e) => setFilterLowStock(e.target.checked)} className="accent-stone-800" />
              <label htmlFor="lowStock" className="text-[9px] font-bold uppercase text-stone-600 cursor-pointer whitespace-nowrap">Low Stock Only</label>
            </div>
          </div>
        </section>

        {/* BOOK LIST */}
        <div className="grid gap-4">
          {loading ? (
            <div className="p-20 text-center italic text-stone-400 font-serif">Scanning Shelves...</div>
          ) : (
            filteredBooks.map((book) => (
              <div key={book.id} className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden flex flex-col sm:flex-row transition-all hover:shadow-md">
                
                {/* Book Cover Image */}
                <div className="w-full sm:w-24 h-32 sm:h-auto bg-stone-100 shrink-0">
                  <img 
                    src={book.image_url || "/placeholder-book.png"} 
                    alt={book.title} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info & Controls */}
                <div className="p-4 flex-1 flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-base text-stone-800 truncate">{book.title}</h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-bold uppercase text-stone-400 mt-1">
                      <span className="text-stone-900">₹{book.price}</span>
                      <span>{book.publication}</span>
                      <span className="text-teal-600">{book.category}</span>
                    </div>
                    
                    {/* Stock Status Bar */}
                    <div className="mt-3 w-full max-w-[200px] bg-stone-100 h-1.5 rounded-full overflow-hidden">
                       <div 
                        className={`h-full transition-all duration-500 ${book.stock_count < 5 ? 'bg-red-500' : 'bg-teal-600'}`}
                        style={{ width: `${Math.min((book.stock_count / 20) * 100, 100)}%` }}
                       />
                    </div>
                    <p className="text-[10px] mt-1 font-bold">In Stock: {book.stock_count}</p>
                  </div>

                  {/* Bulk Actions */}
                  <div className="flex items-center gap-2 self-start md:self-center">
                    <input 
                      type="number" 
                      placeholder="+/- Qty" 
                      className="w-20 border border-stone-300 rounded-md px-2 py-2 text-xs text-center outline-none focus:ring-1 focus:ring-stone-800"
                      value={stockInputs[book.id] || ""}
                      onChange={(e) => handleInputChange(book.id, e.target.value)}
                    />
                    <button 
                      onClick={() => handleBulkUpdate(book.id, book.stock_count)}
                      className="bg-stone-900 text-white text-[9px] font-bold uppercase px-4 py-2.5 rounded-md hover:bg-stone-700 transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {!loading && filteredBooks.length === 0 && (
          <div className="mt-10 p-20 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-sm italic">
            No records match these filters.
          </div>
        )}
      </div>
    </div>
  );
}