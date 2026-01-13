import { Transaction, Address } from "@multiversx/sdk-core";
import { contractAddress, API_URL } from "@/config";

// Mock IPFS Service
export const uploadExampleImage = async (file: File): Promise<string> => {
    console.log("Mock uploading file:", file.name);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Return a dummy CID (IPFS Hash)
    return "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
};

// Fetch User Tokens from Chain
export const getUserTokensFromChain = async (address: string) => {
    try {
        const response = await fetch(`${API_URL}/accounts/${address}/tokens?size=100`);
        if (!response.ok) throw new Error("Failed to fetch tokens");
        return await response.json(); // Returns array of tokens
    } catch (e) {
        console.error("Error fetching user tokens:", e);
        return [];
    }
};

// Launch Transaction Construction
export interface LaunchTokenParams {
    tokenId: string;
    supplyBigInt: bigint;
    virtualEgldAmount: bigint;
    senderAddress: string;
}

export const createLaunchTransaction = ({
    tokenId,
    supplyBigInt,
    virtualEgldAmount,
    senderAddress,
}: LaunchTokenParams): Transaction => {
    console.log("Constructing Launch TX for:", { tokenId, supplyBigInt, virtualEgldAmount, contractAddress });

    const safeHex = (val: string) => val.length % 2 !== 0 ? '0' + val : val;
    const tokenIdHex = Buffer.from(tokenId).toString('hex');
    const supplyHex = supplyBigInt.toString(16);
    const virtualEgldHex = virtualEgldAmount.toString(16);

    // ESDTTransfer@TokenID@Amount@Function@Args
    // We use 'launch_token' function
    // Arg1: Virtual EGLD Amount
    const dataString = `ESDTTransfer@${safeHex(tokenIdHex)}@${safeHex(supplyHex)}@${Buffer.from('launch_token').toString('hex')}@${safeHex(virtualEgldHex)}`;

    return new Transaction({
        value: 0n,
        data: new Uint8Array(Buffer.from(dataString)),
        receiver: new Address(contractAddress), // Send to Smart Contract
        sender: new Address(senderAddress),
        gasLimit: 10000000n,
        chainID: "D"
    });
};
