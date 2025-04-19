// Type definitions for Phantom wallet
interface PhantomProvider {
    isPhantom?: boolean;
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      signMessage: (message: Uint8Array, encoding: string) => Promise<Uint8Array>;
      signTransaction: (transaction: any) => Promise<any>;
      signAllTransactions: (transactions: any[]) => Promise<any[]>;
      request: (request: { method: string; params?: any }) => Promise<any>;
      on: (event: string, callback: (args: any) => void) => void;
      removeListener: (event: string, callback: (args: any) => void) => void;
    };
  }
  
  interface Window {
    phantom?: PhantomProvider;
    solana?: PhantomProvider['solana'];
  }