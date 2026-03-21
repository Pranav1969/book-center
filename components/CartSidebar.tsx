"use client";

import { useCart } from "../context/CartContext";
import { QRCodeSVG } from "qrcode.react";
import { useState, useMemo } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

// List of states for the dropdown
const STATES = ["Maharashtra", "Karnataka", "Goa", "Gujarat", "Delhi", "Other"];

export default function CartSidebar() {
  const { cart, removeFromCart, isOpen, setIsOpen, clearCart } = useCart();
  const router = useRouter();

  // States
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    street: "",
    taluka: "",
    district: "",
    state: "Maharashtra", // Default
    pincode: "",
  });
  const [utr, setUtr] = useState("");

  const VPA_ID = "kamblebhimrao81-1@oksbi"; 
  const MERCHANT_NAME = "Karuna Book Center";
  
  const total = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price || 0), 0), [cart]);

  const generateUPILink = () => {
    const amount = total.toFixed(2);
    const note = encodeURIComponent(`Order for ${customer.name}`);
    return `upi://pay?pa=${VPA_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${note}`;
  };

  const handleProceedToPayment = async () => {
    // Validation for all fields
    const { name, phone, street, taluka, district, pincode } = customer;
    if (!name || !phone || !street || !taluka || !district || !pincode) {
      alert("Please fill all shipping details correctly.");
      return;
    }
    
    setLoading(true);
    try {
      // Combine address fields for the database
      const fullAddress = `${street}, Taluka: ${taluka}, Dist: ${district}, ${customer.state} - ${pincode}`;

      const { error } = await supabase.from('orders').insert([{
        customer_name: name,
        customer_phone: phone,
        customer_address: fullAddress, // Saved as one string for the admin view
        total_amount: total,
        items: cart, 
        status: 'pending'
      }]);

      if (error) throw error;
      setStep(2);
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        window.location.href = generateUPILink();
      }
    } catch (error: any) {
      alert("Database Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (utr.trim().length < 12) {
      alert("Please enter 12-digit UTR.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ utr_number: utr.trim(), status: 'completed' })
        .eq('customer_phone', customer.phone)
        .eq('status', 'pending');

      if (error) throw error;
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
      <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col p-6 overflow-hidden animate-in slide-in-from-right">
        
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h2 className="font-serif text-xl font-bold italic text-stone-900">Checkout</h2>
          <button onClick={() => setIsOpen(false)} className="text-[10px] font-bold uppercase text-stone-400">Close</button>
        </div>

        {step === 1 ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              
              {/* Cart Summary */}
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Your Selection</h3>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center border-b border-stone-50 pb-2">
                      <img src={item.image_url} className="w-10 h-12 object-cover" alt="" />
                      <div className="flex-1 text-[11px] font-bold">{item.title}</div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 text-[9px] uppercase">Remove</button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Enhanced Shipping Form */}
              <section className="space-y-4 pt-4 border-t border-stone-100">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Delivery Information</h3>
                
                <input 
                  className="w-full border-b border-stone-200 py-2 text-sm focus:border-stone-900 outline-none" 
                  placeholder="Receiver's Full Name"
                  onChange={(e) => setCustomer({...customer, name: e.target.value})}
                />
                
                <input 
                  className="w-full border-b border-stone-200 py-2 text-sm focus:border-stone-900 outline-none" 
                  placeholder="Mobile Number"
                  onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                />

                <input 
                  className="w-full border-b border-stone-200 py-2 text-sm focus:border-stone-900 outline-none" 
                  placeholder="Flat/House No, Building, Street"
                  onChange={(e) => setCustomer({...customer, street: e.target.value})}
                />

                <div className="grid grid-cols-2 gap-4">
                  <input 
                    className="border-b border-stone-200 py-2 text-sm focus:border-stone-900 outline-none" 
                    placeholder="Taluka"
                    onChange={(e) => setCustomer({...customer, taluka: e.target.value})}
                  />
                  <input 
                    className="border-b border-stone-200 py-2 text-sm focus:border-stone-900 outline-none" 
                    placeholder="District"
                    onChange={(e) => setCustomer({...customer, district: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select 
                    className="border-b border-stone-200 py-2 text-sm bg-transparent outline-none"
                    value={customer.state}
                    onChange={(e) => setCustomer({...customer, state: e.target.value})}
                  >
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input 
                    className="border-b border-stone-200 py-2 text-sm focus:border-stone-900 outline-none" 
                    placeholder="Pincode"
                    maxLength={6}
                    onChange={(e) => setCustomer({...customer, pincode: e.target.value})}
                  />
                </div>
              </section>
            </div>

            <div className="pt-4 border-t mt-4 bg-white">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] uppercase font-bold text-stone-400">Total</span>
                <span className="text-2xl font-black italic text-stone-900">₹{total.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleProceedToPayment}
                className="w-full bg-stone-900 text-white py-4 font-bold uppercase tracking-widest text-xs"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        ) : (
          /* Payment UI remains same */
          <div className="space-y-6">
            <div className="bg-stone-50 p-6 flex flex-col items-center border rounded-sm">
              <p className="text-[10px] font-bold mb-4">SCAN & PAY ₹{total.toFixed(2)}</p>
              <QRCodeSVG value={generateUPILink()} size={160} />
              <p className="mt-4 font-mono text-[10px] text-stone-400">{VPA_ID}</p>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] text-stone-500 uppercase font-bold text-center">Enter 12-Digit UTR Number</p>
              <input 
                className="w-full bg-stone-100 p-4 text-center text-lg font-black tracking-widest outline-none ring-1 ring-stone-900" 
                placeholder="000000000000"
                maxLength={12}
                onChange={(e) => setUtr(e.target.value)}
              />
              <button 
                onClick={handleVerifyPayment}
                className="w-full bg-green-600 text-white py-4 font-bold uppercase text-xs"
              >
                Verify & Complete Order
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}