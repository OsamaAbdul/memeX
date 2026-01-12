import { Transaction, Address } from "@multiversx/sdk-core";
import { API_URL } from "@/config";
import { NFTDB } from "./supabase/supabase";

export interface MintNFTParams {
    name: string;
    description: string;
    imageCid: string;
    imageUrl?: string;
    attributes: Array<{ trait_type: string; value: string }>;
    senderAddress: string;
}

export const fetchUserNFTs = async (address: string): Promise<NFTDB[]> => {
    try {
        const response = await fetch(`${API_URL}/accounts/${address}/nfts?size=50`);
        if (!response.ok) return [];

        const data = await response.json();

        // Map API response to our common NFTDB format
        return data.map((item: any) => ({
            id: item.identifier, // Use identifier as ID
            name: item.name,
            description: item.metadata?.description || "No description",
            image_url: item.url || item.thumbnailUrl || "", // Priority to full URL
            rarity_score: item.attributes?.find((a: any) => a.trait_type === "Rarity")?.value || 0,
            category: item.attributes?.find((a: any) => a.trait_type === "Category")?.value || "Unknown",
            attributes: item.attributes || [],
            creator_address: item.creator,
            is_listed: false, // Default to false for wallet items
            created_at: new Date(item.timestamp * 1000).toISOString()
        }));
    } catch (e) {
        console.error("Error fetching user NFTs:", e);
        return [];
    }
};

export const createMintNFTTransaction = ({
    name,
    imageCid,
    imageUrl,
    senderAddress,
}: MintNFTParams): Transaction => {
    console.log("Constructing Mint NFT TX for:", { name, imageCid, imageUrl });

    // Format: ESDTNFTCreate@collectionTokenIdentifier@quantity@name@royalties@hash@attributes@uris
    // For simplicity, we use a mock collection identifier
    const collectionId = "MEMEX-123456";
    const nameHex = Buffer.from(name).toString('hex');
    const quantity = "01"; // 1 NFT
    const royalties = "00"; // 0%

    // If we have a CID, we can use it for hash (optional) 
    // real implementation might use sha256 of file, but here we just need a valid string or empty
    const hash = imageCid ? Buffer.from(imageCid).toString('hex') : "";

    // Attributes - keeping simple for now
    const attributes = Buffer.from("metadata:" + (imageUrl || "ipfs/" + imageCid)).toString('hex');

    // URIs - Priority to imageUrl (Supabase), fallback to IPFS
    const finalUri = imageUrl || ("https://ipfs.io/ipfs/" + imageCid);
    const uris = Buffer.from(finalUri).toString('hex');

    const dataString = `ESDTNFTCreate@${Buffer.from(collectionId).toString('hex')}@${quantity}@${nameHex}@${royalties}@${hash}@${attributes}@${uris}`;

    return new Transaction({
        value: 0n,
        data: new Uint8Array(Buffer.from(dataString)),
        receiver: new Address(senderAddress),
        sender: new Address(senderAddress),
        gasLimit: 60000000n,
        chainID: "D"
    });
};

export const createListNFTTransaction = (nftId: string, price: string, senderAddress: string): Transaction => {
    console.log("Constructing List NFT TX for:", { nftId, price });

    // Format: listNFT@nftId@price
    const dataString = `listNFT@${Buffer.from(nftId).toString('hex')}@${Buffer.from(price).toString('hex')}`;

    return new Transaction({
        value: 0n,
        data: new Uint8Array(Buffer.from(dataString)),
        receiver: new Address(senderAddress),
        sender: new Address(senderAddress),
        gasLimit: 10000000n,
        chainID: "D"
    });
};
