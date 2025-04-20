"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformKeypair = exports.platformWallet = exports.PLATFORM_FEE_ADDRESS = exports.PLATFORM_WALLET_ADDRESS = exports.connection = void 0;
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
// Determine RPC endpoint based on environment
const SOLANA_NETWORK = (process.env.SOLANA_NETWORK || 'devnet');
const RPC_URL = process.env.SOLANA_RPC_URL || (0, web3_js_1.clusterApiUrl)(SOLANA_NETWORK);
// Initialize Solana connection
exports.connection = new web3_js_1.Connection(RPC_URL);
console.log(`Connected to Solana ${SOLANA_NETWORK}`);
// Initialize keypair for platform wallet
let platformKeypair;
// Export platform wallet address and fee address
exports.PLATFORM_WALLET_ADDRESS = process.env.PLATFORM_WALLET_ADDRESS;
exports.PLATFORM_FEE_ADDRESS = process.env.PLATFORM_FEE_ADDRESS || exports.PLATFORM_WALLET_ADDRESS;
// For development/testing: generate a consistent keypair if none is provided
const getDevKeypair = () => {
    try {
        // Check if we have a development keypair file
        const devKeypairPath = path_1.default.join(__dirname, '..', '..', 'dev-keypair.json');
        if (fs_1.default.existsSync(devKeypairPath)) {
            const secretKeyString = fs_1.default.readFileSync(devKeypairPath, 'utf-8');
            const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
            return web3_js_1.Keypair.fromSecretKey(secretKey);
        }
        // Generate and save a new keypair
        console.log('Generating a new development keypair...');
        const newKeypair = web3_js_1.Keypair.generate();
        fs_1.default.writeFileSync(devKeypairPath, JSON.stringify(Array.from(newKeypair.secretKey)), 'utf-8');
        console.log(`Development keypair saved to ${devKeypairPath}`);
        return newKeypair;
    }
    catch (error) {
        console.error('Error creating dev keypair:', error);
        // Fall back to a new random keypair
        return web3_js_1.Keypair.generate();
    }
};
try {
    if (process.env.PLATFORM_KEYPAIR_SECRET) {
        console.log("Attempting to load platform keypair from environment...");
        const secretKeyString = process.env.PLATFORM_KEYPAIR_SECRET;
        let secretKeyArray = [];
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
            exports.platformKeypair = platformKeypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
            console.log(`Platform wallet initialized from environment: ${platformKeypair.publicKey.toString()}`);
        }
        catch (parseError) {
            console.error("Failed to parse keypair from environment:", parseError);
            throw parseError;
        }
    }
    else if (process.env.NODE_ENV !== 'production') {
        console.warn("⚠️ PLATFORM_KEYPAIR_SECRET not found. Using a development keypair.");
        exports.platformKeypair = platformKeypair = getDevKeypair();
        console.log(`Using development platform wallet: ${platformKeypair.publicKey.toString()}`);
    }
    else {
        throw new Error("PLATFORM_KEYPAIR_SECRET is required in production mode");
    }
}
catch (error) {
    console.error("Failed to initialize platform keypair:", error);
    if (process.env.NODE_ENV !== 'production') {
        console.warn("⚠️ Falling back to a random keypair for development");
        exports.platformKeypair = platformKeypair = web3_js_1.Keypair.generate();
        console.log(`Random platform wallet: ${platformKeypair.publicKey.toString()}`);
    }
    else {
        throw new Error("Invalid platform keypair configuration");
    }
}
// Export the platform wallet and keypair
exports.platformWallet = platformKeypair;
