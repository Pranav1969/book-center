"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import ImageCapture from "@/components/ImageCapture";
import Link from "next/link";

export default function InventoryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]); // ✅ Added authors list
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAuthorModal, setShowAuthorModal] = useState(false); // ✅ For new authors
  
  const [newAuthor, setNewAuthor] = useState({ name: "", bio: "" });
  const [form, setForm] = useState({
    title: "", 
    author: "", // Keep for legacy/display
    author_id: "", // ✅ Link to the new table
    publication: "",
    description: "",
    category: "",
    price: "", 
    image_url: "", 
    back_image_url: "",
    collection_name: "General", 
    discount_percent: 0, 
    is_featured: false,
    is_bestseller: false 
  });

  useEffect(() => { 
    fetchBooks(); 
    fetchAuthors();
  }, []);

  async function fetchBooks() {
    const { data } = await supabase.from("books").select("*, authors(name)").order("created_at", { ascending: false });
    setBooks(data || []);
  }

  async function fetchAuthors() {
    const { data } = await supabase.from("authors").select("*").order("name");
    setAuthors(data || []);
  }

  // ✅ Function to quickly add an author if they don't exist
  async function handleQuickAddAuthor() {
    if (!newAuthor.name) return;
    const { data, error } = await supabase.from("authors").insert([newAuthor]).select().single();
    if (error) alert(error.message);
    else {
      setAuthors([...authors, data]);
      setForm({ ...form, author_id: data.id, author: data.name });
      setShowAuthorModal(false);
      setNewAuthor({ name: "", bio: "" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image_url) return alert("Please capture the Front Cover!");
    if (!form.author_id) return alert("Please select or add an Author!");

    setLoading(true);
    const payload = { 
      ...form, 
      price: Number(form.price),
      discount_percent: Number(form.discount_percent)
    };

    const { error } = editingId 
      ? await supabase.from("books").update(payload).eq("id", editingId)
      : await supabase.from("books").insert([payload]);

    if (error) alert(error.message);
    else {
      setForm({ title: "", author: "", author_id: "", publication: "", description: "", category: "", price: "", image_url: "", back_image_url: "", collection_name: "General", discount_percent: 0, is_featured: false, is_bestseller: false });
      setEditingId(null);
      fetchBooks();
      alert("Inventory Updated!");
    }
    setLoading(false);
  }

  return (
    <div className="p-8 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* NAV HEADER */}
        <div className="flex justify-between items-center mb-12 border-b pb-6">
          <div>
            <h1 className="text-4xl font-serif font-bold italic">Admin Panel</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Inventory & Authors</p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/banners" className="text-[10px] font-bold uppercase border px-4 py-2 rounded-full hover:bg-white">Manage Banners</Link>
            <Link href="/admin/authors" className="text-[10px] font-bold uppercase border px-4 py-2 rounded-full hover:bg-white">Author Directory</Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* FORM */}
          <div className="lg:col-span-5 bg-white p-8 border border-stone-200 shadow-sm sticky top-8">
            <h2 className="text-[10px] font-black uppercase text-teal-600 mb-8 border-b pb-2">Book Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <ImageCapture label="Front" onUpload={(url) => setForm({...form, image_url: url})} />
                <ImageCapture label="Back" onUpload={(url) => setForm({...form, back_image_url: url})} />
              </div>

              <input className="w-full border-b py-2 text-lg font-serif outline-none" placeholder="Book Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              
              {/* ✅ SMART AUTHOR SELECTION */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-stone-400">Author</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 border-b py-2 text-sm outline-none bg-transparent"
                    value={form.author_id}
                    onChange={(e) => {
                        const selected = authors.find(a => a.id === e.target.value);
                        setForm({...form, author_id: e.target.value, author: selected?.name || ""});
                    }}
                    required
                  >
                    <option value="">Select an Author</option>
                    {authors.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={() => setShowAuthorModal(true)}
                    className="text-[10px] font-bold bg-stone-100 px-3 py-1 rounded hover:bg-stone-200"
                  >
                    + New
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input className="border-b py-2 text-sm outline-none" placeholder="Publisher" value={form.publication} onChange={e => setForm({...form, publication: e.target.value})} />
                <input className="border-b py-2 text-sm outline-none" placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="border-b py-2" required />
                <input type="number" placeholder="Discount %" value={form.discount_percent} onChange={e => setForm({...form, discount_percent: Number(e.target.value)})} className="border-b py-2 text-red-600" />
              </div>

              <button className="w-full bg-black text-white py-4 text-[11px] font-bold uppercase tracking-widest">
                {loading ? "Saving..." : editingId ? "Update Book" : "Add to Library"}
              </button>
            </form>
          </div>

          {/* LIST */}
          <div className="lg:col-span-7 space-y-4">
            {books.map(book => (
              <div key={book.id} className="bg-white p-4 flex gap-4 border items-center">
                <img src={book.image_url} className="w-12 h-16 object-cover grayscale" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{book.title}</h4>
                  <p className="text-[10px] text-stone-400 uppercase font-bold">{book.authors?.name || book.author}</p>
                </div>
                <button onClick={() => { setForm(book); setEditingId(book.id); window.scrollTo({top:0}); }} className="text-[10px] font-bold text-teal-600">Edit</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ QUICK ADD AUTHOR MODAL */}
      {showAuthorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 max-w-md w-full shadow-2xl">
            <h2 className="font-serif text-2xl mb-4 italic">Register New Author</h2>
            <div className="space-y-4">
              <input 
                className="w-full border-b py-2 outline-none" 
                placeholder="Author's Full Name"
                value={newAuthor.name}
                onChange={e => setNewAuthor({...newAuthor, name: e.target.value})}
              />
              <textarea 
                className="w-full border p-3 text-xs bg-stone-50 h-24" 
                placeholder="Brief Biography..."
                value={newAuthor.bio}
                onChange={e => setNewAuthor({...newAuthor, bio: e.target.value})}
              />
              <div className="flex gap-4">
                <button onClick={handleQuickAddAuthor} className="flex-1 bg-teal-600 text-white py-3 text-[10px] font-bold uppercase">Save Author</button>
                <button onClick={() => setShowAuthorModal(false)} className="flex-1 border py-3 text-[10px] font-bold uppercase">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
//extracha code 