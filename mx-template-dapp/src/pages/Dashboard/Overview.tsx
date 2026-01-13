import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Search, Filter, Loader2, Sparkles, User, BadgeCent, Gem, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TokenCard } from '@/components/launchpad/TokenCard';
import { NFTCard } from '@/components/launchpad/NFTCard';
import { getTokens, TokenDB, getNFTs, NFTDB, buyNFT } from '@/lib/services/supabase/supabase';
import { useGetAccount } from '@/lib';

export const Overview = () => {
    const { address } = useGetAccount();
    const [tokens, setTokens] = useState<TokenDB[]>([]);
    const [nfts, setNfts] = useState<NFTDB[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'all' | 'my'>('all');
    const [itemType, setItemType] = useState<'all' | 'meme' | 'nft'>('all');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const creatorFilter = (viewMode === 'my' && address) ? address : undefined;

                const [tokensData, nftsData] = await Promise.all([
                    getTokens(creatorFilter),
                    getNFTs(creatorFilter)
                ]);

                setTokens(tokensData);
                setNfts(nftsData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [viewMode, address]);

    // Combined Filter Logic
    const filteredItems = [
        ...tokens.map(t => ({ ...t, type: 'meme' })),
        ...nfts.map(n => ({ ...n, type: 'nft' }))
    ].filter(item => {
        // Search Filter
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

        // Type Filter
        if (itemType === 'meme' && item.type !== 'meme') return false;
        if (itemType === 'nft' && item.type !== 'nft') return false;

        return matchesSearch;
    });

    const handleBuyNFT = async (id: string, price: string) => {
        if (!address) return alert("Connect wallet first!");
        if (confirm(`Buy NFT for ${price} EGLD?`)) {
            await buyNFT(id, address);
            alert("Bought!");
            window.location.reload();
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-4xl font-bangers text-white uppercase tracking-widest">Dashboard</h1>
                    <p className="text-slate-500 text-sm">Track your portfolio and the hottest launches.</p>
                </div>

                <div className="flex gap-4">
                    {/* View Mode Switch (All Launches vs My Launches) */}
                    <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setViewMode('all')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <TrendingUp className="h-3 w-3" /> ALL
                        </button>
                        {address && (
                            <button
                                onClick={() => setViewMode('my')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'my' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <User className="h-3 w-3" /> MINE
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Type Filter Tabs */}
            <div className="flex justify-center">
                <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/10 shadow-2xl">
                    <button
                        onClick={() => setItemType('all')}
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${itemType === 'all' ? 'bg-neon-pink text-white shadow-[0_0_15px_rgba(255,0,255,0.4)]' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Sparkles className="h-4 w-4" /> EVERYTHING
                    </button>
                    <button
                        onClick={() => setItemType('meme')}
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${itemType === 'meme' ? 'bg-neon-blue text-slate-950 shadow-[0_0_15px_rgba(0,255,255,0.4)]' : 'text-slate-400 hover:text-white'}`}
                    >
                        <BadgeCent className="h-4 w-4" /> MEMECOINS
                    </button>
                    <button
                        onClick={() => setItemType('nft')}
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${itemType === 'nft' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Images className="h-4 w-4" /> NFTS
                    </button>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:border-neon-pink outline-none transition-all placeholder:text-slate-600"
                    />
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-12 w-12 text-neon-pink animate-spin" />
                    <p className="text-slate-500 font-mono animate-pulse">Syncing with MultiversX...</p>
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, index) => (
                            item.type === 'meme' ? (
                                <TokenCard
                                    key={`meme-${item.id || index}`}
                                    name={item.name}
                                    ticker={(item as TokenDB).symbol}
                                    description={item.description}
                                    imageUrl={(item as TokenDB).logo_url}
                                    marketCap={(item as TokenDB).total_supply}
                                    replies={0}
                                />
                            ) : (
                                <NFTCard
                                    key={`nft-${item.id || index}`}
                                    id={item.id!}
                                    name={item.name}
                                    description={item.description}
                                    imageUrl={(item as NFTDB).image_url}
                                    rarityScore={(item as NFTDB).rarity_score}
                                    category={(item as NFTDB).category}
                                    isListed={(item as NFTDB).is_listed}
                                    price={(item as NFTDB).price}
                                    onBuy={handleBuyNFT}
                                    onList={() => { }}
                                />
                            )
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
                    <div className="bg-slate-900/50 p-6 rounded-full border border-white/5">
                        <Sparkles className="h-12 w-12 text-slate-700" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">Nothing found</h3>
                        <p className="text-slate-500 max-w-xs">Try adjusting your filters or launch something new!</p>
                    </div>
                </div>
            )}
        </div>
    );
};
