"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

export default function BookCard({ book }: { book: any }) {
  const { addToCart } = useCart();

  // ✅ SAFE HANDLING
  const discount = Number(book.discount_percent) || 0;
  const price = Number(book.price) || 0;
  const hasDiscount = discount > 0;

  const discountedPrice = hasDiscount 
    ? price - (price * discount) / 100 
    : price;

  return (
    <div className="group relative flex flex-col h-full bg-[#0a0515]/40 backdrop-blur-sm border border-white/5 hover:border-purple-500/30 transition-all duration-500 rounded-2xl overflow-hidden p-3 shadow-2xl">
      
      {/* 🖼️ INTERACTIVE COVER AREA */}
      <Link href={`/book/${book.id}`} className="relative aspect-[3/4.2] overflow-hidden rounded-xl bg-[#151025] mb-5 block cursor-pointer">
        
        {/* BACK COVER / REVEAL LAYER */}
        <div className="absolute inset-0 z-0">
          {book.back_image_url ? (
            <img 
              src={book.back_image_url} 
              alt="Back Cover" 
              className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a142e] to-black p-6 text-center">
              <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-light leading-relaxed">
                Manifesto details restricted to internal archive
              </p>
            </div>
          )}
        </div>

        {/* FRONT COVER LAYER */}
        <div className="absolute inset-0 z-10 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-[92%] group-hover:rotate-2 shadow-[20px_0_40px_rgba(0,0,0,0.8)]">
          <img 
            src={book.image_url} 
            alt={book.title}
            className="w-full h-full object-cover shadow-2xl"
          />
          
          {/* LUXE PRIVILEGE BADGE */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-purple-600 text-white text-[8px] font-black px-2 py-1 rounded-sm tracking-tighter z-20 shadow-lg">
              -{discount}%
            </div>
          )}
        </div>

        {/* QUICK ACQUIRE OVERLAY */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40 backdrop-blur-[2px]">
           <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart({ ...book, price: discountedPrice });
            }}
            className="bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-full hover:bg-purple-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
          >
            Acquire Now
          </button>
        </div>
      </Link>

      {/* 🖋️ METADATA SECTION */}
      <div className="flex flex-col flex-1 px-1 pb-2">
        <Link href={`/book/${book.id}`}>
          <h4 className="text-[14px] font-serif italic text-white leading-tight mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors cursor-pointer">
            {book.title}
          </h4>
        </Link>

        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">
          {book.author}
        </p>
        
        {/* PRICING ARCHIVE */}
        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-serif text-white">
              ₹{discountedPrice.toFixed(0)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-gray-600 line-through">
                ₹{price}
              </span>
            )}
          </div>
          
          {/* Subtle "Limited" Indicator */}
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-purple-500/50" />
            <div className="w-1 h-1 rounded-full bg-purple-500/20" />
          </div>
        </div>
      </div>
    </div>
  );
}