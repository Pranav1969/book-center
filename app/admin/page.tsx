"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import ImageCapture from "@/components/ImageCapture";
import Link from "next/link";

const INITIAL_FORM = {
  title: "", author: "", author_id: "", publication: "", description: "",
  category: "", price: "", image_url: "", back_image_url: "",
  collection_name: "General", discount_percent: 0, 
  stock_count: 0, 
  is_featured: false, is_bestseller: false 
};

const INITIAL_AUTHOR = { name: "", bio: "", profile_image_url: "" };

export default function AdminDashboard() {
  const [books, setBooks] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null); 
  const [showAuthorModal, setShowAuthorModal] = useState(false); 

  const [newAuthor, setNewAuthor] = useState(INITIAL_AUTHOR); 
  const [form, setForm] = useState(INITIAL_FORM);
  const [quickStockAdd, setQuickStockAdd] = useState(""); 

  useEffect(() => { 
    fetchData();
  }, []);

  async function fetchData() {
    const [{ data: bks }, { data: auths }] = await Promise.all([
      supabase.from("books").select("*, authors(name)").order("created_at", { ascending: false }),
      supabase.from("authors").select("*").order("name")
    ]);
    setBooks(bks || []);
    setAuthors(auths || []);
  }

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setQuickStockAdd("");
  };

  const handleStockAdjustment = (amount: number) => {
    setForm(prev => ({
      ...prev,
      stock_count: Math.max(0, Number(prev.stock_count) + amount)
    }));
  };

  const applyQuickStock = () => {
    const val = parseInt(quickStockAdd);
    if (!isNaN(val)) {
      handleStockAdjustment(val);
      setQuickStockAdd("");
    }
  };

  async function handleQuickAddAuthor() {
    if (!newAuthor.name) return alert("Author name is required!");
    setSaveLoading(true);
    const payload = { name: newAuthor.name, bio: newAuthor.bio || "", profile_image_url: newAuthor.profile_image_url || "" };
    const { data, error } = editingAuthorId 
      ? await supabase.from("authors").update(payload).eq("id", editingAuthorId).select().single()
      : await supabase.from("authors").insert([payload]).select().single();

    if (!error) {
      await fetchData();
      setForm({ ...form, author_id: data.id, author: data.name });
      setShowAuthorModal(false);
      setNewAuthor(INITIAL_AUTHOR);
      setEditingAuthorId(null);
    } else alert(error.message);
    setSaveLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image_url || !form.author_id) return alert("Missing Front Image or Author!");
    setLoading(true);
    
    // Deconstruct to remove nested objects and IDs not meant for the database payload
    const { authors: nestedAuthors, id, created_at, ...cleanFormData } = form as any;
    
    const payload = { 
      ...cleanFormData, 
      price: Number(form.price), 
      discount_percent: Number(form.discount_percent), 
      stock_count: Number(form.stock_count),
      is_bestseller: Boolean(form.is_bestseller) // Ensure it's a boolean
    };

    const { error } = editingId 
      ? await supabase.from("books").update(payload).eq("id", editingId)
      : await supabase.from("books").insert([payload]);

    if (!error) {
      resetForm();
      fetchData();
      alert(editingId ? "Book Updated!" : "Book Added!");
    } else alert(error.message);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (!error) fetchData();
  }

  return (
    <div className="p-4 md:p-8 bg-stone-50 min-h-screen font-sans text-stone-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col mb-10 pb-6 border-b border-stone-200">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-serif font-bold italic text-stone-800">Admin Dashboard</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Control Panel</p>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth whitespace-nowrap -mx-4 px-4 md:mx-0 md:px-0">
            <Link href="/admin" className="px-5 py-2 bg-stone-900 text-white text-[10px] font-bold uppercase rounded-full shrink-0">Inventory</Link>
            <Link href="/admin/stock" className="px-5 py-2 bg-white border border-teal-600 text-teal-600 text-[10px] font-bold uppercase rounded-full shrink-0">Stock</Link>
            <Link href="/admin/banners" className="px-5 py-2 bg-white border text-[10px] font-bold uppercase rounded-full shrink-0">Banners</Link>
            <Link href="/admin/authors" className="px-5 py-2 bg-white border text-[10px] font-bold uppercase rounded-full shrink-0">Authors</Link>
            <Link href="/admin/campaigns" className="px-5 py-2 bg-white border border-teal-600 text-teal-600 text-[10px] font-bold uppercase rounded-full shrink-0">Campaigns</Link>
          </nav>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* FORM SECTION */}
          <section className="lg:col-span-5 bg-white p-5 md:p-8 border border-stone-200 shadow-sm rounded-sm h-fit lg:sticky lg:top-8 order-1 lg:order-1">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-6 border-b pb-2">
              {editingId ? "Edit Book Record" : "New Library Entry"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <ImageCapture label="Front" onUpload={(url) => setForm({...form, image_url: url})} />
                <ImageCapture label="Back" onUpload={(url) => setForm({...form, back_image_url: url})} />
              </div>

              <input 
                className="w-full border-b py-2 text-base md:text-lg font-serif outline-none bg-transparent" 
                placeholder="Book Title" 
                value={form.title || ""} 
                onChange={e => setForm({...form, title: e.target.value})} 
                required 
              />
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-stone-400">Author</label>
                <div className="flex flex-wrap gap-2">
                  <select 
                    className="flex-1 min-w-[150px] border-b py-2 text-sm outline-none bg-transparent" 
                    value={form.author_id || ""} 
                    onChange={(e) => setForm({...form, author_id: e.target.value, author: authors.find(a => a.id === e.target.value)?.name || ""})} 
                    required
                  >
                    <option value="">Select Author...</option>
                    {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <button type="button" onClick={() => { setEditingAuthorId(null); setNewAuthor(INITIAL_AUTHOR); setShowAuthorModal(true); }} className="text-[10px] font-bold bg-teal-50 text-teal-700 px-3 py-2 rounded uppercase">+ New</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-stone-400 uppercase">Price (₹)</label>
                  <input type="number" value={form.price || ""} onChange={e => setForm({...form, price: e.target.value})} className="border-b py-2 outline-none bg-transparent font-bold text-sm" required />
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-stone-400 uppercase">Discount %</label>
                  <input type="number" value={form.discount_percent || 0} onChange={e => setForm({...form, discount_percent: Number(e.target.value)})} className="border-b py-2 text-red-600 outline-none bg-transparent font-bold text-sm" />
                </div>
              </div>

              {/* BESTSELLER TICK BOX */}
              <div className="flex items-center gap-3 p-3 bg-stone-50 border border-dashed border-stone-300 rounded">
                <input 
                  type="checkbox" 
                  id="bestseller"
                  checked={form.is_bestseller || false}
                  onChange={e => setForm({...form, is_bestseller: e.target.checked})}
                  className="w-5 h-5 accent-teal-600 cursor-pointer"
                />
                <label htmlFor="bestseller" className="text-xs font-bold uppercase tracking-wider text-stone-700 cursor-pointer select-none">
                  Mark as Bestseller
                </label>
              </div>

              {/* ENHANCED STOCK CONTROL */}
              <div className="bg-stone-50 p-4 rounded-md border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Stock Inventory</label>
                  <span className="text-xl font-black text-teal-600">{form.stock_count}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => handleStockAdjustment(-1)} className="w-12 h-12 flex items-center justify-center bg-white border border-stone-300 rounded-full text-xl font-bold shadow-sm active:scale-95">-</button>
                  <input 
                    type="number" 
                    value={form.stock_count} 
                    onChange={e => setForm({...form, stock_count: Number(e.target.value)})}
                    className="flex-1 bg-transparent text-center font-bold text-lg border-b border-stone-300 outline-none"
                  />
                  <button type="button" onClick={() => handleStockAdjustment(1)} className="w-12 h-12 flex items-center justify-center bg-white border border-stone-300 rounded-full text-xl font-bold shadow-sm active:scale-95">+</button>
                </div>

                <div className="flex gap-2 pt-2">
                  <input 
                    type="number" 
                    placeholder="Add multiple (e.g. 50)" 
                    value={quickStockAdd}
                    onChange={(e) => setQuickStockAdd(e.target.value)}
                    className="flex-1 text-[11px] p-2 border rounded bg-white outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={applyQuickStock}
                    className="bg-stone-800 text-white px-4 py-2 text-[10px] font-bold uppercase rounded shadow-sm active:opacity-80"
                  >
                    Add
                  </button>
                </div>
              </div>

              <textarea className="w-full border p-3 text-xs bg-stone-50 outline-none h-20" placeholder="Book Summary..." value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} />

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button type="submit" className="flex-[2] bg-black text-white py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all rounded-sm shadow-md">
                  {loading ? "Saving..." : editingId ? "Update Record" : "Save Entry"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="flex-1 border border-stone-200 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors rounded-sm">Cancel</button>
                )}
              </div>
            </form>
          </section>

          {/* LIST SECTION */}
          <section className="lg:col-span-7 space-y-4 order-2 lg:order-2">
            <h3 className="text-[10px] font-black uppercase text-stone-400 italic tracking-widest">Recent Inventory ({books.length})</h3>
            <div className="grid gap-3">
              {books.map(book => (
                <div key={book.id} className="relative bg-white p-3 md:p-4 flex gap-3 md:gap-4 border border-stone-200 shadow-sm items-center transition-all overflow-hidden">
                  {/* Bestseller Badge in list */}
                  {book.is_bestseller && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-sm shadow-sm">Bestseller</div>
                  )}
                  
                  <img src={book.image_url} className="w-12 h-16 md:w-14 md:h-20 object-cover rounded-sm shadow-sm shrink-0" alt={book.title} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm md:text-base font-bold text-stone-800 truncate">{book.title}</h4>
                    <p className="text-[9px] text-teal-600 font-bold uppercase tracking-tighter truncate">{book.authors?.name || "Unknown Author"}</p>
                    <p className="font-bold text-stone-900 mt-0.5 text-xs md:text-sm">₹{book.price} <span className="ml-2 text-[9px] text-stone-400 font-normal">Stock: {book.stock_count || 0}</span></p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-end md:items-center">
                    <button className="text-stone-400 text-[10px] font-black uppercase hover:text-teal-600" onClick={() => { setForm(book); setEditingId(book.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      Edit
                    </button>
                    <button className="text-red-400 text-[10px] font-black uppercase hover:text-red-600" onClick={() => handleDelete(book.id)}>
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* AUTHOR MODAL */}
      {showAuthorModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 md:p-8 max-w-md w-full shadow-2xl border border-stone-200 rounded-sm overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h2 className="font-serif text-xl md:text-2xl italic">{editingAuthorId ? "Update Author" : "New Author"}</h2>
                  <p className="text-[9px] font-bold uppercase text-stone-400 tracking-widest">Archive</p>
                </div>
                <button onClick={() => setShowAuthorModal(false)} className="text-2xl text-stone-300 hover:text-stone-900 transition-colors">×</button>
            </div>
            
            <div className="space-y-5">
              <div className="max-w-[120px] mx-auto">
                <ImageCapture label="Portrait" onUpload={(url) => setNewAuthor({...newAuthor, profile_image_url: url})} />
              </div>
              <input className="w-full border-b py-2 text-lg font-serif outline-none bg-transparent" placeholder="Full Name" value={newAuthor.name || ""} onChange={e => setNewAuthor({...newAuthor, name: e.target.value})} />
              <textarea className="w-full border p-3 text-xs bg-stone-50 h-24 outline-none" placeholder="Biography..." value={newAuthor.bio || ""} onChange={e => setNewAuthor({...newAuthor, bio: e.target.value})} />
              
              <div className="flex gap-2 pt-4">
                <button onClick={handleQuickAddAuthor} className="flex-1 bg-teal-600 text-white py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm active:opacity-80">
                  {saveLoading ? "Wait..." : "Save"}
                </button>
                <button onClick={() => setShowAuthorModal(false)} className="flex-1 border border-stone-200 py-3 text-[10px] font-bold uppercase text-stone-400 rounded-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}