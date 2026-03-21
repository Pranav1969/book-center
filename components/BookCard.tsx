"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function BookCard({ book }: { book: any }) {
  const { addToCart } = useCart();

  // ✅ SAFE HANDLING (Fix error)
  const discount = Number(book.discount_percent) || 0;
  const price = Number(book.price) || 0;

  const hasDiscount = discount > 0;

  const discountedPrice = hasDiscount 
    ? price - (price * discount) / 100 
    : price;

  return (
    <div className="group flex flex-col h-full bg-white p-2 border border-transparent hover:border-stone-200 transition-all duration-300">
      
      {/* CLICKABLE IMAGE AREA */}
      <Link href={`/book/${book.id}`} className="cursor-pointer">
        <div className="relative aspect-[3/4] overflow-hidden bg-stone-200 shadow-sm mb-4">
          
          {/* BACK IMAGE */}
          <div className="absolute inset-0 z-0">
            {book.back_image_url ? (
              <img 
                src={book.back_image_url} 
                alt="Back Cover" 
                className="w-full h-full object-cover opacity-70"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-800 text-white p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest leading-relaxed">
                  Description on back cover coming soon...
                </p>
              </div>
            )}
          </div>

          {/* FRONT IMAGE */}
          <div className="absolute inset-0 z-10 transform transition-transform duration-700 ease-in-out delay-1000 group-hover:-translate-x-full shadow-lg">
            <img 
              src={book.image_url} 
              alt={book.title}
              className="w-full h-full object-cover"
            />

            {/* DISCOUNT BADGE */}
            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-2 py-1 uppercase z-20">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* QUICK ADD BUTTON */}
          <button 
            onClick={(e) => {
              e.preventDefault(); // prevent navigation
              addToCart({ ...book, price: discountedPrice });
            }}
            className="absolute inset-x-0 bottom-0 z-30 bg-stone-900/90 backdrop-blur-sm text-white py-3 text-[10px] font-bold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 delay-[1200ms]"
          >
            Add to Cart
          </button>
        </div>
      </Link>

      {/* TEXT SECTION */}
      <div className="flex flex-col flex-1 px-1">
        
        {/* TITLE */}
        <Link href={`/book/${book.id}`}>
          <h4 className="text-[13px] font-bold text-stone-900 leading-tight mb-1 line-clamp-2 group-hover:text-teal-700 transition-colors cursor-pointer hover:underline">
            {book.title}
          </h4>
        </Link>

        {/* AUTHOR */}
        <p className="text-[11px] text-stone-500 italic mb-2">
          {book.author}
        </p>
        
        {/* PRICE */}
        <div className="mt-auto flex items-center gap-2">
          <span className="text-sm font-black text-stone-900">
            ₹{discountedPrice.toFixed(0)}
          </span>

          {hasDiscount && (
            <span className="text-[10px] text-stone-400 line-through">
              ₹{price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}