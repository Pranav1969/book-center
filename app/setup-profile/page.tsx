"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh"
];

export default function SetupProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Form States
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");

  useEffect(() => {
    // 1. Listen for auth changes (Real-time)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setAuthChecking(false);
      } else if (event === 'SIGNED_OUT') {
        router.replace("/login");
      }
    });

    // 2. Initial Session Check with 1.5s Grace Period
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setAuthChecking(false);
      } else {
        // Give it 1.5 seconds to "warm up" before kicking to login
        setTimeout(async () => {
          // Check one last time before redirecting
          const { data: retry } = await supabase.auth.getUser();
          if (!retry.user) {
            router.replace("/login");
          } else {
            setUser(retry.user);
            setAuthChecking(false);
          }
        }, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    // Logic: If user logged in via OTP, email is identifier@domain.com
    // We extract the phone number from the email prefix if user.phone is empty
    const derivedPhone = user.phone || user.email?.split('@')[0];

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        name: name,
        phone_number: derivedPhone, 
        email: user.email,
        shipping_address: address,
        landmark: landmark,
        city: city,
        state: state,
        pincode: pincode,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      alert("Error saving profile: " + error.message);
      setLoading(false);
    } else {
      // ✅ SUCCESS: Clear session cache and redirect home
      window.location.href = "/";
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#05010d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-purple-400 text-[10px] uppercase tracking-widest animate-pulse">Syncing Session...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#05010d] text-white flex items-center justify-center p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl"
      >
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-serif text-4xl italic text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-purple-500">
            Delivery Details
          </h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-3">
            Essential for shipping your Luxe editions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="md:col-span-2">
            <label className="text-[10px] uppercase tracking-widest text-purple-400 font-bold ml-1">Full Name</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border-b border-white/10 py-3 px-2 outline-none focus:border-purple-500 transition-all" placeholder="e.g. Rahul Sharma" />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] uppercase tracking-widest text-purple-400 font-bold ml-1">Flat / House / Street</label>
            <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-white/5 border-b border-white/10 py-3 px-2 outline-none focus:border-purple-500 transition-all" placeholder="Apt 402, Karuna Heights..." />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] uppercase tracking-widest text-purple-400 font-bold ml-1">Landmark (Optional)</label>
            <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} className="w-full bg-white/5 border-b border-white/10 py-3 px-2 outline-none focus:border-purple-500 transition-all" placeholder="Near Central Mall" />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-purple-400 font-bold ml-1">City</label>
            <input required type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-white/5 border-b border-white/10 py-3 px-2 outline-none focus:border-purple-500 transition-all" placeholder="Mumbai" />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-purple-400 font-bold ml-1">Pincode</label>
            <input required type="text" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full bg-white/5 border-b border-white/10 py-3 px-2 outline-none focus:border-purple-500 transition-all" placeholder="400001" />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] uppercase tracking-widest text-purple-400 font-bold ml-1">State</label>
            <select 
              required 
              value={state} 
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-[#0d071a] border-b border-white/10 py-3 px-2 outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>Select State</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="md:col-span-2 mt-4">
            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50"
            >
              {loading ? "Establishing Record..." : "Access Library"}
            </button>
          </div>
        </form>
      </motion.div>
    </main>
  );
}