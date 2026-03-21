"use client";
import { useCart } from "../../context/CartContext";

export default function CheckoutPage() {
  const { cart } = useCart();
  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <main className="min-h-screen bg-white p-8 md:p-24">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h2 className="text-3xl font-serif font-bold mb-8">Shipping Details</h2>
          <form className="space-y-4">
            <input type="text" placeholder="Full Name" className="w-full border p-3 border-stone-200 outline-none focus:border-black" />
            <input type="email" placeholder="Email Address" className="w-full border p-3 border-stone-200 outline-none focus:border-black" />
            <input type="text" placeholder="Shipping Address" className="w-full border p-3 border-stone-200 outline-none focus:border-black" />
            <button type="button" className="w-full bg-stone-900 text-white py-4 font-bold uppercase tracking-widest mt-6">
              Complete Order (${total.toFixed(2)})
            </button>
          </form>
        </div>
        
        <div className="bg-stone-50 p-8">
          <h3 className="font-serif text-xl font-bold mb-6">Order Summary</h3>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-sm mb-4">
              <span>{item.title}</span>
              <span className="font-bold">${item.price}</span>
            </div>
          ))}
          <div className="border-t pt-4 mt-4 flex justify-between font-black text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}