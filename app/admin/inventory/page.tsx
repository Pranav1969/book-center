"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import ImageCapture from "@/components/ImageCapture"; // Ensure this file exists in your components folder

export default function InventoryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: "", 
    author: "",       // Added Author
    publication: "",  // Added Publication
    description: "",  // Added Description
    price: "", 
    image_url: "", 
    back_image_url: "",
    collection_name: "General", 
    discount_percent: 0, 
    is_featured: false
  });

  useEffect(() => { fetchBooks(); }, []);

  async function fetchBooks() {
    const { data } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    setBooks(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image_url) return alert("Please capture at least the Front Cover!");
    
    setLoading(true);
    
    const payload = { 
      ...form, 
      price: Number(form.price),
      discount_percent: Number(form.discount_percent)
    };

    const { error } = editingId 
      ? await supabase.from("books").update(payload).eq("id", editingId)
      : await supabase.from("books").insert([payload]);

    if (error) {
      alert(error.message);
    } else {
      // RESET FORM
      setForm({ 
        title: "", 
        author: "",
        publication: "",
        description: "",
        price: "", 
        image_url: "", 
        back_image_url: "",
        collection_name: "General", 
        discount_percent: 0, 
        is_featured: false 
      });
      setEditingId(null);
      fetchBooks();
      alert(editingId ? "Book Updated!" : "Book Added to Library!");
    }
    setLoading(false);
  }

  return (
    <div className="p-8 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-serif font-bold italic text-stone-900">Inventory Manager</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Karuna Book Center Admin</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* 1. UPLOAD FORM SECTION */}
          <div className="lg:col-span-5 bg-white p-8 border border-stone-200 shadow-sm rounded-sm h-fit sticky top-8">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-8 border-b pb-2">
              {editingId ? "Editing Record" : "Digital Archive Entry"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* CAMERA SECTION */}
              <div className="grid grid-cols-2 gap-4">
                <ImageCapture 
                  label="Front Cover" 
                  onUpload={(url) => setForm({...form, image_url: url})} 
                />
                <ImageCapture 
                  label="Back Cover" 
                  onUpload={(url) => setForm({...form, back_image_url: url})} 
                />
              </div>

              {/* BASIC INFO */}
              <div className="space-y-4">
                <input 
                  className="w-full border-b border-stone-100 py-2 outline-none text-sm font-serif text-lg placeholder:text-stone-300 focus:border-stone-900 transition-colors" 
                  placeholder="Book Title" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  required 
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    className="w-full border-b border-stone-100 py-2 outline-none text-sm placeholder:text-stone-300 focus:border-stone-900" 
                    placeholder="Author Name" 
                    value={form.author} 
                    onChange={e => setForm({...form, author: e.target.value})} 
                  />
                  <input 
                    className="w-full border-b border-stone-100 py-2 outline-none text-sm placeholder:text-stone-300 focus:border-stone-900" 
                    placeholder="Publication" 
                    value={form.publication} 
                    onChange={e => setForm({...form, publication: e.target.value})} 
                  />
                </div>

                <textarea 
                  className="w-full border border-stone-100 p-3 outline-none text-xs placeholder:text-stone-300 focus:border-stone-900 min-h-[100px] bg-stone-50" 
                  placeholder="Book Description (Synopsis)..." 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Price (INR)</label>
                  <input className="w-full border-b py-2 outline-none text-sm font-bold" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Discount %</label>
                  <input className="w-full border-b py-2 outline-none text-sm font-bold text-red-600" type="number" value={form.discount_percent} onChange={e => setForm({...form, discount_percent: Number(e.target.value)})} />
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Collection Group</label>
                <input className="w-full border-b py-1 outline-none text-sm" placeholder="e.g. UPSC, Literature" value={form.collection_name} onChange={e => setForm({...form, collection_name: e.target.value})} />
              </div>

              <label className="flex items-center gap-3 py-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 accent-stone-900" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} />
                <span className="text-[10px] font-bold uppercase text-stone-500 group-hover:text-stone-900 transition-colors">Mark as Featured (Editor's Choice)</span>
              </label>

              <div className="flex gap-2">
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => { setEditingId(null); setForm({ title: "", author: "", publication: "", description: "", price: "", image_url: "", back_image_url: "", collection_name: "General", discount_percent: 0, is_featured: false }); }}
                    className="flex-1 border border-stone-200 text-stone-400 py-4 font-bold uppercase text-[10px] tracking-widest hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                )}
                <button className="flex-[2] bg-stone-900 text-white py-4 font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-teal-900 shadow-lg transition-all active:scale-95">
                  {loading ? "Processing..." : editingId ? "Update Record" : "Save to Database"}
                </button>
              </div>
            </form>
          </div>

          {/* 2. INVENTORY LIST SECTION */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-baseline border-b border-stone-200 pb-2">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Current Library ({books.length})</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map(book => (
                <div key={book.id} className="bg-white p-4 border border-stone-100 flex gap-4 items-center group relative hover:shadow-md transition-shadow">
                  <div className="relative w-16 h-24 flex-shrink-0">
                    <img src={book.image_url} className="w-full h-full object-cover bg-stone-50 shadow-sm border border-stone-100" />
                    {book.is_featured && <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold truncate text-stone-900">{book.title}</h4>
                    <p className="text-[10px] text-stone-500 mt-1 uppercase tracking-tighter">
                      {book.author || "No Author"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-black text-stone-900">₹{book.price}</span>
                      {book.discount_percent > 0 && (
                        <span className="text-[9px] font-bold text-red-500">-{book.discount_percent}%</span>
                      )}
                    </div>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-stone-100 text-[8px] font-bold uppercase text-stone-500 rounded-full">
                      {book.collection_name}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => { setForm(book); setEditingId(book.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="p-2 text-[10px] font-bold uppercase text-stone-400 hover:text-teal-600 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}