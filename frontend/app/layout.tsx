 // NO 'use client' here

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from 'react-hot-toast';
// Remove Header import if not used elsewhere directly in layout
// import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletContextProvider from "@/components/WalletContextProvider";
import ClientOnly from "@/components/ClientOnly";
import '@solana/wallet-adapter-react-ui/styles.css';
import MainLayoutWrapper from "@/components/MainLayoutWrapper"; // Import the new wrapper

const inter = Inter({ subsets: ["latin"] });
// Remove usePathname import: import { usePathname } from 'next/navigation';

export const metadata: Metadata = {
  title: "Chain Arena",
  description: "Decentralized Esports Tournament Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Remove pathname logic from here
  // const pathname = usePathname();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <ClientOnly>
          <WalletContextProvider>
            <AuthProvider>
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #dc2626', // red-600
                  },
                  success: {
                    iconTheme: {
                      primary: '#16a34a', // green-600
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#dc2626', // red-600
                      secondary: '#fff',
                    },
                  },
                }}
              />
              {/* Use the wrapper component */}
              <MainLayoutWrapper>
                {children}
              </MainLayoutWrapper>
              <Footer />
            </AuthProvider>
          </WalletContextProvider>
        </ClientOnly>
      </body>
    </html>
  );
}