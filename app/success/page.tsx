"use client";
import Link from "next/link";
import { useEffect } from "react";
import confetti from "canvas-confetti"; // Optional: npm install canvas-confetti

export default function SuccessPage() {
  // Trigger a subtle celebration effect on load
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }, []);

  return (
    <main className="min-h-screen bg-[#fdfcfb] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Animated Icon */}
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100">
            <span className="text-4xl">📚</span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="font-serif text-4xl font-bold italic text-stone-900">Order Received!</h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            Thank you for choosing <span className="font-bold text-stone-800">Karuna Book Center</span>. 
            Your payment details have been submitted for verification.
          </p>
        </div>

        {/* What Happens Next Section */}
        <div className="bg-white border border-stone-100 p-6 rounded-lg shadow-sm text-left space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b pb-2">Next Steps</h3>
          
          <div className="flex gap-4 items-start">
            <span className="text-teal-600 font-bold text-xs">01</span>
            <p className="text-[11px] text-stone-600">Our team will verify your <span className="font-mono bg-stone-100 px-1">UTR Number</span> within 2-4 hours.</p>
          </div>

          <div className="flex gap-4 items-start">
            <span className="text-teal-600 font-bold text-xs">02</span>
            <p className="text-[11px] text-stone-600">Once verified, your books will be packed with care and dispatched.</p>
          </div>

          <div className="flex gap-4 items-start">
            <span className="text-teal-600 font-bold text-xs">03</span>
            <p className="text-[11px] text-stone-600">You will receive a confirmation call or SMS on the number provided.</p>
          </div>
        </div>

        {/* Help / Support */}
        <div className="pt-4">
          <p className="text-[10px] text-stone-400 uppercase font-bold mb-4">Need help with your order?</p>
          <div className="flex justify-center gap-6">
            <a href="https://wa.me/919673351478" className="text-xs font-bold text-green-600 hover:underline">WhatsApp Support</a>
            <span className="text-stone-200">|</span>
            <Link href="/" className="text-xs font-bold text-stone-900 hover:underline">Return to Shop</Link>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-100">
          <p className="text-[9px] text-stone-400 italic font-serif">
            "A room without books is like a body without a soul."
          </p>
        </div>
      </div>
    </main>
  );
}