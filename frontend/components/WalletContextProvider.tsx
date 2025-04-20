// filepath: /home/atharva/game-backend/frontend/components/WalletContextProvider.tsx
'use client'

import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter /* Add other wallets as needed */ } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

 

interface WalletContextProviderProps {
  children: React.ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    // Use an environment variable for flexibility
    const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || WalletAdapterNetwork.Devnet) as WalletAdapterNetwork;

    // You can also provide a custom RPC endpoint
    const endpoint = useMemo(() => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            // Add other adapters like Sollet, Ledger etc.
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletContextProvider;