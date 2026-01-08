import { Transaction, Address } from "@multiversx/sdk-core";

export interface MintNFTParams {
    name: string;
    description: string;
    imageCid: string;
    attributes: Array<{ trait_type: string; value: string }>;
    senderAddress: string;
}

export const createMintNFTTransaction = ({
    name,
    imageCid,
    senderAddress,
}: MintNFTParams): Transaction => {
    console.log("Constructing Mint NFT TX for:", { name, imageCid });

    // Format: ESDTNFTCreate@collectionTokenIdentifier@quantity@name@royalties@hash@attributes@uris
    // For simplicity, we use a mock collection identifier
    const collectionId = "MEMEX-123456";
    const nameHex = Buffer.from(name).toString('hex');
    const quantity = "01"; // 1 NFT
    const royalties = "00"; // 0%
    const hash = Buffer.from(imageCid).toString('hex');
    const attributes = Buffer.from("metadata:ipfs/" + imageCid).toString('hex');
    const uris = Buffer.from("https://ipfs.io/ipfs/" + imageCid).toString('hex');

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
