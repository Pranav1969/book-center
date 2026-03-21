"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type CartItem = {
  id: number;
  title: string;
  price: number;
  image_url: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (book: CartItem) => void;
  removeFromCart: (id: number) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('bc-cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('bc-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (book: CartItem) => {
    // Prevent duplicates if you want, or allow multiple
    setCart((prev) => [...prev, book]);
    setIsOpen(true); 
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};