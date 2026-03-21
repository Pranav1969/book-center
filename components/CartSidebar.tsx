"use client";

import { useCart } from "../context/CartContext";
import { QRCodeSVG } from "qrcode.react";
import { useState, useMemo } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

export default function CartSidebar() {
  const { cart, removeFromCart, isOpen, setIsOpen, clearCart } = useCart();
  const router = useRouter();

  // States
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [utr, setUtr] = useState("");

  // Config - Your UPI Details
  const VPA_ID = "pranavbskamble01@oksbi"; 
  const MERCHANT_NAME = "Karuna Book Center";
  
  // Calculate total price
  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [cart]);

  const generateUPILink = () => {
    const amount = total.toFixed(2);
    const note = encodeURIComponent(`Order for ${customer.name}`);
    return `upi://pay?pa=${VPA_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${note}`;
  };

  // Step 1: Save Order & Move to Payment
  const handleProceedToPayment = async () => {
    if (!customer.name || !customer.phone || !customer.address) {
      alert("Please fill all shipping details first.");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.from('orders').insert([{
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        total_amount: total,
        items: cart, 
        status: 'pending'
      }]);

      if (error) throw error;

      setStep(2);
      
      // Auto-open UPI app on Mobile
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        window.location.href = generateUPILink();
      }
    } catch (error: any) {
      alert("Database Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Finalize with UTR
  const handleVerifyPayment = async () => {
    if (utr.trim().length < 12) {
      alert("Please enter a valid 12-digit UTR number.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ utr_number: utr.trim(), status: 'completed' })
        .eq('customer_phone', customer.phone)
        .eq('status', 'pending');

      if (error) {
        if (error.code === '23505') alert("This Transaction ID is already used!");
        else throw error;
        return;
      }

      clearCart();
      setIsOpen(false);
      router.push("/success");
    } catch (error: any) {
      alert("Verification failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={() => setIsOpen(false)} 
      />
      
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col p-8 overflow-hidden animate-in slide-in-from-right duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="font-serif text-2xl font-bold italic text-stone-900 underline decoration-stone-200 underline-offset-4">Checkout</h2>
          <button onClick={() => setIsOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">Close</button>
        </div>

        {step === 1 ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* 1. SCROLLABLE CONTENT (Books + Form) */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
              
              {/* Item List */}
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Your Selection</h3>
                {cart.length === 0 ? (
                  <p className="text-sm italic text-stone-400 py-10 text-center border border-dashed">Empty Cart</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center group">
                        <div className="w-12 h-16 bg-stone-100 flex-shrink-0">
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[11px] font-bold text-stone-900 leading-tight">{item.title}</h4>
                          <p className="text-[11px] text-stone-500">₹{item.price}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-stone-300 hover:text-red-500 text-[9px] font-bold uppercase">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Shipping Form */}
              <section className="space-y-5 pt-6 border-t border-stone-100">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Shipping Details</h3>
                <input 
                  className="w-full border-b border-stone-200 py-3 text-sm focus:border-stone-900 outline-none transition-all" 
                  placeholder="Full Name"
                  value={customer.name}
                  onChange={(e) => setCustomer({...customer, name: e.target.value})}
                />
                <input 
                  className="w-full border-b border-stone-200 py-3 text-sm focus:border-stone-900 outline-none transition-all" 
                  placeholder="Mobile Number"
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                />
                <textarea 
                  className="w-full border-b border-stone-200 py-3 text-sm focus:border-stone-900 outline-none transition-all min-h-[70px] resize-none" 
                  placeholder="Full Delivery Address"
                  value={customer.address}
                  onChange={(e) => setCustomer({...customer, address: e.target.value})}
                />
              </section>
            </div>

            {/* 2. FIXED BOTTOM ACTION */}
            <div className="pt-6 border-t bg-white">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Total Payable</span>
                <span className="text-2xl font-black text-stone-900">₹{total.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleProceedToPayment}
                disabled={loading || cart.length === 0}
                className="w-full bg-stone-900 text-white py-4 font-bold uppercase tracking-widest hover:bg-stone-800 disabled:bg-stone-100 transition-all shadow-lg"
              >
                {loading ? "Saving Order..." : "Proceed to Payment"}
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: PAYMENT & UTR */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-stone-50 p-6 flex flex-col items-center border border-stone-100 rounded-sm">
              <p className="text-[9px] font-bold uppercase text-stone-500 mb-4 tracking-widest text-center">Scan QR & Pay ₹{total.toFixed(2)}</p>
              <div className="bg-white p-3 shadow-md">
                <QRCodeSVG value={generateUPILink()} size={160} />
              </div>
              <p className="mt-4 font-mono text-[10px] text-stone-400 uppercase select-all tracking-wider">{VPA_ID}</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 tracking-widest">Payment Verification</h3>
                <p className="text-[10px] text-stone-500">Enter the 12-digit **UTR / Ref No.** from your bank app:</p>
              </div>
              
              <input 
                className="w-full bg-stone-100 border-none p-4 text-center text-lg font-black tracking-[0.2em] outline-none focus:ring-1 ring-stone-900 rounded-sm" 
                placeholder="000000000000"
                maxLength={12}
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
              />
              
              <button 
                onClick={handleVerifyPayment}
                disabled={loading || utr.length < 12}
                className="w-full bg-teal-600 text-white py-4 font-bold uppercase tracking-widest hover:bg-teal-700 disabled:bg-stone-100 transition-all shadow-md"
              >
                {loading ? "Verifying..." : "Confirm & Place Order"}
              </button>
              
              <button onClick={() => setStep(1)} className="w-full text-[9px] uppercase font-bold text-stone-400 text-center tracking-widest pt-2 hover:text-stone-600">← Edit Details</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}