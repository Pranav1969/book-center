"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

// 1. Define the Order Structure
interface OrderItem {
  id: string;
  title: string;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  items: OrderItem[];
  status: string;
  utr_number?: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch Function
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // 3. Real-time Subscription: Update list automatically when someone pays!
    const subscription = supabase
      .channel("orders_channel")
      .on(
        "postgres_changes",
        { event: "*", table: "orders", schema: "public" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center font-serif italic text-stone-400">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-serif font-bold italic text-stone-900 underline decoration-stone-200 underline-offset-8">
          Order Ledger
        </h1>
        <div className="text-[10px] uppercase tracking-tighter text-stone-400 font-bold">
          Total Orders: {orders.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-stone-900 uppercase text-[10px] font-bold tracking-widest text-stone-400">
              <th className="py-5 px-2">Customer Details</th>
              <th className="py-5">Books Ordered</th>
              <th className="py-5 text-right">Total</th>
              <th className="py-5 text-center">UTR Reference</th>
              <th className="py-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center text-stone-400 italic">
                  No orders recorded yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50 transition-colors group">
                  <td className="py-6 px-2">
                    <p className="font-bold text-stone-900 text-base">{order.customer_name}</p>
                    <p className="text-xs text-stone-500 font-mono mt-1">{order.customer_phone}</p>
                    <p className="text-[10px] text-stone-400 uppercase mt-2 max-w-[200px] leading-relaxed">
                      {order.customer_address}
                    </p>
                  </td>
                  <td className="py-6">
                    <div className="space-y-1">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="text-xs font-medium text-stone-700">
                          • {item.title}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-6 text-right font-black text-stone-900">
                    ₹{Number(order.total_amount).toFixed(2)}
                  </td>
                  <td className="py-6 text-center font-mono text-xs text-stone-500">
                    {order.utr_number || <span className="text-stone-300 italic">None</span>}
                  </td>
                  <td className="py-6 text-right">
                    <span
                      className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}