"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function InventoryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // ✅ UPDATED STATE (added back_image_url)
  const [form, setForm] = useState({
    title: "", 
    price: "", 
    image_url: "", 
    back_image_url: "", // 👈 NEW FIELD
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
    setLoading(true);
    
    const payload = { ...form, price: Number(form.price) };

    const { error } = editingId 
      ? await supabase.from("books").update(payload).eq("id", editingId)
      : await supabase.from("books").insert([payload]);

    if (error) alert(error.message);
    else {
      // ✅ RESET FORM (also reset new field)
      setForm({ 
        title: "", 
        price: "", 
        image_url: "", 
        back_image_url: "", // 👈 RESET
        collection_name: "General", 
        discount_percent: 0, 
        is_featured: false 
      });
      setEditingId(null);
      fetchBooks();
    }
    setLoading(false);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold italic">Inventory Manager</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="bg-white p-6 border shadow-sm rounded-sm h-fit">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-6">
            {editingId ? "Edit Details" : "Upload New Book"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="w-full border-b py-2 outline-none text-sm" placeholder="Book Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            
            <input className="w-full border-b py-2 outline-none text-sm" type="number" placeholder="Original Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            
            <input className="w-full border-b py-2 outline-none text-sm" placeholder="Image URL" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} required />

            {/* ✅ NEW INPUT FIELD */}
            <input 
              className="w-full border-b py-2 outline-none text-sm" 
              placeholder="Back Cover Image URL" 
              value={form.back_image_url} 
              onChange={e => setForm({...form, back_image_url: e.target.value})} 
            />

            <div className="pt-2">
              <label className="text-[9px] font-bold text-stone-400 uppercase">Group/Collection (e.g. UPSC, Novels)</label>
              <input className="w-full border-b py-1 outline-none text-sm" value={form.collection_name} onChange={e => setForm({...form, collection_name: e.target.value})} />
            </div>

            <div className="pt-2">
              <label className="text-[9px] font-bold text-stone-400 uppercase">Discount (%)</label>
              <input className="w-full border-b py-1 outline-none text-sm" type="number" value={form.discount_percent} onChange={e => setForm({...form, discount_percent: Number(e.target.value)})} />
            </div>

            <label className="flex items-center gap-2 py-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} />
              <span className="text-[10px] font-bold uppercase text-stone-600">Feature on Homepage Top</span>
            </label>

            <button className="w-full bg-stone-900 text-white py-4 font-bold uppercase text-[10px] tracking-widest">
              {loading ? "Syncing..." : editingId ? "Update Book" : "Add to Library"}
            </button>
          </form>
        </div>

        {/* Inventory List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Current Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map(book => (
              <div key={book.id} className="bg-white p-4 border flex gap-4 items-center group relative">
                <img src={book.image_url} className="w-14 h-20 object-cover bg-stone-50 shadow-sm" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold truncate">{book.title}</h4>
                  <p className="text-[10px] text-stone-500 mt-1">
                    ₹{book.price} | <span className="text-teal-600">Disc: {book.discount_percent}%</span>
                  </p>
                  <p className="text-[9px] text-stone-400 italic">Group: {book.collection_name}</p>
                </div>
                <button 
                  onClick={() => { setForm(book); setEditingId(book.id); }}
                  className="text-[9px] font-bold uppercase text-stone-400 hover:text-stone-900"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}