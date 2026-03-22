"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import ImageCapture from "@/components/ImageCapture";
import Link from "next/link";

export default function AuthorAdmin() {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // ✅ Initialize with empty strings to prevent the "null" warning
  const [form, setForm] = useState({ id: "", name: "", bio: "", profile_image_url: "" });

  useEffect(() => { fetchAuthors(); }, []);

  async function fetchAuthors() {
    const { data } = await supabase.from("authors").select("*").order("name");
    setAuthors(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Create a payload removing 'id' if it's an empty string (for new entries)
    const payload: any = { 
        name: form.name, 
        bio: form.bio, 
        profile_image_url: form.profile_image_url 
    };
    if (form.id) payload.id = form.id;

    const { error } = await supabase.from("authors").upsert([payload]);
    
    if (error) {
        alert(error.message);
    } else {
      setForm({ id: "", name: "", bio: "", profile_image_url: "" });
      fetchAuthors();
      alert("Author Profile Synchronized!");
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto bg-[#fdfcfb] min-h-screen">
      <div className="flex justify-between items-center mb-12 border-b pb-6">
        <div>
            <h1 className="font-serif text-4xl italic">Author Registry</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Master Encyclopedia Data</p>
        </div>
        <Link href="/admin" className="text-[10px] font-bold uppercase border px-6 py-2 rounded-full hover:bg-stone-900 hover:text-white transition-all">
          Back to Inventory
        </Link>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-12">
        {/* LEFT: FORM */}
        <form onSubmit={handleSubmit} className="bg-white p-8 border border-stone-200 shadow-sm space-y-6 h-fit sticky top-8">
          <h2 className="text-[10px] font-black uppercase text-teal-600 mb-4 border-b pb-2">Profile Editor</h2>
          
          <div className="max-w-[200px] mx-auto">
            <ImageCapture 
                label="Author Portrait" 
                onUpload={(url) => setForm({...form, profile_image_url: url})} 
            />
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-bold uppercase text-stone-400">Full Name</label>
            <input 
              className="w-full border-b py-2 text-xl font-serif outline-none bg-transparent" 
              placeholder="e.g. Leo Tolstoy"
              value={form.name || ""} // ✅ Fix: Fallback to empty string
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-bold uppercase text-stone-400">Biography</label>
            <textarea 
              className="w-full border p-4 text-sm bg-stone-50 h-48 leading-relaxed outline-none focus:border-stone-400 transition-colors" 
              placeholder="Write the life story and achievements..."
              value={form.bio || ""} // ✅ Fix: Fallback to empty string
              onChange={e => setForm({...form, bio: e.target.value})}
            />
          </div>

          <button className="w-full bg-stone-900 text-white py-4 uppercase text-[10px] font-bold tracking-widest hover:bg-teal-700 transition-all">
            {loading ? "Saving..." : form.id ? "Update Profile" : "Create Profile"}
          </button>
          
          {form.id && (
              <button 
                type="button"
                onClick={() => setForm({ id: "", name: "", bio: "", profile_image_url: "" })}
                className="w-full text-[9px] font-bold uppercase text-stone-400 hover:text-red-500"
              >
                Cancel Edit
              </button>
          )}
        </form>

        {/* RIGHT: LIST */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase text-stone-400 mb-4 italic">Registered Authors ({authors.length})</h2>
          <div className="grid gap-4">
            {authors.map(a => (
              <div key={a.id} className="flex gap-4 items-center bg-white p-4 border border-stone-100 shadow-sm group">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-stone-100 flex-shrink-0">
                    <img src={a.profile_image_url || `https://ui-avatars.com/api/?name=${a.name}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-serif text-lg text-stone-800">{a.name}</p>
                  <p className="text-[10px] text-stone-400 line-clamp-1 italic uppercase tracking-tighter">
                    {a.bio ? "Bio Available" : "No Bio Written"}
                  </p>
                </div>
                <button 
                    onClick={() => {
                        setForm(a);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="opacity-0 group-hover:opacity-100 bg-stone-50 text-stone-900 px-4 py-2 text-[10px] font-bold uppercase rounded transition-all"
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