import { Cluster, Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Determine RPC endpoint based on environment
const SOLANA_NETWORK = (process.env.SOLANA_NETWORK || 'devnet') as Cluster;
const RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK);

// Initialize Solana connection
export const connection = new Connection(RPC_URL);
console.log(`Connected to Solana ${SOLANA_NETWORK}`);

// Initialize keypair for platform wallet
let platformKeypair: Keypair;

// Export platform wallet address and fee address
export const PLATFORM_WALLET_ADDRESS = process.env.PLATFORM_WALLET_ADDRESS;
export const PLATFORM_FEE_ADDRESS = process.env.PLATFORM_FEE_ADDRESS || PLATFORM_WALLET_ADDRESS;

// For development/testing: generate a consistent keypair if none is provided
const getDevKeypair = (): Keypair => {
  try {
    // Check if we have a development keypair file
    const devKeypairPath = path.join(__dirname, '..', '..', 'dev-keypair.json');
    if (fs.existsSync(devKeypairPath)) {
      const secretKeyString = fs.readFileSync(devKeypairPath, 'utf-8');
      const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
      return Keypair.fromSecretKey(secretKey);
    }

    // Generate and save a new keypair
    console.log('Generating a new development keypair...');
    const newKeypair = Keypair.generate();
    fs.writeFileSync(
      devKeypairPath, 
      JSON.stringify(Array.from(newKeypair.secretKey)),
      'utf-8'
    );
    console.log(`Development keypair saved to ${devKeypairPath}`);
    return newKeypair;
  } catch (error) {
    console.error('Error creating dev keypair:', error);
    // Fall back to a new random keypair
    return Keypair.generate();
  }
};

try {
  if (process.env.PLATFORM_KEYPAIR_SECRET) {
    console.log("Attempting to load platform keypair from environment...");
    const secretKeyString = process.env.PLATFORM_KEYPAIR_SECRET;
    
    let secretKeyArray: number[] = [];
    
    // Try different parsing methods
    try {
      // First attempt: Try JSON parsing if it looks like JSON
      if (secretKeyString.trim().startsWith('[') && secretKeyString.trim().endsWith(']')) {
        secretKeyArray = JSON.parse(secretKeyString);
      } 
      // Second attempt: Parse array-like string
      else {
        secretKeyArray = secretKeyString
          .replace('[', '')
          .replace(']', '')
          .split(',')
          .map(num => parseInt(num.trim(), 10));
      }
      
      // Validate array length
      if (secretKeyArray.length !== 64) {
        throw new Error(`Invalid key length: ${secretKeyArray.length} (expected 64)`);
      }
      
      // Check for any NaN values
      if (secretKeyArray.some(isNaN)) {
        throw new Error("Secret key contains invalid numeric values");
      }
      
      platformKeypair = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
      console.log(`Platform wallet initialized from environment: ${platformKeypair.publicKey.toString()}`);
    } catch (parseError) {
      console.error("Failed to parse keypair from environment:", parseError);
      throw parseError;
    }
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn("⚠️ PLATFORM_KEYPAIR_SECRET not found. Using a development keypair.");
    platformKeypair = getDevKeypair();
    console.log(`Using development platform wallet: ${platformKeypair.publicKey.toString()}`);
  } else {
    throw new Error("PLATFORM_KEYPAIR_SECRET is required in production mode");
  }
} catch (error) {
  console.error("Failed to initialize platform keypair:", error);
  
  if (process.env.NODE_ENV !== 'production') {
    console.warn("⚠️ Falling back to a random keypair for development");
    platformKeypair = Keypair.generate();
    console.log(`Random platform wallet: ${platformKeypair.publicKey.toString()}`);
  } else {
    throw new Error("Invalid platform keypair configuration");
  }
}

// Export the platform wallet and keypair
export const platformWallet = platformKeypair;
export { platformKeypair };