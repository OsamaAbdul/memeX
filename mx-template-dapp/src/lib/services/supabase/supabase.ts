import { createClient } from '@supabase/supabase-js';
import { API_URL } from '@/config';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// We use the real client. If URL is invalid/unreachable, requests will fail, 
// so we handle errors gracefully and fall back to Chain Data.
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

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
        // Try to fetch token definition
        // API often needs identifier (TICKER-123456), but symbol might just be TICKER.
        // If we only have ticker, we might search. For now assume symbol is identifier or we search.
        const response = await fetch(`${API_URL}/tokens/${symbol}`);
        if (!response.ok) return null;

        const data = await response.json();

        // Map Chain Data to TokenDB structure
        return {
            name: data.name,
            symbol: data.identifier, // Real identifier
            description: "On-chain asset. Detailed lore not available.",
            logo_url: data.assets?.pngUrl || data.assets?.svgUrl || '',
            banner_url: '', // API doesn't usually provide header image
            risk_score: 50, // Neutral score for unknown tokens
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

export const saveToken = async (tokenData: TokenDB) => {
    try {
        const { data, error } = await supabase
            .from('tokens')
            .insert([tokenData])
            .select();

        if (error) throw error;
        return data?.[0] || tokenData;
    } catch (error) {
        console.warn('Supabase save failed (Offline Mode?):', error);
        // Return input data so UI proceeds pretending it saved
        return tokenData;
    }
};

export const getTokens = async () => {
    try {
        const { data, error } = await supabase
            .from('tokens')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as TokenDB[];
    } catch (error) {
        console.warn('Supabase fetch failed:', error);
        return [];
    }
};

export const saveNFT = async (nftData: NFTDB) => {
    try {
        const { data, error } = await supabase
            .from('nfts')
            .insert([nftData])
            .select();

        if (error) throw error;
        return data?.[0] || nftData;
    } catch (error) {
        console.warn('Supabase save NFT failed:', error);
        return nftData;
    }
};

export const getNFTs = async () => {
    try {
        const { data, error } = await supabase
            .from('nfts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as NFTDB[];
    } catch (error) {
        console.warn('Supabase fetch NFTs failed:', error);
        return [];
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

export const getTokenBySymbol = async (symbol: string) => {
    // 1. Try DB
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

    // 2. Fallback to Chain
    const chainData = await fetchTokenFromChain(symbol);
    if (chainData) return chainData;

    // 3. Return null if absolutely nothing found
    return null;
};

export const uploadImageFromUrl = async (url: string, fileName: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
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
    } catch (error) {
        console.warn('Error uploading image to storage (returning original):', error);
        return url;
    }
};
