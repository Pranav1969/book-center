"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import ImageCapture from "@/components/ImageCapture";
import Link from "next/link";

const INITIAL_CAMPAIGN = {
  title: "",
  description: "",
  image_url: "",
  button_text: "Explore Now",
  target_url: "",
  is_active: false
};

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [form, setForm] = useState(INITIAL_CAMPAIGN);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    const { data } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
    setCampaigns(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = editingId 
      ? await supabase.from("campaigns").update(form).eq("id", editingId)
      : await supabase.from("campaigns").insert([form]);

    if (!error) {
      setForm(INITIAL_CAMPAIGN);
      setEditingId(null);
      fetchCampaigns();
      alert("Campaign Saved!");
    } else {
      alert(error.message);
    }
    setLoading(false);
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    // Optional: Turn off all others if you only want one active at a time
    if (!currentStatus) {
      await supabase.from("campaigns").update({ is_active: false }).neq("id", id);
    }
    
    const { error } = await supabase.from("campaigns").update({ is_active: !currentStatus }).eq("id", id);
    if (!error) fetchCampaigns();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this campaign?")) return;
    await supabase.from("campaigns").delete().eq("id", id);
    fetchCampaigns();
  }

  return (
    <div className="p-4 md:p-8 bg-stone-50 min-h-screen text-stone-900 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 pb-6 border-b">
          <h1 className="text-2xl font-serif font-bold italic">Campaign Manager</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Special Occasions & Festivals</p>
          <Link href="/admin" className="text-[10px] font-bold uppercase mt-4 inline-block border-b border-stone-900">← Back to Dashboard</Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* FORM */}
          <section className="lg:col-span-5 bg-white p-6 border rounded shadow-sm h-fit sticky top-8">
            <h2 className="text-[10px] font-black uppercase text-teal-600 mb-6">{editingId ? "Edit Campaign" : "New Occasion"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageCapture label="Promotion Banner" onUpload={(url) => setForm({...form, image_url: url})} />
              <input className="w-full border-b py-2 font-serif outline-none" placeholder="Event Title (e.g. Diwali Special)" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              <textarea className="w-full border p-3 text-xs bg-stone-50 h-24 outline-none" placeholder="Description/Offer details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input className="border-b py-2 text-xs outline-none" placeholder="Button Text" value={form.button_text} onChange={e => setForm({...form, button_text: e.target.value})} />
                <input className="border-b py-2 text-xs outline-none" placeholder="Target URL (e.g. /category/History)" value={form.target_url} onChange={e => setForm({...form, target_url: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-stone-900 text-white py-4 text-[11px] font-bold uppercase tracking-widest rounded">
                {loading ? "Saving..." : "Save Campaign"}
              </button>
              {editingId && <button type="button" onClick={() => {setEditingId(null); setForm(INITIAL_CAMPAIGN);}} className="w-full text-[10px] font-bold uppercase text-stone-400 mt-2">Cancel Edit</button>}
            </form>
          </section>

          {/* LIST */}
          <section className="lg:col-span-7 space-y-4">
            {campaigns.map(c => (
              <div key={c.id} className={`bg-white border p-4 flex gap-4 items-center transition-all ${c.is_active ? 'border-teal-500 ring-1 ring-teal-500' : 'border-stone-200'}`}>
                <img src={c.image_url} className="w-24 h-16 object-cover rounded bg-stone-100" />
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-sm">{c.title}</h3>
                  <p className="text-[10px] text-stone-400 line-clamp-1">{c.description}</p>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => toggleActive(c.id, c.is_active)} className={`text-[9px] font-black uppercase px-2 py-1 rounded ${c.is_active ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                      {c.is_active ? "Live" : "Draft"}
                    </button>
                    <button onClick={() => {setForm(c); setEditingId(c.id);}} className="text-[9px] font-black uppercase text-stone-400 hover:text-stone-900">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-[9px] font-black uppercase text-red-400">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}