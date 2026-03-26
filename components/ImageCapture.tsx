"use client";
import { useState, useRef } from "react";
import { supabase } from "@/app/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  label: string;
  onUpload: (url: string) => void;
}

export default function ImageCapture({ label, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOGIC REMAINS IDENTICAL TO PRESERVE FUNCTIONALITY ---
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
          const targetWidth = 600;
          const targetHeight = 800;
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          if (ctx) {
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

      const processedBlob = await processImage(file);
      const processedFile = new File([processedBlob], `book-${Date.now()}.jpg`, { type: "image/jpeg" });

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("book-covers")
        .upload(fileName, processedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("book-covers").getPublicUrl(fileName);
      setPreview(urlData.publicUrl);
      onUpload(urlData.publicUrl);
    } catch (error: any) {
      alert("Vault Access Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[240px] mx-auto group">
      {/* 🖼️ PREVIEW & DROP AREA */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative w-full aspect-[3/4] bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:border-purple-500/50 hover:bg-white/[0.07] group"
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.img 
              key="preview"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              src={preview} 
              className="w-full h-full object-cover" 
              alt="Preview" 
            />
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Scan Asset</p>
                <p className="text-[8px] uppercase tracking-widest text-gray-600 mt-1">3:4 Ratio Optimized</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ⚡ UPLOADING OVERLAY */}
        {uploading && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
               <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
               <span className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">Analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {/* 🏷️ LABEL & CONTROL */}
      <div className="mt-4 text-center w-full">
        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500 mb-4 block">
          {label}
        </label>
        
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 bg-white text-black text-[9px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-500 disabled:opacity-50 active:scale-95 shadow-lg shadow-black/20"
        >
          {preview ? "Replace Specimen" : "Acquire Image"}
        </button>
      </div>

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