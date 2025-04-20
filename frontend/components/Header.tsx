// filepath: /home/atharva/game-backend/frontend/components/Header.tsx
'use client'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Anton } from 'next/font/google'
import dynamic from 'next/dynamic'; // Import dynamic

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

export default function Header() {
  const { session, user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/') // Redirect to home after sign out
  }

  return (
    <header className="bg-black/80 backdrop-blur-lg border-b border-red-900/30 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className={`${anton.className} text-2xl`}>
          <span className="text-white">CHAIN</span><span className="text-red-600">ARENA</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/tournaments" className="text-gray-300 hover:text-white transition-colors text-sm font-mono">Tournaments</Link>
          {/* Add other nav links */}
          
          {session ? (
            <>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm font-mono">Dashboard</Link>
              <button onClick={handleSignOut} className="text-gray-300 hover:text-red-500 transition-colors text-sm font-mono">Sign Out</button>
              {/* Add Wallet Button */}
              <WalletMultiButtonDynamic style={{ 
                  backgroundColor: 'rgba(153, 27, 27, 0.5)', // bg-red-800/50
                  border: '1px solid rgba(153, 27, 27, 1)', // border-red-800
                  color: 'white',
                  fontSize: '0.875rem', // text-sm
                  fontFamily: 'monospace',
                  height: 'auto',
                  padding: '0.5rem 1rem',
                  lineHeight: '1.25rem'
              }} />
            </>
          ) : (
            <>
              <Link href="/signin" className="text-gray-300 hover:text-white transition-colors text-sm font-mono">Sign In</Link>
              <Link href="/signup" className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 text-sm font-mono transition-colors">Sign Up</Link>
               {/* Add Wallet Button */}
              <WalletMultiButtonDynamic style={{ 
                  backgroundColor: 'rgba(153, 27, 27, 0.5)', // bg-red-800/50
                  border: '1px solid rgba(153, 27, 27, 1)', // border-red-800
                  color: 'white',
                  fontSize: '0.875rem', // text-sm
                  fontFamily: 'monospace',
                  height: 'auto',
                  padding: '0.5rem 1rem',
                  lineHeight: '1.25rem'
              }} />
            </>
          )}
        </div>
      </nav>
    </header>
  )
}