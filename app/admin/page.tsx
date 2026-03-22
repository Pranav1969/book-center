"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import ImageCapture from "@/components/ImageCapture";
import Link from "next/link";

const INITIAL_FORM = {
  title: "", author: "", author_id: "", publication: "", description: "",
  category: "", price: "", image_url: "", back_image_url: "",
  collection_name: "General", discount_percent: 0, is_featured: false, is_bestseller: false 
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
  };

  async function handleQuickAddAuthor() {
    if (!newAuthor.name) return alert("Author name is required!");
    setSaveLoading(true);
    
    const payload = {
      name: newAuthor.name,
      bio: newAuthor.bio || "",
      profile_image_url: newAuthor.profile_image_url || ""
    };

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
      discount_percent: Number(form.discount_percent) 
    };

    const { error } = editingId 
      ? await supabase.from("books").update(payload).eq("id", editingId)
      : await supabase.from("books").insert([payload]);

    if (!error) {
      resetForm();
      fetchData();
      alert(editingId ? "Book Updated!" : "Book Added!");
    } else {
      console.error("Supabase Error:", error);
      alert(error.message);
    }
    setLoading(false);
  }

  // --- NEW DELETE FUNCTIONALITY ---
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this book? This action cannot be undone.")) return;
    
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (!error) {
      fetchData();
      alert("Book removed from inventory.");
    } else {
      alert(error.message);
    }
  }

  return (
    <div className="p-8 bg-stone-50 min-h-screen font-sans text-stone-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-stone-200">
          <div>
            <h1 className="text-3xl font-serif font-bold italic">Admin Dashboard</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Control Panel</p>
          </div>
          <nav className="flex gap-3 mt-4 md:mt-0">
            <Link href="/admin" className="px-5 py-2 bg-stone-900 text-white text-[10px] font-bold uppercase rounded-full">Inventory</Link>
            <Link href="/admin/banners" className="px-5 py-2 bg-white border text-[10px] font-bold uppercase rounded-full hover:bg-stone-100 transition-colors">Banners</Link>
            <Link href="/admin/authors" className="px-5 py-2 bg-white border text-[10px] font-bold uppercase rounded-full hover:bg-stone-100 transition-colors">Authors</Link>
          </nav>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* FORM SECTION */}
          <section className="lg:col-span-5 bg-white p-8 border border-stone-200 shadow-sm rounded-sm h-fit sticky top-8">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-6 border-b pb-2">
              {editingId ? "Edit Book Record" : "New Library Entry"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <ImageCapture label="Front Cover" onUpload={(url) => setForm({...form, image_url: url})} />
                <ImageCapture label="Back Cover" onUpload={(url) => setForm({...form, back_image_url: url})} />
              </div>

              <input 
                className="w-full border-b py-2 text-lg font-serif outline-none bg-transparent" 
                placeholder="Book Title" 
                value={form.title || ""} 
                onChange={e => setForm({...form, title: e.target.value})} 
                required 
              />
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-stone-400">Author Association</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 border-b py-2 text-sm outline-none bg-transparent" 
                    value={form.author_id || ""} 
                    onChange={(e) => setForm({...form, author_id: e.target.value, author: authors.find(a => a.id === e.target.value)?.name || ""})} 
                    required
                  >
                    <option value="">Select Author...</option>
                    {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  
                  {form.author_id && (
                    <button type="button" onClick={() => {
                      const a = authors.find(a => a.id === form.author_id);
                      setNewAuthor({ name: a.name || "", bio: a.bio || "", profile_image_url: a.profile_image_url || "" });
                      setEditingAuthorId(a.id);
                      setShowAuthorModal(true);
                    }} className="text-[10px] font-bold bg-stone-100 px-3 rounded uppercase hover:bg-stone-200 transition-colors">Edit</button>
                  )}
                  <button type="button" onClick={() => { setEditingAuthorId(null); setNewAuthor(INITIAL_AUTHOR); setShowAuthorModal(true); }} className="text-[10px] font-bold bg-teal-50 text-teal-700 px-3 rounded uppercase hover:bg-teal-100 transition-colors">+ New</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input className="border-b py-2 text-sm outline-none bg-transparent" placeholder="Publisher" value={form.publication || ""} onChange={e => setForm({...form, publication: e.target.value})} />
                <input className="border-b py-2 text-sm outline-none bg-transparent" placeholder="Category" value={form.category || ""} onChange={e => setForm({...form, category: e.target.value})} />
              </div>

              <textarea className="w-full border p-3 text-xs bg-stone-50 outline-none h-20 focus:bg-white transition-colors" placeholder="Book Summary..." value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase">Price (₹)</label>
                  <input type="number" value={form.price || ""} onChange={e => setForm({...form, price: e.target.value})} className="w-full border-b py-2 outline-none bg-transparent font-bold" required />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase">Discount (%)</label>
                  <input type="number" value={form.discount_percent || 0} onChange={e => setForm({...form, discount_percent: Number(e.target.value)})} className="w-full border-b py-2 text-red-600 outline-none bg-transparent font-bold" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-[2] bg-black text-white py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
                  {loading ? "Saving..." : editingId ? "Update Record" : "Save Entry"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="flex-1 border border-stone-200 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors">Cancel</button>
                )}
              </div>
            </form>
          </section>

          {/* LIST SECTION */}
          <section className="lg:col-span-7 space-y-4">
            <h3 className="text-[10px] font-black uppercase text-stone-400 italic tracking-widest">Recent Inventory ({books.length})</h3>
            <div className="grid gap-4">
              {books.map(book => (
                <div key={book.id} className="bg-white p-4 flex gap-4 border border-stone-200 shadow-sm items-center transition-all hover:border-teal-200 group">
                  <img src={book.image_url} className="w-14 h-20 object-cover rounded-sm shadow-sm" alt={book.title} />
                  <div className="flex-1">
                    <h4 className="font-serif text-base font-bold text-stone-800">{book.title}</h4>
                    <p className="text-[10px] text-teal-600 font-bold uppercase tracking-tighter">{book.authors?.name || "Unknown Author"}</p>
                    <p className="font-bold text-stone-900 mt-1">₹{book.price}</p>
                  </div>
                  <div className="flex items-center">
                    <button className="text-stone-400 text-[10px] font-black uppercase hover:text-teal-600 transition-colors" onClick={() => { setForm(book); setEditingId(book.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      Edit
                    </button>
                    {/* DELETE BUTTON ADDED HERE */}
                    <button 
                      className="text-red-400 text-[10px] font-black uppercase hover:text-red-600 ml-4 transition-colors" 
                      onClick={() => handleDelete(book.id)}
                    >
                      Delete
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
          <div className="bg-white p-8 max-w-md w-full shadow-2xl border border-stone-200 rounded-sm">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h2 className="font-serif text-2xl italic">{editingAuthorId ? "Update Author" : "New Author"}</h2>
                  <p className="text-[9px] font-bold uppercase text-stone-400 tracking-widest">Contributor Archive</p>
                </div>
                <button onClick={() => setShowAuthorModal(false)} className="text-2xl text-stone-300 hover:text-stone-900 transition-colors">×</button>
            </div>
            
            <div className="space-y-5">
              <div className="max-w-[140px] mx-auto">
                <ImageCapture label="Portrait" onUpload={(url) => setNewAuthor({...newAuthor, profile_image_url: url})} />
              </div>
              <input className="w-full border-b py-2 text-lg font-serif outline-none bg-transparent" placeholder="Full Name" value={newAuthor.name || ""} onChange={e => setNewAuthor({...newAuthor, name: e.target.value})} />
              <textarea className="w-full border p-3 text-xs bg-stone-50 h-28 outline-none focus:bg-white transition-colors" placeholder="Author Biography..." value={newAuthor.bio || ""} onChange={e => setNewAuthor({...newAuthor, bio: e.target.value})} />
              
              <div className="flex gap-3 pt-4">
                <button onClick={handleQuickAddAuthor} className="flex-1 bg-teal-600 text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-teal-700 transition-colors">
                  {saveLoading ? "Saving..." : "Save Profile"}
                </button>
                <button onClick={() => setShowAuthorModal(false)} className="flex-1 border border-stone-200 py-3 text-[10px] font-bold uppercase text-stone-400 hover:bg-stone-50 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}