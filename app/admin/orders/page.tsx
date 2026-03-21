"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      setOrders(data || []);
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-serif font-bold italic mb-8">Customer Orders</h1>
      <div className="bg-white border rounded-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 border-b">
            <tr>
              <th className="p-4 font-bold uppercase tracking-widest text-stone-400">Customer</th>
              <th className="p-4 font-bold uppercase tracking-widest text-stone-400">Items</th>
              <th className="p-4 font-bold uppercase tracking-widest text-stone-400">Total</th>
              <th className="p-4 font-bold uppercase tracking-widest text-stone-400">UTR / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-stone-900">{order.customer_name}</p>
                  <p className="text-stone-400">{order.customer_phone}</p>
                  <p className="text-[10px] mt-1 text-stone-500 max-w-[200px]">{order.customer_address}</p>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    {order.items?.map((item: any, i: number) => (
                      <p key={i} className="text-stone-600">• {item.title}</p>
                    ))}
                  </div>
                </td>
                <td className="p-4 font-black text-stone-900">₹{order.total_amount}</td>
                <td className="p-4">
                  <span className="font-mono text-stone-900 bg-stone-100 px-2 py-1 rounded-sm block w-fit mb-2">
                    {order.utr_number || "NO UTR"}
                  </span>
                  <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}