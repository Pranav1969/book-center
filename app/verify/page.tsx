"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get("id") || "";
  
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const handleChange = (val: string, index: number) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (finalOtp?: string) => {
    const code = finalOtp || otp.join("");
    if (code.length < 6) return;

    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp: code }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ CRITICAL LOGIC: Check if we need more info or can go Home
        if (data.isNewUser) {
          router.push("/setup-profile");
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        setError(data.error || "Invalid access code.");
        setOtp(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("Connection lost. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify when last digit is entered
  useEffect(() => {
    if (otp.every(slot => slot !== "")) {
      handleVerify();
    }
  }, [otp]);

  return (
    <main className="min-h-screen bg-[#05010d] flex items-center justify-center p-6 text-gray-200">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-lg bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-2xl text-center shadow-2xl"
      >
        <div className="mb-8">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="font-serif text-4xl text-white italic mb-3">Verification</h1>
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Secure code sent to {identifier}</p>
        </div>

        <div className="flex justify-center gap-3 mb-10">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              ref={(el) => { inputRefs.current[index] = el; }}
              value={data}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-16 md:w-14 md:h-20 bg-white/5 border border-white/10 rounded-2xl text-center text-3xl font-light text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all shadow-inner"
            />
          ))}
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[10px] mb-8 uppercase tracking-widest font-bold">
            {error}
          </motion.p>
        )}

        <button 
          onClick={() => handleVerify()} 
          disabled={loading || otp.join("").length < 6} 
          className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl"
        >
          {loading ? "Authenticating..." : "Establish Session"}
        </button>

        <p className="mt-8 text-gray-600 text-[10px] uppercase tracking-widest">
          Didn't receive it? <span className="text-purple-400 cursor-pointer hover:underline" onClick={() => router.back()}>Go Back</span>
        </p>
      </motion.div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05010d] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}