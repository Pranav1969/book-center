"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    category: "",
    description: "",
    image_url: "",
    back_image_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("books").insert([
      {
        ...formData,
        price: parseFloat(formData.price),
      },
    ]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Book added successfully! Check the home page.");
      setFormData({ title: "", author: "", price: "", category: "", description: "", image_url: "", back_image_url: "" });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-sm shadow-sm border border-stone-200">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold">Add New Title</h1>
          <Link href="/" className="text-xs uppercase tracking-widest text-stone-400 hover:text-stone-900 font-bold">
            &larr; View Catalog
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-stone-500">Book Title</label>
              <input required type="text" className="border-stone-200 border p-3 outline-none focus:border-teal-700" 
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-stone-500">Author</label>
              <input required type="text" className="border-stone-200 border p-3 outline-none focus:border-teal-700"
                value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-stone-500">Price (USD)</label>
              <input required type="number" step="0.01" className="border-stone-200 border p-3 outline-none focus:border-teal-700"
                value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-stone-500">Category</label>
              <input required type="text" className="border-stone-200 border p-3 outline-none focus:border-teal-700"
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-bold text-stone-500">Description</label>
            <textarea rows={3} className="border-stone-200 border p-3 outline-none focus:border-teal-700"
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-bold text-stone-500">Front Cover URL</label>
            <input type="text" className="border-stone-200 border p-3 outline-none focus:border-teal-700 text-xs"
              value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-bold text-stone-500">Back Cover URL</label>
            <input type="text" className="border-stone-200 border p-3 outline-none focus:border-teal-700 text-xs"
              value={formData.back_image_url} onChange={(e) => setFormData({...formData, back_image_url: e.target.value})} />
          </div>

          <button disabled={loading} type="submit" className="w-full bg-stone-900 text-white py-4 font-bold uppercase tracking-widest hover:bg-teal-900 transition-colors disabled:bg-stone-400">
            {loading ? "Adding to Shelves..." : "Add Book to Library"}
          </button>

          {message && <p className="text-center text-sm italic text-teal-800 bg-teal-50 p-4">{message}</p>}
        </form>
      </div>
    </main>
  );
}