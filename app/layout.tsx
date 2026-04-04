import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Kleben Gegen Rechts",
  description: "Sticker Kunst & Aktivismus",
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
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
            <p>
              © {new Date().getFullYear()}{" "}
              <span className="text-red-500 font-bold">Kleben Gegen Rechts</span>{" "}
              — Kunst ist Widerstand
            </p>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
