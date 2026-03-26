"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import ImageCapture from "@/components/ImageCapture";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
    
    const { authors: nestedAuthors, id, created_at, ...cleanFormData } = form as any;
    
    const payload = { 
      ...cleanFormData, 
      price: Number(form.price), 
      discount_percent: Number(form.discount_percent), 
      stock_count: Number(form.stock_count),
      is_bestseller: Boolean(form.is_bestseller)
    };

    const { error } = editingId 
      ? await supabase.from("books").update(payload).eq("id", editingId)
      : await supabase.from("books").insert([payload]);

    if (!error) {
      resetForm();
      fetchData();
      alert(editingId ? "Masterpiece Updated!" : "New Masterpiece Added!");
    } else alert(error.message);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this work?")) return;
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (!error) fetchData();
  }

  return (
    <div className="min-h-screen bg-[#05010d] text-gray-200 selection:bg-purple-500/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* 🏛 LUXURY HEADER */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500 mb-2">Internal Curation</p>
              <h1 className="text-4xl md:text-5xl font-serif italic text-white tracking-tighter">Archive Control</h1>
            </div>
            
            <nav className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full overflow-x-auto no-scrollbar max-w-full">
              {[
                { label: "Inventory", href: "/admin", active: true },
                { label: "Stock", href: "/admin/stock" },
                { label: "Banners", href: "/admin/banners" },
                { label: "Authors", href: "/admin/authors" },
                { label: "Campaigns", href: "/admin/campaigns" }
              ].map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    item.active ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* 🖋 FORM SECTION (GLASSMorphism) */}
          <section className="lg:col-span-5 order-1">
            <div className="sticky top-8 bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 mb-8 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-purple-500/50" />
                {editingId ? "Modify Record" : "New Library Entry"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <ImageCapture label="Cover Art" onUpload={(url) => setForm({...form, image_url: url})} />
                  <ImageCapture label="Reverse" onUpload={(url) => setForm({...form, back_image_url: url})} />
                </div>

                <div className="space-y-6">
                  <div className="group border-b border-white/10 focus-within:border-purple-500 transition-colors">
                    <label className="text-[9px] font-bold uppercase text-gray-500 tracking-widest">Masterpiece Title</label>
                    <input 
                      className="w-full py-2 text-xl font-serif bg-transparent outline-none text-white placeholder:text-gray-700" 
                      placeholder="e.g. The Sovereign" 
                      value={form.title || ""} 
                      onChange={e => setForm({...form, title: e.target.value})} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase text-gray-500 tracking-widest">The Author</label>
                    <div className="flex gap-3">
                      <select 
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors appearance-none" 
                        value={form.author_id || ""} 
                        onChange={(e) => setForm({...form, author_id: e.target.value, author: authors.find(a => a.id === e.target.value)?.name || ""})} 
                        required
                      >
                        <option value="" className="bg-[#05010d]">Select Author...</option>
                        {authors.map(a => <option key={a.id} value={a.id} className="bg-[#05010d]">{a.name}</option>)}
                      </select>
                      <button type="button" onClick={() => { setEditingAuthorId(null); setNewAuthor(INITIAL_AUTHOR); setShowAuthorModal(true); }} className="px-4 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl text-[10px] font-bold uppercase hover:bg-purple-600 hover:text-white transition-all">
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="group border-b border-white/10">
                      <label className="text-[9px] font-bold text-gray-500 uppercase">Valuation (₹)</label>
                      <input type="number" value={form.price || ""} onChange={e => setForm({...form, price: e.target.value})} className="w-full py-2 bg-transparent text-lg font-bold outline-none text-white" required />
                    </div>
                    <div className="group border-b border-white/10">
                      <label className="text-[9px] font-bold text-gray-500 uppercase">Privilege (%)</label>
                      <input type="number" value={form.discount_percent || 0} onChange={e => setForm({...form, discount_percent: Number(e.target.value)})} className="w-full py-2 bg-transparent text-lg font-bold outline-none text-purple-400" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-purple-600/5 rounded-2xl border border-purple-500/20">
                    <input 
                      type="checkbox" 
                      id="bestseller"
                      checked={form.is_bestseller || false}
                      onChange={e => setForm({...form, is_bestseller: e.target.checked})}
                      className="w-5 h-5 accent-purple-600 rounded"
                    />
                    <label htmlFor="bestseller" className="text-[10px] font-black uppercase tracking-widest text-white cursor-pointer">Recognized Bestseller</label>
                  </div>

                  {/* 📦 STOCK CONTROL */}
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Inventory Count</span>
                      <span className="text-3xl font-serif italic text-purple-500">{form.stock_count}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <button type="button" onClick={() => handleStockAdjustment(-1)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-xl">－</button>
                      <input 
                        type="number" 
                        value={form.stock_count} 
                        onChange={e => setForm({...form, stock_count: Number(e.target.value)})}
                        className="flex-1 bg-transparent text-center text-2xl font-serif outline-none"
                      />
                      <button type="button" onClick={() => handleStockAdjustment(1)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-xl">＋</button>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Quick Bulk Add..." 
                        value={quickStockAdd}
                        onChange={(e) => setQuickStockAdd(e.target.value)}
                        className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-xs outline-none border border-white/5"
                      />
                      <button type="button" onClick={applyQuickStock} className="px-4 py-2 bg-white text-black rounded-xl text-[9px] font-bold uppercase hover:bg-purple-600 hover:text-white transition-all">Add</button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-[2] bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all shadow-xl">
                    {loading ? "Archiving..." : editingId ? "Update Masterpiece" : "Finalize Entry"}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetForm} className="flex-1 border border-white/10 rounded-2xl text-[10px] font-bold uppercase hover:bg-white/5 transition-all">Discard</button>
                  )}
                </div>
              </form>
            </div>
          </section>

          {/* 📚 ARCHIVE LIST */}
          <section className="lg:col-span-7 space-y-6 order-2">
            <div className="flex justify-between items-end mb-8">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">Collection Archive ({books.length})</h3>
            </div>

            <div className="grid gap-4">
              {books.map(book => (
                <div key={book.id} className="group relative bg-white/[0.02] hover:bg-white/[0.05] p-4 rounded-3xl border border-white/5 flex gap-6 items-center transition-all duration-500">
                  <div className="relative shrink-0">
                    <img src={book.image_url} className="w-16 h-24 md:w-20 md:h-28 object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-500" alt={book.title} />
                    {book.is_bestseller && (
                      <div className="absolute -top-2 -left-2 bg-purple-600 text-[7px] font-black px-2 py-1 rounded-md shadow-lg rotate-[-10deg]">BESTSELLER</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-purple-500 uppercase tracking-widest mb-1">{book.authors?.name || "Unknown Author"}</p>
                    <h4 className="font-serif text-lg md:text-xl text-white truncate mb-1">{book.title}</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-white">₹{book.price}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${book.stock_count > 10 ? 'border-emerald-500/20 text-emerald-500' : 'border-red-500/20 text-red-500'}`}>
                        {book.stock_count} in stock
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 bg-white/5 rounded-full hover:bg-purple-600 transition-colors" onClick={() => { setForm(book); setEditingId(book.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button className="p-3 bg-white/5 rounded-full hover:bg-red-600 transition-colors" onClick={() => handleDelete(book.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* 🎭 AUTHOR MODAL (Glassmorphism Overlay) */}
      <AnimatePresence>
        {showAuthorModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0d071a] border border-white/10 p-8 max-w-md w-full rounded-[2.5rem] shadow-[0_0_50px_rgba(168,85,247,0.15)]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-serif text-2xl italic text-white">{editingAuthorId ? "Update Profile" : "New Contributor"}</h2>
                <button onClick={() => setShowAuthorModal(false)} className="text-3xl text-gray-500 hover:text-white">×</button>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-center">
                   <div className="w-24 h-24 rounded-full overflow-hidden border border-purple-500/30">
                      <ImageCapture label="Portrait" onUpload={(url) => setNewAuthor({...newAuthor, profile_image_url: url})} />
                   </div>
                </div>
                <input className="w-full bg-white/5 border-b border-white/10 py-3 px-4 rounded-t-xl outline-none font-serif text-lg text-white" placeholder="Name of Author" value={newAuthor.name || ""} onChange={e => setNewAuthor({...newAuthor, name: e.target.value})} />
                <textarea className="w-full bg-white/5 border border-white/10 p-4 text-sm rounded-xl outline-none h-32 text-gray-400" placeholder="Biography..." value={newAuthor.bio || ""} onChange={e => setNewAuthor({...newAuthor, bio: e.target.value})} />
                
                <div className="flex gap-3">
                  <button onClick={handleQuickAddAuthor} className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">
                    {saveLoading ? "Syncing..." : "Add to Archive"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}