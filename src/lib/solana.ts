import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

// Validate essential environment variables
if (!process.env.SOLANA_RPC_URL) {
  throw new Error("SOLANA_RPC_URL is not set in environment variables");
}

// Initialize Solana connection - use a reliable RPC endpoint
const connection = new Connection(
  process.env.SOLANA_RPC_URL,
  'confirmed'
);

// Platform fee address (where platform fees go)
const PLATFORM_FEE_ADDRESS = new PublicKey(
  process.env.PLATFORM_FEE_ADDRESS || '11111111111111111111111111111111'
);

// Platform keypair for signing transactions
// CRITICAL: In production, store this securely (not in .env)
let platformKeypair: Keypair;

try {
  if (process.env.PLATFORM_KEYPAIR_SECRET) {
    const secretKeyArray = Uint8Array.from(
      JSON.parse(process.env.PLATFORM_KEYPAIR_SECRET)
    );
    platformKeypair = Keypair.fromSecretKey(secretKeyArray);
  } else {
    console.warn("⚠️ PLATFORM_KEYPAIR_SECRET not found. Using a dummy keypair for development.");
    // Generate a dummy keypair for development only
    platformKeypair = Keypair.generate();
  }
  
  console.log(`Platform wallet initialized: ${platformKeypair.publicKey.toString()}`);
} catch (error) {
  console.error("Failed to initialize platform keypair:", error);
  throw new Error("Invalid platform keypair configuration");
}

export { connection, PLATFORM_FEE_ADDRESS, platformKeypair };