import { Cluster, Connection, Keypair as Web3JsKeypair, clusterApiUrl } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { Keypair as UmiKeypair, KeypairSigner, generateSigner, keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
// Remove bs58 import: import bs58 from 'bs58';

// Load environment variables
dotenv.config();

// Determine RPC endpoint based on environment
const SOLANA_NETWORK = (process.env.SOLANA_NETWORK || 'devnet') as Cluster;
const rpcEndpoint = process.env.SOLANA_RPC_ENDPOINT || clusterApiUrl(SOLANA_NETWORK);

// Initialize Solana web3.js connection
export const connection = new Connection(rpcEndpoint, 'confirmed');
console.log(`Web3.js Connected to Solana ${SOLANA_NETWORK} at ${rpcEndpoint}`);

// --- Initialize Keypairs (Both Web3.js and Umi) ---
let platformWeb3Keypair: Web3JsKeypair;
let platformUmiKeypair: UmiKeypair;

// Function to load/generate dev keypair (returns web3.js Keypair)
const getDevKeypair = (): Web3JsKeypair => {
    try {
        const devKeypairPath = path.join(__dirname, '..', '..', 'dev-keypair.json');
        if (fs.existsSync(devKeypairPath)) {
            const secretKeyString = fs.readFileSync(devKeypairPath, 'utf-8');
            const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
            return Web3JsKeypair.fromSecretKey(secretKey);
        }
        console.log('Generating a new development keypair...');
        const newKeypair = Web3JsKeypair.generate();
        fs.writeFileSync(
            devKeypairPath,
            JSON.stringify(Array.from(newKeypair.secretKey)),
            'utf-8'
        );
        console.log(`Development keypair saved to ${devKeypairPath}`);
        return newKeypair;
    } catch (error) {
        console.error('Error creating/loading dev keypair:', error);
        return Web3JsKeypair.generate(); // Fallback
    }
};

// --- Create a temporary Umi instance JUST for keypair creation ---
const tempUmi = createUmi(rpcEndpoint);

try {
    const secretString = process.env.PLATFORM_KEYPAIR_SECRET;
    let secretKeyBytes: Uint8Array | null = null;

    if (secretString) {
        console.log("Attempting to load platform keypair from environment (JSON array format ONLY)...");
        // --- Simplified Logic: Only parse JSON array ---
        if (secretString.trim().startsWith('[') && secretString.trim().endsWith(']')) {
            try {
                const parsedArray = JSON.parse(secretString);
                if (Array.isArray(parsedArray) && parsedArray.length === 64 && parsedArray.every(n => typeof n === 'number' && n >= 0 && n <= 255)) {
                    secretKeyBytes = new Uint8Array(parsedArray);
                } else {
                    throw new Error('Invalid JSON array format or length (expected 64 numbers).');
                }
            } catch (jsonError) {
                console.error("Failed to parse PLATFORM_KEYPAIR_SECRET as JSON array:", jsonError);
                // No fallback to bs58
            }
        } else {
             console.error("PLATFORM_KEYPAIR_SECRET is not in the expected JSON array format (e.g., [1,2,3,...]).");
        }
        // --- End Simplified Logic ---

        if (secretKeyBytes) {
            platformWeb3Keypair = Web3JsKeypair.fromSecretKey(secretKeyBytes);
            platformUmiKeypair = tempUmi.eddsa.createKeypairFromSecretKey(secretKeyBytes);
            console.log(`Platform wallet initialized from environment: ${platformWeb3Keypair.publicKey.toString()}`);
        } else {
            throw new Error("Failed to derive secret key bytes from PLATFORM_KEYPAIR_SECRET.");
        }

    } else if (process.env.NODE_ENV !== 'production') {
        console.warn("⚠️ PLATFORM_KEYPAIR_SECRET not found. Using a development keypair.");
        platformWeb3Keypair = getDevKeypair();
        platformUmiKeypair = tempUmi.eddsa.createKeypairFromSecretKey(platformWeb3Keypair.secretKey);
        console.log(`Using development platform wallet: ${platformWeb3Keypair.publicKey.toString()}`);
    } else {
        throw new Error("PLATFORM_KEYPAIR_SECRET is required in production mode");
    }

} catch (error) {
    console.error("CRITICAL: Failed to initialize platform keypair:", error);
    if (process.env.NODE_ENV !== 'production') {
        console.warn("⚠️ Falling back to a random keypair for development. MINTING WILL LIKELY FAIL.");
        platformWeb3Keypair = Web3JsKeypair.generate();
        platformUmiKeypair = tempUmi.eddsa.createKeypairFromSecretKey(platformWeb3Keypair.secretKey);
        console.log(`Random platform wallet: ${platformWeb3Keypair.publicKey.toString()}`);
    } else {
        process.exit(1); // Exit if keypair fails in production
    }
}

// --- Initialize MAIN Umi Instance ---
export const umi = createUmi(rpcEndpoint)
    .use(keypairIdentity(platformUmiKeypair));

console.log(`Umi instance initialized for wallet: ${umi.identity.publicKey}`);

// --- Exports ---
export { platformUmiKeypair as platformKeypair };
export { platformWeb3Keypair };
export const PLATFORM_WALLET_ADDRESS = platformWeb3Keypair.publicKey.toString();
export const PLATFORM_FEE_ADDRESS = process.env.PLATFORM_FEE_ADDRESS || PLATFORM_WALLET_ADDRESS;