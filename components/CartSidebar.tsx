"use client";
import { useCart } from "../context/CartContext";

export default function CartSidebar() {
  const { cart, removeFromCart, isOpen, setIsOpen } = useCart();
  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[101] shadow-2xl transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex justify-between items-center mb-10 border-b border-stone-100 pb-6">
            <h2 className="font-serif text-2xl font-bold italic text-stone-900">Your Cart</h2>
            <button onClick={() => setIsOpen(false)} className="text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-900">Close</button>
          </div>

          <div className="flex-grow overflow-y-auto space-y-6">
            {cart.length === 0 ? (
              <p className="text-stone-400 italic text-center py-20 font-serif">Your cart is empty.</p>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <img src={item.image_url} className="w-12 h-16 object-cover shadow-sm" alt="" />
                  <div className="flex-grow">
                    <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{item.title}</h4>
                    <span className="text-xs text-stone-500">${item.price}</span>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-400 font-bold uppercase">Remove</button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-stone-100 pt-8 mt-6">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Total</span>
              <span className="text-3xl font-black text-stone-900">${total.toFixed(2)}</span>
            </div>
            <button className="w-full bg-stone-900 text-white py-5 font-bold uppercase tracking-widest hover:bg-teal-900 transition-colors">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}