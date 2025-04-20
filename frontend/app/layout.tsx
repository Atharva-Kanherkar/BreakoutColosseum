 // filepath: /home/atharva/game-backend/frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from 'react-hot-toast';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletContextProvider from "@/components/WalletContextProvider"; // Import the provider
import ClientOnly from "@/components/ClientOnly";
import '@solana/wallet-adapter-react-ui/styles.css';
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chain Arena",
  description: "Decentralized Esports Tournament Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <ClientOnly>
        <WalletContextProvider> {/* Wrap AuthProvider */}
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
            <Header />
            {children}
            <Footer />
          </AuthProvider>
        </WalletContextProvider>
        </ClientOnly>
      </body>
    </html>
  );
}