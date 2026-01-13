import { createClient } from '@supabase/supabase-js';
import { API_URL } from '@/config';

// Updated Credentials provided by user
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Local Storage Keys
const STORAGE_KEYS = {
    TOKENS: 'memex_local_tokens',
    NFTS: 'memex_local_nfts'
};



export interface TokenDB {
    id?: string;
    created_at?: string;
    name: string;
    symbol: string;
    description: string;
    logo_url: string;
    banner_url: string;
    risk_score: number;
    total_supply: string;
    category: string;
    tone: string;
    tagline: string;
    creator_address: string;
    transaction_hash?: string;
}

export interface NFTDB {
    id?: string;
    created_at?: string;
    name: string;
    description: string;
    image_url: string;
    rarity_score: number;
    category: string;
    attributes: any;
    creator_address: string;
    is_listed: boolean;
    price?: string;
    transaction_hash?: string;
}

/**
 * Fallback: Fetch Token Details from MultiversX API
 */
const fetchTokenFromChain = async (symbol: string): Promise<TokenDB | null> => {
    try {
        const response = await fetch(`${API_URL}/tokens/${symbol}`);
        if (!response.ok) return null;

        const data = await response.json() as {
            name: string;
            identifier: string;
            assets?: { pngUrl?: string; svgUrl?: string };
            supply: string;
            owner: string;
        };

        return {
            name: data.name,
            symbol: data.identifier,
            description: "On-chain asset. Detailed lore not available.",
            logo_url: data.assets?.pngUrl || data.assets?.svgUrl || '',
            banner_url: '',
            risk_score: 50,
            total_supply: data.supply,
            category: "Utility",
            tone: "Serious",
            tagline: "Unleashed on MultiversX",
            creator_address: data.owner
        };
    } catch (e) {
        console.warn("Failed to fetch from chain:", e);
        return null;
    }
};

// Helper to save to local storage
const saveToLocal = (key: string, item: any) => {
    try {
        const current = JSON.parse(localStorage.getItem(key) || '[]');
        localStorage.setItem(key, JSON.stringify([item, ...current]));
    } catch (e) {
        console.error("Local storage save failed:", e);
    }
};

// Helper to get from local storage
const getFromLocal = <T>(key: string, creatorAddress?: string): T[] => {
    try {
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        if (creatorAddress) {
            return items.filter((i: any) => i.creator_address === creatorAddress);
        }
        return items;
    } catch (e) {
        return [];
    }
};

export const saveToken = async (tokenData: TokenDB) => {
    // Optimistically save to local storage first
    saveToLocal(STORAGE_KEYS.TOKENS, { ...tokenData, id: `local-${Date.now()}`, created_at: new Date().toISOString() });

    try {
        const { data, error } = await supabase
            .from('tokens')
            .insert([tokenData])
            .select();

        if (error) throw error;
        return data?.[0] || tokenData;
    } catch (error) {
        console.warn('Supabase save failed, using local storage:', error);
        return tokenData;
    }
};

export const getTokens = async (creatorAddress?: string, limit?: number) => {
    const localTokens = getFromLocal(STORAGE_KEYS.TOKENS, creatorAddress);

    try {
        let query = supabase
            .from('tokens')
            .select('*')
            .order('created_at', { ascending: false });

        if (creatorAddress) {
            query = query.eq('creator_address', creatorAddress);
        }

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Merge local/remote, prefer remote if duplicates (simple approach: just concat)
        return [...localTokens, ...(data || [])];
    } catch (error) {
        console.warn('Supabase fetch failed, returning local tokens:', error);
        return localTokens;
    }
};

export const saveNFT = async (nftData: NFTDB) => {
    saveToLocal(STORAGE_KEYS.NFTS, { ...nftData, id: `local-${Date.now()}`, created_at: new Date().toISOString() });

    try {
        const { data, error } = await supabase
            .from('nfts')
            .insert([nftData])
            .select();

        if (error) throw error;
        return data?.[0] || nftData;
    } catch (error) {
        console.warn('Supabase save NFT failed, using local storage:', error);
        return nftData;
    }
};

export const getNFTs = async (creatorAddress?: string): Promise<NFTDB[]> => {
    const localNFTs = getFromLocal<NFTDB>(STORAGE_KEYS.NFTS, creatorAddress);

    try {
        let query = supabase
            .from('nfts')
            .select('*')
            .order('created_at', { ascending: false });

        if (creatorAddress) {
            query = query.eq('creator_address', creatorAddress);
        }

        const { data, error } = await query;
        if (error) throw error;

        return [...localNFTs, ...((data as NFTDB[]) || [])];
    } catch (error) {
        console.warn('Supabase fetch NFTs failed, returning local:', error);
        return localNFTs;
    }
};

export const listNFT = async (nftId: string, price: string) => {
    try {
        const { data, error } = await supabase
            .from('nfts')
            .update({ is_listed: true, price })
            .eq('id', nftId)
            .select();

        if (error) throw error;
        return data?.[0];
    } catch (error) {
        console.warn('Supabase list NFT failed:', error);
        return null;
    }
};

export const buyNFT = async (nftId: string, buyerAddress: string) => {
    try {
        // 1. Update in DB
        const { data, error } = await supabase
            .from('nfts')
            .update({
                creator_address: buyerAddress,
                is_listed: false,
                price: null
            })
            .eq('id', nftId)
            .select();

        // 2. Update Local Storage (Mock)
        const localNFTs = getFromLocal<NFTDB>(STORAGE_KEYS.NFTS);
        const updatedLocal = localNFTs.map(n =>
            n.id === nftId
                ? { ...n, creator_address: buyerAddress, is_listed: false, price: undefined }
                : n
        );
        localStorage.setItem(STORAGE_KEYS.NFTS, JSON.stringify(updatedLocal));

        if (error) throw error;
        return data?.[0];
    } catch (error) {
        console.warn('Supabase buy NFT failed (using local fallback):', error);
        // Fallback return for local-only mode
        return { id: nftId, owner: buyerAddress };
    }
};

export const getTokenBySymbol = async (symbol: string) => {
    // 1. Check Local
    const localTokens = getFromLocal<TokenDB>(STORAGE_KEYS.TOKENS);
    const found = localTokens.find((t: TokenDB) => t.symbol === symbol);
    if (found) return found;

    // 2. Try DB
    try {
        const { data, error } = await supabase
            .from('tokens')
            .select('*')
            .eq('symbol', symbol)
            .single();

        if (!error && data) {
            return data as TokenDB;
        }
    } catch (e) {
        console.warn("DB Fetch failed, falling back to chain");
    }

    // 3. Fallback to Chain
    const chainData = await fetchTokenFromChain(symbol);
    if (chainData) return chainData;

    return null;
};

export const uploadImageFromUrl = async (url: string, fileName: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return await uploadBlob(blob, fileName);
    } catch (error) {
        console.warn('Error uploading image to storage (returning original):', error);
        return url;
    }
};

export const uploadImageFromFile = async (file: File, fileName: string) => {
    try {
        return await uploadBlob(file, fileName);
    } catch (error) {
        console.warn("Error uploading file:", error);
        return URL.createObjectURL(file); // Fallback to local preview
    }
};

const uploadBlob = async (blob: Blob | File, fileName: string) => {
    const filePath = `${Date.now()}_${fileName}.png`;
    const { data, error } = await supabase.storage
        .from('token-images')
        .upload(filePath, blob, {
            contentType: 'image/png'
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('token-images')
        .getPublicUrl(filePath);

    return publicUrl;
};
