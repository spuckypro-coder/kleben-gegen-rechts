import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionProvider from "@/components/SessionProvider";
import { CartProvider } from "@/components/CartProvider";
import CartSidebar from "@/components/CartSidebar";

export const metadata: Metadata = {
  title: "Kleben Gegen Rechts",
  description: "Sticker Kunst & Aktivismus",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col bg-black text-white">
        <SessionProvider>
          <CartProvider>
            <Navbar />
            <CartSidebar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
              <p>
                © {new Date().getFullYear()}{" "}
                <span className="text-red-500 font-bold">Kleben Gegen Rechts</span>{" "}
                — Kunst ist Widerstand
              </p>
            </footer>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
