"use client";

import { useState, useEffect } from "react";

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");

  // Update search results whenever query changes
  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  return (
    <div className="max-w-2xl mx-auto relative group">
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title, author, or category..." 
        className="w-full bg-stone-800 border-none py-4 px-6 rounded-full text-sm text-white focus:ring-2 ring-stone-600 outline-none transition-all"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs uppercase pointer-events-none">
        {query.length > 0 ? "Filtering..." : "Search"}
      </div>
    </div>
  );
}