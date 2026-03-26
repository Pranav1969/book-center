"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Update search results whenever query changes
  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  return (
    <div className="max-w-3xl mx-auto relative group px-4">
      
      {/* --- GLOW EFFECT LAYER --- */}
      <div className={`
        absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-fuchsia-500/10 to-purple-900/20 
        rounded-full blur-2xl transition-opacity duration-700
        ${isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-40"}
      `} />

      {/* --- SEARCH CONTAINER --- */}
      <div className="relative flex items-center">
        
        {/* MAGNIFYING ICON */}
        <div className="absolute left-6 text-gray-500 group-hover:text-purple-400 transition-colors duration-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input 
          type="text" 
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Query the archive by title, author, or essence..." 
          className={`
            w-full bg-[#0a0515]/80 backdrop-blur-xl border border-white/5 
            py-5 pl-14 pr-24 rounded-full text-[13px] text-white font-serif italic
            placeholder:text-gray-600 placeholder:italic
            focus:border-purple-500/50 focus:ring-0 outline-none transition-all duration-700
            shadow-2xl shadow-black/50
          `}
        />

        {/* --- DYNAMIC STATUS TAG --- */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <AnimatePresence mode="wait">
            {query.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-400">Scanning</span>
              </motion.div>
            ) : (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500"
              >
                Archive Search
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- BOTTOM FOCUS LINE --- */}
      <div className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-center" />
    </div>
  );
}