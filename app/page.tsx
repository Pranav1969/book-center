"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import BookCard from "@/components/BookCard";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  const router = useRouter();
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [user, setUser] = useState<any>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // 🛡️ ENHANCED AUTH & DATA FETCHING
  useEffect(() => {
    async function initializeHome() {
      setLoading(true);

      // 1. Get Session Immediately
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // 2. Check Profile Status with a more flexible query
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .maybeSingle(); // maybeSingle doesn't throw error if empty

        // 3. If Logged in but Profile is incomplete -> Redirect
        if (!profile?.full_name) {
          console.log("Profile incomplete, redirecting...");
          router.push("/setup-profile");
          return; 
        }
      }

      // 4. Fetch the rest of the content
      try {
        const [booksRes, bannersRes, campaignRes] = await Promise.all([
          supabase.from("books").select("*").order("created_at", { ascending: false }),
          supabase.from("banners").select("*").order("priority", { ascending: true }),
          supabase.from("campaigns").select("*").eq("is_active", true).maybeSingle()
        ]);

        setAllBooks(booksRes.data || []);
        setFilteredBooks(booksRes.data || []);
        setBanners(bannersRes.data || []);
        setCampaign(campaignRes.data || null);
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    initializeHome();

    // Listen for Auth changes (Global listener)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user);
        router.refresh();
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push("/"); // Stay on home but update UI
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleProtectedAction = (e: React.MouseEvent, targetPath: string) => {
    if (!user) {
      e.preventDefault();
      router.push("/login");
    } else {
      router.push(targetPath);
    }
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [banners]);

  const resetAll = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setFilteredBooks(allBooks);
  };

  const categories = ["All", ...new Set(allBooks.map((b) => b.category).filter(Boolean))] as string[];

  const applyFilters = useCallback((query: string, category: string) => {
    let baseResults = [...allBooks];
    if (category !== "All") baseResults = baseResults.filter(book => book.category === category);

    if (!query.trim()) {
      setFilteredBooks(baseResults);
      return;
    }

    const q = query.toLowerCase();
    const results = baseResults
      .map(book => {
        let priority = 0;
        if (book.title?.toLowerCase().includes(q)) priority = 4;
        else if (book.author?.toLowerCase().includes(q)) priority = 3;
        else if (book.publication?.toLowerCase().includes(q)) priority = 2;
        return { ...book, priority };
      })
      .filter(book => book.priority > 0)
      .sort((a, b) => b.priority - a.priority);

    setFilteredBooks(results);
  }, [allBooks]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    applyFilters(val, selectedCategory);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#05010d]">
      <div className="relative flex flex-col items-center">
        <div className="w-16 h-16 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="mt-6 font-serif italic text-purple-300/60 tracking-widest text-sm animate-pulse">Curating Luxe...</p>
      </div>
    </div>
  );

  const bestSellers = allBooks.filter(b => b.is_bestseller);
  const collections = [...new Set(filteredBooks.map((b) => b.collection_name))].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-[#05010d] text-gray-200 selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-400 z-[100] origin-left" style={{ scaleX }} />

      <section className="relative h-[70vh] md:h-[95vh] w-full overflow-hidden">
        {/* TOP NAV BUTTONS */}
        <div className="absolute top-6 right-6 z-50 flex gap-4">
          {user && (
            <button 
              onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
              className="px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-all"
            >
              Sign Out
            </button>
          )}
          <Link 
            href={user ? "/profile" : "/login"} 
            className="px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all"
          >
            {user ? "Account" : "Login"}
          </Link>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {banners.length > 0 ? (
              <img src={banners[currentSlide].image_url} alt="Banner" className="w-full h-full object-cover opacity-50" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-950 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#05010d] via-transparent to-transparent md:via-[#05010d]/40" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="w-full max-w-5xl">
            <span className="inline-block px-4 py-1.5 mb-6 text-[9px] md:text-[11px] font-bold tracking-[0.3em] uppercase bg-purple-500/10 backdrop-blur-md border border-white/10 text-purple-300 rounded-full">
              The Sovereign Collection
            </span>
            <h1 className="font-serif text-5xl md:text-[9rem] text-white mb-8 italic leading-[1] tracking-tighter">
              Karuna <span className="text-transparent bg-clip-text bg-gradient-to-b from-purple-200 to-purple-600">Luxe </span> Library
            </h1>
            <div className="max-w-2xl mx-auto relative group px-2">
              <div className="absolute -inset-1 bg-purple-600/20 rounded-2xl blur-lg group-focus-within:opacity-100 opacity-0 transition duration-1000"></div>
              <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <input type="text" value={searchQuery} onChange={onSearchChange} placeholder="Find a masterpiece..." className="w-full bg-transparent py-4 md:py-6 px-6 text-white outline-none placeholder:text-gray-500 text-sm md:text-lg" />
                <button className="mr-2 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CAMPAIGN */}
      {campaign && !searchQuery && selectedCategory === "All" && (
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-7xl mx-auto px-4 -mt-12 md:-mt-24 relative z-30">
          <div className="group relative bg-[#0d071a] rounded-3xl overflow-hidden flex flex-col md:flex-row items-center border border-white/5 shadow-2xl">
            <div className="p-8 md:p-20 md:w-1/2 space-y-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Featured Highlight</span>
              <h2 className="font-serif text-3xl md:text-6xl text-white italic leading-tight">{campaign.title}</h2>
              <p className="text-gray-400 text-sm md:text-lg font-light leading-relaxed">{campaign.description}</p>
              <button onClick={(e) => handleProtectedAction(e, campaign.target_url || "/catalog")} className="bg-white text-black px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">
                {campaign.button_text || "Explore"}
              </button>
            </div>
            <div className="md:w-1/2 w-full h-64 md:h-[500px] overflow-hidden">
              <img src={campaign.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Campaign" />
            </div>
          </div>
        </motion.section>
      )}

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#05010d]/90 backdrop-blur-xl border-b border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center overflow-x-auto no-scrollbar">
          <div className="flex gap-2 py-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => { setSelectedCategory(cat); applyFilters(searchQuery, cat); }} className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* BEST SELLERS */}
      {selectedCategory === "All" && bestSellers.length > 0 && !searchQuery && (
        <section className="py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4 mb-10 md:mb-16">
            <h2 className="font-serif text-3xl md:text-5xl text-white italic">Bestsellers</h2>
            <div className="w-20 h-1 bg-purple-600 mt-4 rounded-full" />
          </div>
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {bestSellers.map((book) => (
              <div key={book.id} onClick={(e) => handleProtectedAction(e, `/book/${book.id}`)} className="cursor-pointer">
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ABOUT */}
      {!searchQuery && selectedCategory === "All" && (
        <section className="py-16 md:py-32 px-4 relative bg-[#080212]">
          <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <span className="text-purple-500 text-[10px] font-black uppercase tracking-[0.5em]">Our Heritage</span>
              <h2 className="font-serif text-4xl md:text-7xl text-white italic mt-6">Where literature meets luxury.</h2>
              <p className="mt-8 text-gray-400 text-sm md:text-xl font-light leading-relaxed max-w-3xl mx-auto">
                Karuna Luxe curates only the finest works, ensuring your personal library reflects a standard of unparalleled excellence.
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        {collections.map((colName) => (
          <motion.section key={colName} className="mb-20" initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer}>
            <div className="flex items-center gap-6 mb-10">
              <h3 className="font-serif text-2xl md:text-4xl italic text-white shrink-0">{colName}</h3>
              <div className="h-[1px] bg-white/10 w-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {filteredBooks.filter((b) => b.collection_name === colName).map((book) => (
                <motion.div key={book.id} variants={fadeInUp} onClick={(e) => handleProtectedAction(e, `/book/${book.id}`)} className="cursor-pointer">
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      <footer className="bg-[#020005] pt-20 pb-10 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h4 className="font-serif text-3xl text-white italic mb-6">Karuna Luxe</h4>
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-700">© 2026 Karuna Book Center • Excellence in Print</p>
        </div>
      </footer>
    </main>
  );
}