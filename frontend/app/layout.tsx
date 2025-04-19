import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Use Inter font from Google - highly reliable
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap'
});

export const metadata: Metadata = {
  title: "ChainArena",
  description: "Web3 Gaming Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}