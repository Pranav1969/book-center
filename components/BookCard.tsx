"use client";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function BookCard({ id, title, author, price, category, image_url, back_image_url, discount_percent }: any) {
  const { addToCart } = useCart();

  // Logic: Calculate the Sale Price
  const discount = Number(discount_percent) || 0;
  const originalPrice = Number(price);
  const salePrice = originalPrice - (originalPrice * (discount / 100));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents navigating to detail page when clicking "Add"
    addToCart({
      id,
      title,
      price: salePrice, // We save the discounted price to the cart!
      image_url
    });
  };

  return (
    <div className="group relative bg-white border border-stone-100 p-4 transition-all hover:shadow-xl">
      <Link href={`/book/${id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-4">
          {/* Front Cover */}
          <img src={image_url} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          
          {/* Back Cover Reveal */}
          {back_image_url && (
            <img src={back_image_url} alt="Back cover" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-100" />
          )}

          {/* Sale Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-1 uppercase tracking-tighter z-10">
              {discount}% OFF
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold">{category}</p>
          <h3 className="font-serif font-bold text-stone-900 truncate">{title}</h3>
          <p className="text-xs italic text-stone-500">{author}</p>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              {discount > 0 && (
                <span className="text-[10px] text-stone-400 line-through">${originalPrice.toFixed(2)}</span>
              )}
              <span className="text-sm font-black text-stone-900">${salePrice.toFixed(2)}</span>
            </div>
            
            {/* THE ADD BUTTON */}
            <button 
              onClick={handleAddToCart}
              className="bg-stone-900 text-white text-[9px] font-bold uppercase py-2 px-3 hover:bg-teal-800 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}