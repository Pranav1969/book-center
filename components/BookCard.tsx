"use client";
import { useCart } from "@/context/CartContext";

export default function BookCard({ book }: { book: any }) {
  const { addToCart } = useCart();

  const hasDiscount = book.discount_percent > 0;
  const discountedPrice = hasDiscount 
    ? book.price - (book.price * book.discount_percent) / 100 
    : book.price;

  return (
    <div className="group flex flex-col h-full bg-white p-2 border border-transparent hover:border-stone-200 transition-all duration-300">
      
      {/* ANIMATED COVER CONTAINER */}
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-200 shadow-sm mb-4">
        
        {/* BACK IMAGE (The one revealed) */}
        <div className="absolute inset-0 z-0">
          {book.back_image_url ? (
            <img 
              src={book.back_image_url} 
              alt="Back Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-800 text-white p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest leading-relaxed">Description on back cover coming soon...</p>
            </div>
          )}
        </div>

        {/* FRONT IMAGE (The one that slides away) */}
        <div className="absolute inset-0 z-10 transform transition-transform duration-700 ease-in-out delay-1000 group-hover:-translate-x-full shadow-lg">
          <img 
            src={book.image_url} 
            alt={book.title}
            className="w-full h-full object-cover"
          />
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-2 py-1 uppercase z-20">
              {book.discount_percent}% OFF
            </div>
          )}
        </div>

        {/* Quick Add Overlay */}
        <button 
          onClick={() => addToCart({ ...book, price: discountedPrice })}
          className="absolute inset-x-0 bottom-0 z-30 bg-stone-900/90 backdrop-blur-sm text-white py-3 text-[10px] font-bold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 delay-[1200ms]"
        >
          Add to Cart
        </button>
      </div>

      {/* TEXT DETAILS */}
      <div className="flex flex-col flex-1 px-1">
        <h4 className="text-[13px] font-bold text-stone-900 leading-tight mb-1 line-clamp-2 group-hover:text-teal-700 transition-colors">
          {book.title}
        </h4>
        
        <div className="mt-auto flex items-center gap-2">
          <span className="text-sm font-black text-stone-900">
            ₹{discountedPrice.toFixed(0)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-stone-400 line-through">
              ₹{book.price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}