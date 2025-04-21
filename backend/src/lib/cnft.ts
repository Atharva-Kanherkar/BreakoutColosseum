import { mplBubblegum, mintToCollectionV1 } from '@metaplex-foundation/mpl-bubblegum';
import { Umi, PublicKey, publicKey, some } from '@metaplex-foundation/umi';
import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage";
import { platformKeypair, umi as baseUmi } from './solana';
import prisma from './db';
// Remove bs58 import: import bs58 from 'bs58';

// --- Configuration ---
const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN;
const MERKLE_TREE_ADDRESS_STR = process.env.MERKLE_TREE_ADDRESS;
const COLLECTION_MINT_ADDRESS_STR = process.env.COLLECTION_MINT_ADDRESS;
// --- End Configuration ---

let umi: Umi = baseUmi;

// Validate required configuration for cNFTs
if (!MERKLE_TREE_ADDRESS_STR || MERKLE_TREE_ADDRESS_STR === "YOUR_MERKLE_TREE_PUBLIC_KEY" ||
    !COLLECTION_MINT_ADDRESS_STR || COLLECTION_MINT_ADDRESS_STR === "YOUR_COLLECTION_NFT_MINT_PUBLIC_KEY") {
    console.error("CRITICAL: MERKLE_TREE_ADDRESS or COLLECTION_MINT_ADDRESS not configured in .env. cNFT features will be disabled.");
}
const MERKLE_TREE_ADDRESS = (MERKLE_TREE_ADDRESS_STR && MERKLE_TREE_ADDRESS_STR !== "YOUR_MERKLE_TREE_PUBLIC_KEY")
    ? publicKey(MERKLE_TREE_ADDRESS_STR) : null;
const COLLECTION_MINT_ADDRESS = (COLLECTION_MINT_ADDRESS_STR && COLLECTION_MINT_ADDRESS_STR !== "YOUR_COLLECTION_NFT_MINT_PUBLIC_KEY")
    ? publicKey(COLLECTION_MINT_ADDRESS_STR) : null;

// Add Bubblegum plugin
umi = umi.use(mplBubblegum());

// Add NFT.Storage uploader if token is provided and valid
if (NFT_STORAGE_TOKEN && NFT_STORAGE_TOKEN !== "YOUR_NFT_STORAGE_API_KEY") {
    try {
        umi = umi.use(nftStorageUploader({ token: NFT_STORAGE_TOKEN }));
        console.log("NFT.Storage uploader configured.");
    } catch (e) {
         console.error("Failed to initialize NFT.Storage uploader (check token validity):", e);
    }
} else {
    console.warn("NFT_STORAGE_TOKEN not found or is placeholder in .env. Metadata upload will fail.");
}

/**
 * Uploads metadata for the achievement NFT.
 */
async function uploadMetadata(achievementType: string, tournamentName: string): Promise<string> {
    // ... (keep existing uploadMetadata function) ...
    if (!umi.uploader) {
        throw new Error("Metadata uploader (NFT.Storage) is not configured or failed to initialize.");
    }
    console.log(`Uploading metadata for ${achievementType} - ${tournamentName}`);
    const metadata = {
        name: `${achievementType} - ${tournamentName}`,
        description: `Awarded for achieving ${achievementType} in the ${tournamentName} tournament.`,
        image: "https://via.placeholder.com/300.png/09f/fff?text=Achievement", // Placeholder Image
        attributes: [
            { trait_type: "Achievement Type", value: achievementType },
            { trait_type: "Tournament", value: tournamentName },
            { trait_type: "Platform", value: "Your Game Platform" },
        ],
        properties: {
            files: [{ uri: "https://via.placeholder.com/300.png/09f/fff?text=Achievement", type: "image/png" }],
            category: "image",
        },
    };

    try {
        const metadataUri = await umi.uploader.uploadJson(metadata);
        console.log("Metadata uploaded:", metadataUri);
        return metadataUri;
    } catch (error) {
        console.error("Failed to upload metadata:", error);
        throw new Error(`Failed to upload achievement metadata: ${error instanceof Error ? error.message : error}`);
    }
}

/**
 * Mints a compressed NFT achievement to a recipient.
 */
export async function mintAchievementNft(
    recipientAddress: string,
    achievementType: string,
    tournamentName: string,
    tournamentId: string,
    userId: string
): Promise<string | null> {

    if (!MERKLE_TREE_ADDRESS || !COLLECTION_MINT_ADDRESS) {
        console.error("Cannot mint achievement: Merkle Tree or Collection Mint Address is not configured.");
        return null;
    }
    if (umi.identity.publicKey !== platformKeypair.publicKey) {
         console.error("Cannot mint achievement: Platform keypair mismatch or not loaded correctly.");
         return null;
    }

    try {
        const recipient = publicKey(recipientAddress);

        // 1. Upload Metadata
        const metadataUri = await uploadMetadata(achievementType, tournamentName);

        // 2. Mint the cNFT
        console.log(`Minting ${achievementType} cNFT for ${recipientAddress} to tree ${MERKLE_TREE_ADDRESS}...`);
        const mintResult = await mintToCollectionV1(umi, {
            leafOwner: recipient,
            merkleTree: MERKLE_TREE_ADDRESS,
            collectionMint: COLLECTION_MINT_ADDRESS,
            metadata: {
                name: `${achievementType} - ${tournamentName}`,
                uri: metadataUri,
                sellerFeeBasisPoints: 0,
                collection: { key: COLLECTION_MINT_ADDRESS, verified: true },
                creators: [
                    { address: umi.identity.publicKey, verified: true, share: 100 },
                ],
            },
        }).sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } });

        // --- FIX: Encode signature as hex string ---
        // Convert Uint8Array signature to hex string
        const signatureHex = Buffer.from(mintResult.signature).toString('hex');
        console.log("Mint successful. Signature (Hex):", signatureHex);

        // 3. Get Asset ID (Placeholder using Hex Signature)
        const placeholderMintAddress = `sig_hex:${signatureHex}`; // Use hex signature
        // --- End FIX ---
        console.warn(`Storing placeholder mint address: ${placeholderMintAddress}. Implement DAS API lookup for actual assetId.`);

        // 4. Save to DB
        try {
            await prisma.achievement.create({
                data: {
                    userId,
                    tournamentId,
                    type: achievementType,
                    mintAddress: placeholderMintAddress,
                    metadataUri: metadataUri,
                }
            });
            console.log(`Achievement record saved to DB for user ${userId}, tournament ${tournamentId}`);
        } catch (dbError) {
             console.error(`Failed to save achievement to DB for user ${userId}:`, dbError);
        }

        return placeholderMintAddress;

    } catch (error) {
        console.error(`Failed to mint achievement NFT for ${recipientAddress}:`, error);
        if (error instanceof Error && error.message.includes("owner does not have required")) {
             console.error("Potential issue: Platform wallet might not be the collection/tree authority.");
        }
        return null;
    }
}