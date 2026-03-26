"use client";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";

export default function Navbar() {
  const { setIsOpen, cart } = useCart();

  return (
    <nav className="h-20 border-b border-white/5 bg-[#05010d]/80 backdrop-blur-xl sticky top-0 z-[60] px-6 transition-all duration-500">
      <div className="max-w-7xl mx-auto h-full flex justify-between items-center">
        
        {/* --- BRAND LOGOTYPE --- */}
        <Link href="/" className="group flex flex-col">
          <span className="font-serif font-black text-2xl tracking-tighter text-white group-hover:text-purple-400 transition-colors duration-500 italic">
            Anushiva's
          </span>
          <span className="text-[7px] font-black uppercase tracking-[0.6em] text-purple-600 -mt-1 group-hover:tracking-[0.8em] transition-all duration-700">
            Karuna Luxe
          </span>
        </Link>
        
        {/* --- NAVIGATION ACTIONS --- */}
        <div className="flex items-center gap-8">
          
          <Link 
            href="/admin" 
            className="hidden md:block text-[10px] uppercase tracking-[0.3em] font-black text-gray-500 hover:text-white transition-all duration-300"
          >
            Vault Admin
          </Link>

          {/* --- LUXE CART TRIGGER --- */}
          <button 
            onClick={() => setIsOpen(true)} 
            className="group relative flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-full transition-all duration-500 active:scale-95"
          >
            <span className="text-[9px] uppercase font-black tracking-[0.3em] text-gray-300 group-hover:text-white transition-colors">
              Collection
            </span>
            
            <div className="relative flex items-center justify-center">
              {/* Pulsing indicator if cart has items */}
              {cart.length > 0 && (
                <span className="absolute inset-0 bg-purple-500 rounded-full blur-md opacity-40 animate-pulse" />
              )}
              
              <div className={`
                min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-500
                ${cart.length > 0 
                  ? "bg-purple-600 text-white translate-x-0" 
                  : "bg-gray-800 text-gray-500"
                }
              `}>
                {cart.length}
              </div>
            </div>

            {/* Subtle underline hover effect */}
            <motion.div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-purple-500 group-hover:w-1/3 transition-all duration-500"
            />
          </button>
        </div>
      </div>
    </nav>
  );
}