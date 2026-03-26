"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import ImageCapture from "@/components/ImageCapture";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthorAdmin() {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", bio: "", profile_image_url: "" });

  useEffect(() => { fetchAuthors(); }, []);

  async function fetchAuthors() {
    const { data } = await supabase.from("authors").select("*").order("name");
    setAuthors(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
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
      // Using a more subtle notification style than a browser alert is usually better, 
      // but keeping alert for logic consistency.
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#05010d] text-gray-200 selection:bg-purple-500/30 p-6 md:p-12">
      
      {/* --- HEADER SECTION --- */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6 border-b border-white/5 pb-10">
        <div>
          <h1 className="font-serif text-5xl italic text-white tracking-tighter">Author Registry</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500 mt-2">Executive Curation Suite</p>
        </div>
        <Link 
          href="/admin" 
          className="text-[10px] font-black uppercase tracking-widest border border-white/10 px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-500"
        >
          ← Return to Vault
        </Link>
      </div>
      
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16">
        
        {/* --- LEFT: FLOATING EDITOR --- */}
        <div className="lg:col-span-5">
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit} 
            className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8 sticky top-12"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                {form.id ? "Edit Master Profile" : "New Acquisition"}
              </h2>
              {form.id && (
                <span className="text-[9px] bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-bold uppercase">Active Edit</span>
              )}
            </div>
            
            <div className="flex justify-center">
              <div className="w-32 h-32 relative group">
                <ImageCapture 
                    label="" 
                    onUpload={(url) => setForm({...form, profile_image_url: url})} 
                />
                <div className="absolute -bottom-2 right-0 bg-purple-600 p-2 rounded-full shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Identity</label>
                <input 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-lg font-serif outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-700" 
                  placeholder="Full Name"
                  value={form.name || ""}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Archive Biography</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-light leading-relaxed outline-none focus:border-purple-500/50 transition-all text-gray-300 h-48 resize-none placeholder:text-gray-700" 
                  placeholder="Detail the author's legacy and contributions..."
                  value={form.bio || ""}
                  onChange={e => setForm({...form, bio: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button className="w-full bg-white text-black py-5 rounded-2xl uppercase text-[10px] font-black tracking-[0.3em] hover:bg-purple-600 hover:text-white transition-all duration-500 shadow-xl shadow-purple-500/10">
                {loading ? "Synchronizing..." : form.id ? "Apply Changes" : "Register Author"}
              </button>
              
              <AnimatePresence>
                {form.id && (
                    <motion.button 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      type="button"
                      onClick={() => setForm({ id: "", name: "", bio: "", profile_image_url: "" })}
                      className="w-full text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-red-400 py-2 transition-colors"
                    >
                      Discard Selection
                    </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        </div>

        {/* --- RIGHT: GLOBAL DIRECTORY --- */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">Global Directory</h2>
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] font-serif italic text-purple-400">{authors.length} Registered Entities</span>
          </div>

          <div className="grid gap-4">
            {authors.map((a, idx) => (
              <motion.div 
                key={a.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex gap-6 items-center bg-white/[0.02] hover:bg-white/[0.05] p-5 rounded-3xl border border-white/5 transition-all group"
              >
                <div className="relative w-16 h-16 shrink-0">
                    <img 
                      src={a.profile_image_url || `https://ui-avatars.com/api/?name=${a.name}&background=151025&color=fff`} 
                      className="w-full h-full object-cover rounded-2xl border border-white/10 group-hover:scale-105 transition-transform duration-500" 
                      alt={a.name}
                    />
                    <div className="absolute inset-0 rounded-2xl shadow-inner shadow-black/40" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xl text-white group-hover:text-purple-400 transition-colors">{a.name}</p>
                  <p className="text-[10px] text-gray-500 line-clamp-1 font-light tracking-wide mt-1">
                    {a.bio ? a.bio : "Documentation pending in the archive..."}
                  </p>
                </div>

                <button 
                    onClick={() => {
                        setForm(a);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="px-6 py-3 bg-white/5 hover:bg-white text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black rounded-xl transition-all"
                >
                    Modify
                </button>
              </motion.div>
            ))}
          </div>

          {authors.length === 0 && (
            <div className="py-20 text-center border border-dashed border-white/5 rounded-[3rem]">
              <p className="font-serif italic text-gray-600">The registry is currently vacant.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}