// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async () => {
    setLoading(true);
    await fetch("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    });
    router.push(`/verify?id=${identifier}`);
  };

  return (
    <main className="min-h-screen bg-[#05010d] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
        <h1 className="font-serif text-3xl text-white italic mb-2">Welcome Back</h1>
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-8">Enter Email or Phone</p>
        
        <input 
          type="text"
          className="w-full bg-white/5 border-b border-white/10 py-4 px-2 outline-none text-white mb-8"
          placeholder="email@example.com or +91..."
          onChange={(e) => setIdentifier(e.target.value)}
        />
        
        <button 
          onClick={handleSendOTP}
          className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-purple-500 transition-all"
        >
          {loading ? "Sending..." : "Get Secure OTP"}
        </button>
      </div>
    </main>
  );
}