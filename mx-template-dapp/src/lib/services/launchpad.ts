import { Transaction, Address } from "@multiversx/sdk-core";

// Mock IPFS Service
export const uploadExampleImage = async (file: File): Promise<string> => {
    console.log("Mock uploading file:", file.name);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Return a dummy CID (IPFS Hash)
    return "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
};

// Mock Launch Transaction Construction
export interface LaunchTokenParams {
    name: string;
    ticker: string;
    description?: string;
    imageCid: string;
    senderAddress: string;
}

export const createLaunchTransaction = ({
    name,
    ticker,
    imageCid,
    senderAddress,
}: LaunchTokenParams): Transaction => {
    // In a real scenario, this would interact with the Factory Contract
    console.log("Constructing Launch TX for:", { name, ticker, imageCid });

    const dataString = `launchToken@${Buffer.from(name).toString('hex')}@${Buffer.from(ticker).toString('hex')}@${Buffer.from(imageCid).toString('hex')}`;

    return new Transaction({
        value: 0n,
        data: new Uint8Array(Buffer.from(dataString)),
        receiver: new Address(senderAddress),
        sender: new Address(senderAddress),
        gasLimit: 60000000n,
        chainID: "D"
    });
};
