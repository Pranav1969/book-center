import "./globals.css";
import { CartProvider } from "../context/CartContext";
import CartSidebar from "../components/CartSidebar";
import Navbar from "../components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#fcfaf7] antialiased">
        <CartProvider>
          <Navbar />
          {children}
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  );
}