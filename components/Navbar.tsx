"use client";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";

export default function Navbar() {
  const { setIsOpen, cart } = useCart();

  return (
    // Height reduced to h-14 (56px) on mobile, h-20 (80px) on desktop
    <nav className="h-14 md:h-20 border-b border-white/5 bg-[#05010d]/80 backdrop-blur-xl sticky top-0 z-[60] px-4 md:px-6 transition-all duration-500">
      <div className="max-w-7xl mx-auto h-full flex justify-between items-center">
        
        {/* --- BRAND LOGOTYPE --- */}
        <Link href="/" className="group flex flex-col">
          {/* Font size scaled: text-lg on mobile, text-2xl on desktop */}
          <span className="font-serif font-black text-lg md:text-2xl tracking-tighter text-white group-hover:text-purple-400 transition-colors duration-500 italic leading-none">
            Anushiva's
          </span>
          <span className="text-[6px] md:text-[7px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-purple-600 mt-0.5 group-hover:tracking-[0.8em] transition-all duration-700">
            Karuna Luxe
          </span>
        </Link>
        
        {/* --- NAVIGATION ACTIONS --- */}
        <div className="flex items-center gap-4 md:gap-8">
          
          <Link 
            href="/admin" 
            className="hidden md:block text-[10px] uppercase tracking-[0.3em] font-black text-gray-500 hover:text-white transition-all duration-300"
          >
            Vault Admin
          </Link>

          {/* --- LUXE CART TRIGGER --- */}
          <button 
            onClick={() => setIsOpen(true)} 
            // Reduced padding for mobile: px-3 py-1.5
            className="group relative flex items-center gap-2 md:gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full transition-all duration-500 active:scale-95"
          >
            <span className="text-[8px] md:text-[9px] uppercase font-black tracking-[0.2em] md:tracking-[0.3em] text-gray-300 group-hover:text-white transition-colors">
              Collection
            </span>
            
            <div className="relative flex items-center justify-center">
              {cart.length > 0 && (
                <span className="absolute inset-0 bg-purple-500 rounded-full blur-md opacity-40 animate-pulse" />
              )}
              
              {/* Badge scaled slightly for mobile */}
              <div className={`
                min-w-[14px] h-[14px] md:min-w-[18px] md:h-[18px] px-1 rounded-full flex items-center justify-center text-[7px] md:text-[9px] font-black transition-all duration-500
                ${cart.length > 0 
                  ? "bg-purple-600 text-white" 
                  : "bg-gray-800 text-gray-500"
                }
              `}>
                {cart.length}
              </div>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}