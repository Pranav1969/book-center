"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Function to toggle order status
  const toggleStatus = async (orderId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      // Refresh local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  if (loading) return (
    <div className="p-20 text-center font-serif italic text-stone-400 animate-pulse">
      Loading order ledger...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfcfb] p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600">Admin Portal</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold italic text-stone-900 mt-2">Customer Orders</h1>
          <p className="text-stone-400 text-xs mt-2 uppercase tracking-widest">Verify UTR and manage fulfillment</p>
        </header>

        <div className="bg-white border border-stone-200 shadow-sm overflow-hidden rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-stone-500">Customer Info</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-stone-500">Items Ordered</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-stone-500 text-right">Revenue</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-stone-500 text-center">Payment & Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-stone-400 italic font-serif">No orders placed yet.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors group">
                    {/* 1. Customer Column */}
                    <td className="p-6 align-top">
                      <div className="space-y-1">
                        <p className="font-serif text-lg font-bold text-stone-900">{order.customer_name}</p>
                        <p className="text-xs font-mono text-teal-700">{order.customer_phone}</p>
                        <p className="text-[11px] text-stone-500 leading-relaxed max-w-[220px] mt-2 italic border-l-2 border-stone-100 pl-3">
                          {order.customer_address}
                        </p>
                      </div>
                    </td>

                    {/* 2. Items Column */}
                    <td className="p-6 align-top">
                      <div className="space-y-2">
                        {order.items?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                            <p className="text-xs text-stone-700 font-medium">
                              {item.title} <span className="text-stone-400 ml-1">× {item.quantity || 1}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* 3. Total Column */}
                    <td className="p-6 align-top text-right">
                      <span className="font-black text-stone-900 text-lg">₹{order.total_amount}</span>
                      <p className="text-[9px] text-stone-400 uppercase mt-1">Total Paid</p>
                    </td>

                    {/* 4. Payment & Status Column */}
                    <td className="p-6 align-top text-center">
                      <div className="flex flex-col items-center gap-3">
                        {/* UTR Badge */}
                        <div className="group/utr relative">
                          <span className="font-mono text-[11px] text-stone-900 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded block tracking-tighter">
                            {order.utr_number || "NO UTR PROVIDED"}
                          </span>
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase text-stone-400 opacity-0 group-hover/utr:opacity-100 transition-opacity">UTR Number</span>
                        </div>

                        {/* Status Toggle Button */}
                        <button 
                          onClick={() => toggleStatus(order.id, order.status)}
                          className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all active:scale-95 ${
                            order.status === 'completed' 
                              ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' 
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {order.status || 'pending'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}