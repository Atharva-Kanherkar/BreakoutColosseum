import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata, createNft } from '@metaplex-foundation/mpl-token-metadata';
import { mplBubblegum, createTree } from '@metaplex-foundation/mpl-bubblegum';
import { generateSigner, keypairIdentity, percentAmount } from '@metaplex-foundation/umi';
import { platformKeypair, umi as baseUmi } from '../src/lib/solana'; // Adjust path if needed

// Use the Umi instance configured with your platform keypair
const umi = baseUmi.use(mplTokenMetadata()).use(mplBubblegum());

async function createAssets() {
    console.log(`Using platform wallet: ${umi.identity.publicKey}`);
    console.log("Attempting to create Collection NFT and Merkle Tree...");

    try {
        // --- 1. Create the Collection NFT ---
        console.log("Creating Collection NFT...");
        const collectionMint = generateSigner(umi);
        // createNft returns a builder directly, so await sendAndConfirm
        const collectionNftResult = await createNft(umi, {
            mint: collectionMint,
            name: "Game Platform Achievements",
            symbol: "GPA",
            uri: "https://example.com/collection_metadata.json", // Placeholder
            sellerFeeBasisPoints: percentAmount(0),
            isCollection: true,
        }).sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } });

        console.log("✅ Collection NFT Created!");
        console.log("   Signature:", Buffer.from(collectionNftResult.signature).toString('hex'));
        console.log("   Collection Mint Address:", collectionMint.publicKey);
        console.log("-----------------------------------");


        // --- 2. Create the Merkle Tree ---
        console.log("Creating Merkle Tree...");
        const merkleTree = generateSigner(umi);
        const maxDepth = 14;
        const maxBufferSize = 64;

        // --- FIX: Await createTree first, then call sendAndConfirm ---
        // Assuming createTree returns Promise<TransactionBuilder>
        const treeBuilder = await createTree(umi, {
            merkleTree,
            maxDepth: maxDepth,
            maxBufferSize: maxBufferSize,
            // public: false, // Optional
        });
        // Now call sendAndConfirm on the resolved builder
        const createTreeResult = await treeBuilder.sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } });
        // --- End FIX ---


        console.log("✅ Merkle Tree Created!");
        console.log("   Signature:", Buffer.from(createTreeResult.signature).toString('hex'));
        console.log("   Merkle Tree Address:", merkleTree.publicKey);
        console.log("-----------------------------------");

        console.log("\n🎉 Successfully created assets! 🎉");
        console.log("Please update your .env file with the following values:");
        console.log(`COLLECTION_MINT_ADDRESS=${collectionMint.publicKey}`);
        console.log(`MERKLE_TREE_ADDRESS=${merkleTree.publicKey}`);

    } catch (error) {
        console.error("❌ Error creating assets:", error);
        if (error instanceof Error && error.message.includes('balance')) {
            console.error("Hint: Ensure your platform wallet has enough Devnet SOL.");
        }
    }
}

createAssets();