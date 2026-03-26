"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Inventory", href: "/admin/inventory", icon: "📦" },
    { name: "Orders", href: "/admin/orders", icon: "📜" },
  ];

  return (
    <div className="flex min-h-screen bg-[#05010d] text-gray-300 flex-col md:flex-row selection:bg-purple-500/30">

      {/* 📱 MOBILE NAVIGATION (Slim Luxe) */}
      <div className="md:hidden sticky top-0 z-[70] bg-[#0a0515]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex flex-col">
           <span className="font-serif italic text-white text-sm">Vault</span>
           <span className="text-[6px] uppercase tracking-[0.4em] text-purple-500 font-black">Admin Terminal</span>
        </div>
        <div className="flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative text-[10px] uppercase font-black tracking-widest transition-colors duration-500 ${
                pathname === item.href ? "text-purple-400" : "text-gray-600"
              }`}
            >
              {item.name}
              {pathname === item.href && (
                <motion.div layoutId="mobileNav" className="absolute -bottom-1 left-0 right-0 h-[1px] bg-purple-500" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* 🖥️ DESKTOP SIDEBAR (Obsidian Command) */}
      <aside className="w-72 bg-[#0a0515] border-r border-white/5 hidden md:flex flex-col p-8 sticky top-0 h-screen">
        <div className="mb-12 group cursor-default">
          <h2 className="font-serif text-2xl italic text-white leading-none">
            Karuna
          </h2>
          <p className="text-[8px] font-black uppercase tracking-[0.6em] text-purple-600 mt-1 group-hover:text-purple-400 transition-colors">
            Administrative Vault
          </p>
        </div>

        <nav className="space-y-4 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative group flex items-center px-4 py-4 overflow-hidden rounded-xl transition-all duration-500"
              >
                {/* Active Background Glow */}
                {isActive && (
                  <motion.div 
                    layoutId="sidebarGlow"
                    className="absolute inset-0 bg-white/[0.03] border border-white/10 rounded-xl"
                  />
                )}
                
                <span className={`relative z-10 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${
                  isActive ? "text-white translate-x-2" : "text-gray-500 group-hover:text-gray-300"
                }`}>
                  {isActive && <span className="mr-3 text-purple-500">•</span>}
                  {item.name}
                </span>

                {/* Hover Line */}
                {!isActive && (
                  <div className="absolute left-0 w-0.5 h-0 bg-purple-500 group-hover:h-1/2 transition-all duration-500 top-1/2 -translate-y-1/2" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="pt-8 border-t border-white/5">
          <Link href="/" className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 hover:text-purple-400 transition-colors">
            ← Exit to Store
          </Link>
        </div>
      </aside>

      {/* 📥 MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 bg-[#05010d] md:px-12 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}