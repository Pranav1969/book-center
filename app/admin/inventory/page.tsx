"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import ImageCapture from "@/components/ImageCapture";

export default function InventoryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: "", 
    author: "",
    publication: "",
    description: "",
    category: "",
    price: "", 
    image_url: "", 
    back_image_url: "",
    collection_name: "General", 
    discount_percent: 0, 
    is_featured: false,
    is_bestseller: false // ✅ ADDED
  });

  useEffect(() => { fetchBooks(); }, []);

  async function fetchBooks() {
    const { data } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

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
      setForm({ 
        title: "", 
        author: "",
        publication: "",
        description: "",
        category: "",
        price: "", 
        image_url: "", 
        back_image_url: "",
        collection_name: "General", 
        discount_percent: 0, 
        is_featured: false,
        is_bestseller: false // ✅ RESET
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
          <h1 className="text-4xl font-serif font-bold italic text-stone-900">
            Inventory Manager
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">
            Karuna Book Center Admin
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* FORM */}
          <div className="lg:col-span-5 bg-white p-8 border border-stone-200 shadow-sm rounded-sm h-fit sticky top-8">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-8 border-b pb-2">
              {editingId ? "Editing Record" : "Digital Archive Entry"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* CAMERA */}
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
                  className="w-full border-b py-2 outline-none text-lg font-serif"
                  placeholder="Book Title" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  required 
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    className="border-b py-2 outline-none text-sm"
                    placeholder="Author Name" 
                    value={form.author} 
                    onChange={e => setForm({...form, author: e.target.value})} 
                  />
                  <input 
                    className="border-b py-2 outline-none text-sm"
                    placeholder="Publication" 
                    value={form.publication} 
                    onChange={e => setForm({...form, publication: e.target.value})} 
                  />
                </div>

                <input 
                  className="w-full border-b py-2 outline-none text-sm"
                  placeholder="Category (e.g. Fiction, UPSC, Kids)"
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                />

                <textarea 
                  className="w-full border p-3 text-xs bg-stone-50"
                  placeholder="Book Description..."
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                />
              </div>

              {/* PRICE */}
              <div className="grid grid-cols-2 gap-6">
                <input type="number" placeholder="Price"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  className="border-b py-2"
                  required
                />
                <input type="number" placeholder="Discount %"
                  value={form.discount_percent}
                  onChange={e => setForm({...form, discount_percent: Number(e.target.value)})}
                  className="border-b py-2 text-red-600"
                />
              </div>

              <input 
                placeholder="Collection"
                value={form.collection_name}
                onChange={e => setForm({...form, collection_name: e.target.value})}
                className="border-b py-2 w-full"
              />

              {/* ✅ BESTSELLER + FEATURED CHECKBOX */}
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-amber-500" 
                    checked={form.is_bestseller} 
                    onChange={e => setForm({...form, is_bestseller: e.target.checked})} 
                  />
                  <span className="text-[10px] font-bold uppercase text-stone-500 group-hover:text-amber-600 transition-colors">
                    Best Seller
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-stone-900" 
                    checked={form.is_featured} 
                    onChange={e => setForm({...form, is_featured: e.target.checked})} 
                  />
                  <span className="text-[10px] font-bold uppercase text-stone-500 group-hover:text-stone-900">
                    Featured
                  </span>
                </label>
              </div>

              <button className="w-full bg-black text-white py-3">
                {loading ? "Processing..." : editingId ? "Update" : "Save"}
              </button>
            </form>
          </div>

          {/* LIST */}
          <div className="lg:col-span-7 grid gap-4">
            {books.map(book => (
              <div key={book.id} className="bg-white p-4 flex gap-4">
                <img src={book.image_url} className="w-16 h-24 object-cover" />
                
                <div className="flex-1">
                  <h4 className="font-bold">{book.title}</h4>
                  <p className="text-xs">{book.author}</p>

                  <p className="text-[10px] text-gray-400 uppercase">
                    {book.category || "No Category"}
                  </p>

                  <p>₹{book.price}</p>
                </div>

                <button onClick={() => {
                  setForm(book);
                  setEditingId(book.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
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