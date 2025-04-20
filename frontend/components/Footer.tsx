// filepath: /home/atharva/game-backend/frontend/components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' });

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-red-900/30 mt-20 py-8 text-gray-400 text-sm">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <Link href="/" className={`${anton.className} text-xl`}>
            <span className="text-white">CHAIN</span><span className="text-red-600">ARENA</span>
          </Link>
          <p className="mt-1">&copy; {currentYear} Chain Arena. All rights reserved.</p>
        </div>
        <div className="flex space-x-4">
          {/* Add relevant links here if needed */}
          {/* <Link href="/about" className="hover:text-white transition-colors">About</Link> */}
          {/* <Link href="/terms" className="hover:text-white transition-colors">Terms</Link> */}
          {/* <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;