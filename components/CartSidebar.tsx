"use client";

import { useCart } from "../context/CartContext";
import { QRCodeSVG } from "qrcode.react";
import { useState, useMemo } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const STATES = ["Maharashtra", "Karnataka", "Goa", "Gujarat", "Delhi", "Other"];

export default function CartSidebar() {
  const { cart, removeFromCart, isOpen, setIsOpen, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
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

  const handleProceedToPayment = async () => {
    const { name, phone, street, taluka, district, pincode } = customer;
    if (!name || !phone || !street || !taluka || !district || !pincode) {
      alert("Please fill all shipping details.");
      return;
    }
    
    setLoading(true);
    try {
      const fullAddress = `${street}, ${taluka}, ${district}, ${customer.state} - ${pincode}`;
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
        .select()
        .single();

      if (error) throw error;
      
      setActiveOrderId(data.id);
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
      alert("Please enter a valid 12-digit UTR.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ utr_number: utr.trim(), status: 'completed' })
        .eq('id', activeOrderId);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-md" 
            onClick={() => setIsOpen(false)} 
          />

          {/* Sidebar */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0515] border-l border-white/10 z-[101] shadow-[ -20px_0_50px_rgba(0,0,0,0.5)] flex flex-col p-8 overflow-hidden text-gray-200"
          >
            
            {/* Header */}
            <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
              <div>
                <h2 className="font-serif text-3xl italic text-white tracking-tighter">Checkout</h2>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-500 mt-1">Secure Acquisition</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors pb-1"
              >
                Close
              </button>
            </div>

            {step === 1 ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide">
                  
                  {/* Item Summary */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Your Selection ({cart.length})</p>
                    {cart.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={item.id} 
                        className="flex gap-4 items-center group"
                      >
                        <div className="w-12 h-16 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-white/5">
                            <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        </div>
                        <div className="flex-1">
                            <div className="text-[11px] font-bold text-white line-clamp-1">{item.title}</div>
                            <div className="text-[10px] font-serif italic text-gray-500">₹{item.price}</div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-400 text-[10px] transition-colors">Remove</button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Shipping Form */}
                  <div className="space-y-5 pt-8 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Shipping Repository</p>
                    <div className="space-y-4">
                        <input className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-700" placeholder="Recipient Name" onChange={(e) => setCustomer({...customer, name: e.target.value})} />
                        <input className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-700" placeholder="Contact Number" onChange={(e) => setCustomer({...customer, phone: e.target.value})} />
                        <input className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-700" placeholder="Street Address / Locality" onChange={(e) => setCustomer({...customer, street: e.target.value})} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <input className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-700" placeholder="Taluka" onChange={(e) => setCustomer({...customer, taluka: e.target.value})} />
                            <input className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-700" placeholder="District" onChange={(e) => setCustomer({...customer, district: e.target.value})} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <select className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-all text-gray-400 cursor-pointer appearance-none" value={customer.state} onChange={(e) => setCustomer({...customer, state: e.target.value})}>
                                {STATES.map(s => <option key={s} value={s} className="bg-[#0a0515] text-white">{s}</option>)}
                            </select>
                            <input className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-700" placeholder="Pincode" maxLength={6} onChange={(e) => setCustomer({...customer, pincode: e.target.value})} />
                        </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-6 border-t border-white/10 mt-6">
                  <div className="flex justify-between items-center mb-6 px-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Valuation</span>
                    <span className="text-3xl font-serif italic text-white">₹{total.toFixed(2)}</span>
                  </div>
                  <button 
                    disabled={loading || cart.length === 0}
                    onClick={handleProceedToPayment}
                    className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] disabled:bg-gray-800 disabled:text-gray-600 hover:bg-purple-600 hover:text-white transition-all duration-500 shadow-xl shadow-purple-500/10"
                  >
                    {loading ? "Establishing Order..." : "Proceed to Payment"}
                  </button>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* QR Section */}
                <div className="bg-white/5 p-8 flex flex-col items-center border border-white/5 rounded-[2rem] relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
                  <p className="text-[10px] font-black mb-6 uppercase tracking-[0.4em] text-purple-400">Merchant Gateway</p>
                  
                  <div className="p-4 bg-white rounded-2xl shadow-2xl">
                    <QRCodeSVG value={generateUPILink()} size={160} />
                  </div>
                  
                  <div className="mt-8 text-center">
                    <p className="font-serif italic text-2xl text-white">₹{total.toFixed(2)}</p>
                    <p className="text-[9px] font-mono text-gray-500 mt-1 uppercase tracking-widest">{VPA_ID}</p>
                  </div>
                </div>
                
                {/* Verification Section */}
                <div className="space-y-5">
                  <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
                    <p className="text-[10px] text-purple-300 leading-relaxed font-medium">
                      <span className="text-white font-bold uppercase mr-2">Protocol:</span> 
                      Locate the 12-digit UTR (Ref No) in your banking app's transaction history and enter it below to authorize.
                    </p>
                  </div>
                  
                  <input 
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-center text-2xl font-black tracking-[0.4em] outline-none focus:border-purple-500 transition-all text-white placeholder:text-gray-800" 
                    placeholder="000000000000"
                    maxLength={12}
                    onChange={(e) => setUtr(e.target.value)}
                  />
                  
                  <div className="space-y-4">
                    <button 
                        onClick={handleVerifyPayment}
                        disabled={loading}
                        className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-green-500 hover:text-white transition-all duration-500 shadow-xl"
                    >
                        {loading ? "Verifying Archive..." : "Finalize Acquisition"}
                    </button>
                    
                    <button 
                        onClick={() => setStep(1)} 
                        className="w-full text-gray-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                        ← Adjust Details
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}