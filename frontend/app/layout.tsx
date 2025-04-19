import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
 
 import { AuthProvider } from '@/contexts/AuthContext'
import ClientOnly from "@/components/ClientOnly";
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
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
      <ClientOnly>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ClientOnly>
      </body>
    </html>
  )
}