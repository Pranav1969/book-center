"use client";

import { useCart } from "../context/CartContext";
import { QRCodeSVG } from "qrcode.react";
import { useState, useMemo } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

const STATES = ["Maharashtra", "Karnataka", "Goa", "Gujarat", "Delhi", "Other"];

export default function CartSidebar() {
  const { cart, removeFromCart, isOpen, setIsOpen, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null); // 👈 TRACK ORDER ID
  const [customer, setCustomer] = useState({
    name: "", phone: "", street: "", taluka: "", district: "", state: "Maharashtra", pincode: "",
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

  // STEP 1: CREATE ORDER
  const handleProceedToPayment = async () => {
    const { name, phone, street, taluka, district, pincode } = customer;
    if (!name || !phone || !street || !taluka || !district || !pincode) {
      alert("Please fill all shipping details.");
      return;
    }
    
    setLoading(true);
    try {
      const fullAddress = `${street}, ${taluka}, ${district}, ${customer.state} - ${pincode}`;

      // We select the inserted data back to get the generated ID
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          customer_name: name,
          customer_phone: phone,
          customer_address: fullAddress,
          total_amount: total,
          items: cart, 
          status: 'pending'
        }])
        .select() // 👈 THIS IS KEY: Gets the ID of the new order
        .single();

      if (error) throw error;
      
      setActiveOrderId(data.id); // 👈 STORE THE ID
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

  // STEP 2: VERIFY WITH UTR
  const handleVerifyPayment = async () => {
    if (utr.trim().length < 12) {
      alert("Please enter a valid 12-digit UTR.");
      return;
    }
    if (!activeOrderId) {
      alert("Order session expired. Please try again.");
      return;
    }

    setLoading(true);
    try {
      // We update specifically by the UNIQUE ID we got in Step 1
      const { error } = await supabase
        .from('orders')
        .update({ 
          utr_number: utr.trim(), 
          status: 'completed' 
        })
        .eq('id', activeOrderId); // 👈 USE THE ID, NOT THE PHONE

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
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col p-6 overflow-hidden">
        
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h2 className="font-serif text-xl font-bold italic">Checkout</h2>
          <button onClick={() => setIsOpen(false)} className="text-[10px] font-bold uppercase text-stone-400">Close</button>
        </div>

        {step === 1 ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Items List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center border-b pb-2">
                    <img src={item.image_url} className="w-10 h-12 object-cover" alt="" />
                    <div className="flex-1 text-[11px] font-bold">{item.title}</div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 text-[9px]">Remove</button>
                  </div>
                ))}
              </div>

              {/* Form Fields */}
              <div className="space-y-4 pt-4 border-t">
                <input className="w-full border-b py-2 text-sm outline-none" placeholder="Full Name" onChange={(e) => setCustomer({...customer, name: e.target.value})} />
                <input className="w-full border-b py-2 text-sm outline-none" placeholder="Phone" onChange={(e) => setCustomer({...customer, phone: e.target.value})} />
                <input className="w-full border-b py-2 text-sm outline-none" placeholder="Address/Street" onChange={(e) => setCustomer({...customer, street: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input className="border-b py-2 text-sm outline-none" placeholder="Taluka" onChange={(e) => setCustomer({...customer, taluka: e.target.value})} />
                  <input className="border-b py-2 text-sm outline-none" placeholder="District" onChange={(e) => setCustomer({...customer, district: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select className="border-b py-2 text-sm bg-transparent outline-none" value={customer.state} onChange={(e) => setCustomer({...customer, state: e.target.value})}>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input className="border-b py-2 text-sm outline-none" placeholder="Pincode" maxLength={6} onChange={(e) => setCustomer({...customer, pincode: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] font-bold text-stone-400">Total</span>
                <span className="text-2xl font-black italic">₹{total.toFixed(2)}</span>
              </div>
              <button 
                disabled={loading || cart.length === 0}
                onClick={handleProceedToPayment}
                className="w-full bg-stone-900 text-white py-4 font-bold uppercase text-xs disabled:bg-stone-300"
              >
                {loading ? "Creating Order..." : "Proceed to Pay"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-stone-50 p-6 flex flex-col items-center border rounded-sm">
              <p className="text-[10px] font-bold mb-4 uppercase tracking-widest">Scan QR Code to Pay</p>
              <QRCodeSVG value={generateUPILink()} size={180} />
              <p className="mt-4 font-mono text-[11px] text-stone-900 font-bold">{total.toFixed(2)} INR</p>
              <p className="text-[9px] text-stone-400 mt-1">{VPA_ID}</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-sm border border-amber-100">
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  <strong>How to find UTR?</strong> After payment in GPay/PhonePe, check "Transaction Details". It is a 12-digit number starting with your bank's code.
                </p>
              </div>
              
              <input 
                className="w-full bg-stone-100 p-4 text-center text-xl font-black tracking-[0.2em] outline-none border-2 border-transparent focus:border-stone-900" 
                placeholder="0000 0000 0000"
                maxLength={12}
                onChange={(e) => setUtr(e.target.value)}
              />
              
              <button 
                onClick={handleVerifyPayment}
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 font-bold uppercase text-xs shadow-lg active:scale-[0.98] transition-transform"
              >
                {loading ? "Verifying..." : "Confirm Payment & Complete Order"}
              </button>
              
              <button 
                onClick={() => setStep(1)} 
                className="w-full text-stone-400 text-[9px] font-bold uppercase tracking-widest"
              >
                ← Back to Details
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}