"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Inventory", href: "/admin/inventory" },
    { name: "Orders", href: "/admin/orders" },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50 flex-col md:flex-row">

      {/* 🔥 MOBILE NAVBAR */}
      <div className="md:hidden bg-stone-900 text-white px-4 py-3 flex justify-between items-center">
        <h2 className="font-serif text-sm italic text-stone-300">Admin</h2>
        <div className="flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[10px] uppercase font-bold ${
                pathname === item.href ? "text-white" : "text-stone-400"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 🖥️ DESKTOP SIDEBAR */}
      <div className="w-64 bg-stone-900 text-white p-6 hidden md:block">
        <h2 className="font-serif text-xl font-bold mb-8 italic text-stone-400">
          Karuna Admin
        </h2>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-sm text-xs font-bold uppercase tracking-widest ${
                pathname === item.href
                  ? "bg-stone-700 text-white"
                  : "text-stone-500 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}