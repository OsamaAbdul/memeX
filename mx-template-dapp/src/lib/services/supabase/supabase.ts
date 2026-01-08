import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

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

export const saveToken = async (tokenData: TokenDB) => {
    const { data, error } = await supabase
        .from('tokens')
        .insert([tokenData])
        .select();

    if (error) {
        console.error('Error saving token to Supabase:', error);
        throw error;
    }

    return data[0];
};

export const getTokens = async () => {
    const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tokens from Supabase:', error);
        throw error;
    }

    return data as TokenDB[];
};

export const saveNFT = async (nftData: NFTDB) => {
    const { data, error } = await supabase
        .from('nfts')
        .insert([nftData])
        .select();

    if (error) {
        console.error('Error saving NFT to Supabase:', error);
        throw error;
    }

    return data[0];
};

export const getNFTs = async () => {
    const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching NFTs from Supabase:', error);
        throw error;
    }

    return data as NFTDB[];
};

export const listNFT = async (nftId: string, price: string) => {
    const { data, error } = await supabase
        .from('nfts')
        .update({ is_listed: true, price })
        .eq('id', nftId)
        .select();

    if (error) {
        console.error('Error listing NFT:', error);
        throw error;
    }

    return data[0];
};

export const getTokenBySymbol = async (symbol: string) => {
    const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('symbol', symbol)
        .single();

    if (error) {
        console.error('Error fetching token by symbol:', error);
        return null;
    }

    return data as TokenDB;
};

export const uploadImageFromUrl = async (url: string, fileName: string) => {
    try {
        // 1. Fetch the image as a blob
        const response = await fetch(url);
        const blob = await response.blob();

        // 2. Upload to Supabase Storage
        const filePath = `${Date.now()}_${fileName}.png`;
        const { data, error } = await supabase.storage
            .from('token-images')
            .upload(filePath, blob, {
                contentType: 'image/png'
            });

        if (error) throw error;

        // 3. Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('token-images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image to storage:', error);
        return url; // Fallback to original URL if upload fails
    }
};
