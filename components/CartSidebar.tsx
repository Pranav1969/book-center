"use client";
import { useCart } from "../context/CartContext";
import { QRCodeSVG } from "qrcode.react"; // For Desktop Users
import { useState } from "react";

export default function CartSidebar() {
  const { cart, removeFromCart, isOpen, setIsOpen } = useCart();
  const [showQR, setShowQR] = useState(false);

  // 1. Calculate Total
  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
  
  // 2. UPI Configuration
  const vpa = "pranavbskamble01@oksbi"; // 👈 REPLACE WITH YOUR ACTUAL UPI ID
  const merchantName = "Karuna Book Center";

  const generateUPILink = (amount: number) => {
    return `upi://pay?pa=${vpa}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&cu=INR&tn=BC_Order`;
  };

  const handlePayment = () => {
    const link = generateUPILink(total);
    
    // Check if user is on Mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = link;
    } else {
      setShowQR(!showQR); // Show QR code on Desktop
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[101] shadow-2xl transform transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="font-serif text-2xl font-bold italic">Your Collection</h2>
            <button onClick={() => setIsOpen(false)} className="text-[10px] uppercase font-bold text-stone-400">Close</button>
          </div>

          {/* Cart Items List */}
          <div className="flex-grow overflow-y-auto space-y-4">
            {cart.length === 0 ? (
              <p className="text-stone-400 italic text-center py-10">Your shelves are empty.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center bg-stone-50 p-3 rounded-sm border border-stone-100">
                  <img src={item.image_url} className="w-10 h-14 object-cover shadow-sm" alt="" />
                  <div className="flex-grow">
                    <h4 className="text-xs font-bold text-stone-900 leading-tight">{item.title}</h4>
                    <span className="text-xs text-stone-500">₹{item.price}</span>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-[9px] text-red-400 font-bold uppercase">Remove</button>
                </div>
              ))
            )}
          </div>

          {/* Payment Section */}
          <div className="mt-6 border-t pt-6">
            {showQR && total > 0 && (
              <div className="flex flex-col items-center mb-6 p-4 bg-white border border-stone-200 rounded-lg animate-in fade-in zoom-in duration-300">
                <p className="text-[10px] font-bold uppercase text-stone-500 mb-3 text-center">Scan to pay with any UPI App</p>
                <QRCodeSVG value={generateUPILink(total)} size={180} />
                <p className="text-[10px] mt-3 font-mono text-stone-400">{vpa}</p>
              </div>
            )}

            <div className="flex justify-between items-end mb-6">
              <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Payable Amount</span>
              <span className="text-3xl font-black text-stone-900">₹{total.toFixed(2)}</span>
            </div>

            <button 
              onClick={handlePayment}
              disabled={total === 0}
              className="w-full bg-[#34a853] text-white py-5 font-bold uppercase tracking-widest hover:bg-green-700 disabled:bg-stone-200 transition-all flex items-center justify-center gap-3"
            >
              {showQR ? "Close QR" : "Pay via UPI"}
            </button>
            
            <p className="text-[8px] text-center text-stone-400 mt-4 uppercase tracking-tighter leading-relaxed">
              Open GPay, PhonePe, or Paytm <br /> After payment, send screenshot to admin.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}