"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

interface Props {
  label: string;
  onUpload: (url: string) => void;
}

export default function ImageCapture({ label, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // 1. Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      // 2. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("book-covers")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get the Public URL
      const { data } = supabase.storage
        .from("book-covers")
        .getPublicUrl(filePath);

      setPreview(data.publicUrl);
      onUpload(data.publicUrl); // Pass URL back to the main form
    } catch (error) {
      alert("Error uploading image!");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-stone-200 rounded-lg hover:border-teal-500 transition-colors bg-stone-50">
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{label}</p>
      
      {preview ? (
        <img src={preview} className="w-24 h-32 object-cover rounded shadow-md" alt="Preview" />
      ) : (
        <div className="w-24 h-32 bg-stone-200 rounded flex items-center justify-center">
          <span className="text-2xl">📸</span>
        </div>
      )}

      <label className="cursor-pointer bg-stone-900 text-white text-[10px] px-4 py-2 uppercase font-bold tracking-widest rounded-sm hover:bg-teal-700">
        {uploading ? "Uploading..." : "Take Photo"}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={handleCapture}
          disabled={uploading}
        />
      </label>
    </div>
  );
}