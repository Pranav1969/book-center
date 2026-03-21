import { supabase } from "@/app/lib/supabase";
import BookCard from "@/components/BookCard";

export const revalidate = 0;

export default async function Home() {
  // Fetch data
  const { data: allBooks, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return <div className="p-20 text-center font-serif">Error loading library...</div>;

  const featuredBooks = allBooks?.filter((b) => b.is_featured) || [];
  const collections = [...new Set(allBooks?.map((b) => b.collection_name))].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-[#fdfcfb]">
      
      {/* 1. RESTORED: HERO SECTION & SEARCH */}
      <section className="bg-stone-900 text-white pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-7xl mb-6 italic">Karuna Book Center</h1>
          <p className="text-stone-400 uppercase tracking-[0.3em] text-[10px] mb-10">Curating Knowledge, One Page at a Time</p>
          
          {/* Search Bar UI (Visual only for now, logic can be added) */}
          <div className="max-w-2xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Search by title, author, or category..." 
              className="w-full bg-stone-800 border-none py-4 px-6 rounded-full text-sm focus:ring-2 ring-stone-600 outline-none transition-all"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs uppercase">Search</button>
          </div>
        </div>
      </section>

      {/* 2. RESTORED: CATEGORY QUICK-NAV */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-8 whitespace-nowrap">
          <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-stone-900 border-b-2 border-stone-900">All Books</a>
          {collections.map(col => (
            <a 
              key={col} 
              href={`#${col}`} 
              className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
            >
              {col}
            </a>
          ))}
        </div>
      </div>

      {/* 3. RESTORED: FEATURED SLIDER */}
      {featuredBooks.length > 0 && (
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Editor's Choice</span>
              <h2 className="font-serif text-3xl font-bold italic mt-1">Featured This Month</h2>
            </div>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-6 no-scrollbar snap-x">
            {featuredBooks.map((book) => (
              <div key={book.id} className="min-w-[220px] md:min-w-[300px] snap-start">
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. DYNAMIC COLLECTIONS */}
      <div className="max-w-7xl mx-auto px-6 pb-24 space-y-24">
        {collections.map((colName) => (
          <section key={colName} id={colName} className="scroll-mt-28">
            <div className="flex justify-between items-baseline mb-8 border-b border-stone-100 pb-4">
              <h3 className="font-serif text-2xl font-bold text-stone-800">{colName}</h3>
              <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                {allBooks?.filter(b => b.collection_name === colName).length} Books
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
              {allBooks
                ?.filter((b) => b.collection_name === colName)
                .map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
            </div>
          </section>
        ))}
      </div>

      {/* 5. RESTORED: NEWSLETTER / FOOTER */}
      <section className="bg-stone-100 py-20 px-6 text-center border-t border-stone-200">
        <h4 className="font-serif text-2xl italic mb-4 text-stone-800">Join the Reader's Circle</h4>
        <p className="text-stone-500 text-sm mb-8 max-w-md mx-auto">Get updates on new UPSC arrivals and limited time discounts directly in your inbox.</p>
        <div className="flex max-w-md mx-auto gap-2">
          <input type="email" placeholder="Email Address" className="flex-1 bg-white border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-900" />
          <button className="bg-stone-900 text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Join</button>
        </div>
      </section>

    </main>
  );
}