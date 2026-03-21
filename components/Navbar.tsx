"use client";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { setIsOpen, cart } = useCart();

  return (
    <nav className="h-16 border-b border-stone-200 bg-white/70 backdrop-blur-md sticky top-0 z-[60] px-6">
      <div className="max-w-6xl mx-auto h-full flex justify-between items-center">
        <Link href="/" className="font-serif font-black text-2xl tracking-tighter text-stone-900">Anushiva's</Link>
        
        <div className="flex items-center gap-6">

          
          <button onClick={() => setIsOpen(true)} className="relative bg-stone-100 p-2 px-4 rounded-sm hover:bg-stone-200 transition-all flex gap-2 items-center">
            <span className="text-[10px] uppercase font-bold tracking-widest">Cart</span>
            {cart.length > 0 && (
              <span className="bg-teal-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}