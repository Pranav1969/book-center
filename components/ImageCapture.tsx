"use client";
import { useState, useRef } from "react";
import { supabase } from "@/app/lib/supabase";

interface Props {
  label: string;
  onUpload: (url: string) => void;
}

export default function ImageCapture({ label, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- IMAGE PROCESSING LOGIC ---
  const processImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set standard Book Cover dimensions (e.g., 600x800 for 3:4 ratio)
          const targetWidth = 600;
          const targetHeight = 800;
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          if (ctx) {
            // Calculate cropping to maintain 3:4 ratio
            const imgRatio = img.width / img.height;
            const targetRatio = targetWidth / targetHeight;
            let sx, sy, sw, sh;

            if (imgRatio > targetRatio) {
              sh = img.height;
              sw = img.height * targetRatio;
              sx = (img.width - sw) / 2;
              sy = 0;
            } else {
              sw = img.width;
              sh = img.width / targetRatio;
              sx = 0;
              sy = (img.height - sh) / 2;
            }

            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
            canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.8);
          }
        };
      };
    });
  };

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);

      // 1. Process & Crop the image
      const processedBlob = await processImage(file);
      const processedFile = new File([processedBlob], `book-${Date.now()}.jpg`, { type: "image/jpeg" });

      // 2. Upload to Supabase
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("book-covers")
        .upload(fileName, processedFile);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: urlData } = supabase.storage.from("book-covers").getPublicUrl(fileName);

      setPreview(urlData.publicUrl);
      onUpload(urlData.publicUrl);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 border-2 border-dashed border-stone-200 rounded bg-stone-50 group hover:bg-white transition-all">
      <span className="text-[10px] font-bold uppercase text-stone-400 mb-3">{label}</span>
      
      {preview ? (
        <img src={preview} className="w-24 h-32 object-cover mb-3 shadow-md border" alt="Preview" />
      ) : (
        <div className="w-24 h-32 bg-stone-200 flex items-center justify-center mb-3 rounded">
          <span className="text-xl">📖</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-2 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-teal-800"
      >
        {uploading ? "Processing..." : "Select Image"}
      </button>

      {/* Removed 'capture="environment"'. 
         This allows the OS to show Camera, Photo Library, or Browse options.
      */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*" 
        className="hidden"
        onChange={handleFileSelection}
      />
    </div>
  );
}