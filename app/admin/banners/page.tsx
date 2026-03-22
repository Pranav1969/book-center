"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import ImageCapture from "@/components/ImageCapture"; // Reusing your capture component

export default function BannerManager() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchBanners(); }, []);

  async function fetchBanners() {
    const { data } = await supabase.from("banners").select("*").order("priority", { ascending: true });
    setBanners(data || []);
  }

  async function addBanner(url: string) {
    setLoading(true);
    const { error } = await supabase.from("banners").insert([{ 
      image_url: url, 
      title: "New Promotion", 
      priority: banners.length 
    }]);
    if (error) alert(error.message);
    else fetchBanners();
    setLoading(false);
  }

  async function deleteBanner(id: string) {
    await supabase.from("banners").delete().eq("id", id);
    fetchBanners();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-serif text-2xl mb-8">Hero Banner Manager</h1>
      
      <div className="bg-white p-6 border mb-10">
        <p className="text-[10px] font-bold uppercase mb-4">Upload New Banner (16:9 recommended)</p>
        <ImageCapture label="Select Image" onUpload={addBanner} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="flex gap-4 p-4 bg-white border items-center">
            <img src={b.image_url} className="w-40 h-20 object-cover rounded" />
            <div className="flex-1">
              <p className="text-sm font-bold">{b.title}</p>
              <p className="text-[10px] text-stone-400">Priority: {b.priority}</p>
            </div>
            <button 
              onClick={() => deleteBanner(b.id)}
              className="text-red-500 text-[10px] font-bold uppercase"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}