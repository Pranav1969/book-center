"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import ImageCapture from "@/components/ImageCapture";
import Link from "next/link";

export default function InventoryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null); 
  const [showAuthorModal, setShowAuthorModal] = useState(false); 

  const [newAuthor, setNewAuthor] = useState({ name: "", bio: "", profile_image_url: "" }); 
  
  const [form, setForm] = useState({
    title: "", 
    author: "", 
    author_id: "", 
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
    const { data } = await supabase
      .from("books")
      .select("*, authors(name)")
      .order("created_at", { ascending: false });
    setBooks(data || []);
  }

  async function fetchAuthors() {
    const { data } = await supabase
      .from("authors")
      .select("*")
      .order("name");
    setAuthors(data || []);
  }

  // ✅ Fixed handleQuickAddAuthor to correctly sync state after update
  async function handleQuickAddAuthor() {
    if (!newAuthor.name) return alert("Please enter the author's full name!");
    
    setSaveLoading(true);
    
    const { data, error } = editingAuthorId 
      ? await supabase.from("authors").update(newAuthor).eq("id", editingAuthorId).select().single()
      : await supabase.from("authors").insert([newAuthor]).select().single();

    if (error) {
      alert(error.message);
    } else {
      // Refresh authors list from database to ensure UI is in sync
      const { data: updatedAuthors } = await supabase.from("authors").select("*").order("name");
      setAuthors(updatedAuthors || []);
      
      setForm({ ...form, author_id: data.id, author: data.name });
      setShowAuthorModal(false);
      setNewAuthor({ name: "", bio: "", profile_image_url: "" });
      setEditingAuthorId(null);
      alert(editingAuthorId ? "Author Profile Updated!" : "Author Registered Successfully!");
    }
    setSaveLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image_url) return alert("Please capture at least the Front Cover!");
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

    if (error) {
      alert(error.message);
    } else {
      setForm({ 
        title: "", author: "", author_id: "", publication: "", 
        description: "", category: "", price: "", image_url: "", 
        back_image_url: "", collection_name: "General", 
        discount_percent: 0, is_featured: false, is_bestseller: false 
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
        
        {/* NAVIGATION HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-stone-200 gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold italic text-stone-900">Admin Dashboard</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Karuna Book Center Management</p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/admin" className="px-6 py-2 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
              Inventory Manager
            </Link>
            <Link href="/admin/banners" className="px-6 py-2 bg-white border border-stone-200 text-stone-600 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-stone-100 transition-colors shadow-sm">
              Hero Banners
            </Link>
            <Link href="/admin/authors" className="px-6 py-2 bg-white border border-stone-200 text-stone-600 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-stone-100 transition-colors shadow-sm">
              Author Directory
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* FORM SECTION */}
          <div className="lg:col-span-5 bg-white p-8 border border-stone-200 shadow-sm rounded-sm h-fit sticky top-8">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-8 border-b pb-2">
              {editingId ? "Editing Record" : "Digital Archive Entry"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <ImageCapture label="Front" onUpload={(url) => setForm({...form, image_url: url})} />
                <ImageCapture label="Back" onUpload={(url) => setForm({...form, back_image_url: url})} />
              </div>

              <div className="space-y-4">
                <input 
                  className="w-full border-b py-2 outline-none text-lg font-serif bg-transparent"
                  placeholder="Book Title" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  required 
                />
                
                {/* SELECT AUTHOR */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-stone-400">Select Author</label>
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
                      <option value="">Choose from records...</option>
                      {authors.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    
                    {/* ✅ FIXED: Author Edit Button */}
                    {form.author_id && (
                       <button 
                        type="button"
                        onClick={() => {
                          const authorToEdit = authors.find(a => a.id === form.author_id);
                          if (authorToEdit) {
                            setNewAuthor({ 
                                name: authorToEdit.name || "", 
                                bio: authorToEdit.bio || "", 
                                profile_image_url: authorToEdit.profile_image_url || "" 
                            });
                            setEditingAuthorId(authorToEdit.id);
                            setShowAuthorModal(true);
                          }
                        }}
                        className="text-[10px] font-bold bg-stone-100 px-3 py-1 rounded hover:bg-stone-200 uppercase"
                      >
                        Edit
                      </button>
                    )}

                    <button 
                      type="button"
                      onClick={() => {
                        setEditingAuthorId(null);
                        setNewAuthor({ name: "", bio: "", profile_image_url: "" });
                        setShowAuthorModal(true);
                      }}
                      className="text-[10px] font-bold bg-teal-50 text-teal-700 px-3 py-1 rounded hover:bg-teal-100 uppercase tracking-tighter"
                    >
                      + New
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input className="border-b py-2 outline-none text-sm bg-transparent" placeholder="Publisher" value={form.publication} onChange={e => setForm({...form, publication: e.target.value})} />
                  <input className="border-b py-2 outline-none text-sm bg-transparent" placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                </div>

                <textarea className="w-full border p-3 text-xs bg-stone-50 outline-none" placeholder="Book Description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="border-b py-2 bg-transparent" required />
                <input type="number" placeholder="Discount %" value={form.discount_percent} onChange={e => setForm({...form, discount_percent: Number(e.target.value)})} className="border-b py-2 text-red-600 bg-transparent" />
              </div>

              <button className="w-full bg-black text-white py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
                {loading ? "Processing..." : editingId ? "Update Record" : "Save Entry"}
              </button>
            </form>
          </div>

          {/* LIST SECTION */}
          <div className="lg:col-span-7 grid gap-4 h-fit">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 italic">Recent Inventory ({books.length})</h3>
            {books.map(book => (
              <div key={book.id} className="bg-white p-4 flex gap-4 border border-stone-200 shadow-sm items-center">
                <img src={book.image_url} className="w-16 h-24 object-cover" />
                <div className="flex-1">
                  <h4 className="font-serif text-lg">{book.title}</h4>
                  <p className="text-[10px] text-teal-600 font-bold uppercase tracking-tighter">
                    {book.authors?.name || book.author || "Unknown Author"}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase mt-1">{book.category || "No Category"}</p>
                  <p className="font-bold text-stone-900 mt-2">₹{book.price}</p>
                </div>
                <button 
                  className="text-stone-400 text-[10px] font-black uppercase tracking-widest hover:text-teal-600 transition-colors"
                  onClick={() => {
                    setForm(book);
                    setEditingId(book.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ MODAL WITH NULL-FIXES */}
      {showAuthorModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white p-8 max-w-lg w-full shadow-2xl border border-stone-200 rounded-sm">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
               <div>
                  <h2 className="font-serif text-3xl mb-1 italic">
                    {editingAuthorId ? "Update Author" : "Register Author"}
                  </h2>
                  <p className="text-[9px] font-bold uppercase text-stone-400 tracking-widest">Encyclopedia Entry</p>
               </div>
               <button onClick={() => {setShowAuthorModal(false); setEditingAuthorId(null);}} className="text-xl text-stone-400 hover:text-stone-900">×</button>
            </div>
            
            <div className="space-y-6">
              <div className="max-w-[180px] mx-auto">
                <ImageCapture 
                  label="Author Portrait" 
                  onUpload={(url) => setNewAuthor({...newAuthor, profile_image_url: url})} 
                />
              </div>

              {/* For the Author Name Input */}
              <input 
                className="w-full border-b py-2 outline-none text-lg font-serif bg-transparent" 
                placeholder="Author's Full Name"
                value={newAuthor.name || ""} 
                onChange={e => setNewAuthor({...newAuthor, name: e.target.value})}
              />
              
              {/* For the Biography Textarea */}
              <textarea 
                className="w-full border p-4 text-xs bg-stone-50 h-32 leading-relaxed outline-none focus:border-stone-400" 
                placeholder="Write the biography here..."
                value={newAuthor.bio || ""} // ✅ Ensures value is never null
                onChange={e => setNewAuthor({...newAuthor, bio: e.target.value})}
              />
              
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleQuickAddAuthor} 
                  className="flex-1 bg-teal-600 text-white py-3 text-[10px] font-bold uppercase tracking-widest"
                >
                  {saveLoading ? "Syncing..." : editingAuthorId ? "Update Profile" : "Register Author"}
                </button>
                <button 
                  onClick={() => {setShowAuthorModal(false); setEditingAuthorId(null);}} 
                  className="flex-1 border border-stone-200 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:bg-stone-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}