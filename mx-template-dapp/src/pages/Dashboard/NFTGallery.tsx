import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Loader2, Sparkles, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NFTCard } from '@/components/launchpad/NFTCard';
import { getNFTs, NFTDB, listNFT } from '@/lib/services/supabase/supabase';

export const NFTGallery = () => {
    const [nfts, setNfts] = useState<NFTDB[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'listed'>('all');

    useEffect(() => {
        const fetchNFTs = async () => {
            try {
                const data = await getNFTs();
                setNfts(data);
            } catch (error) {
                console.error("Failed to fetch NFTs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNFTs();
    }, []);

    const handleList = async (id: string) => {
        const price = prompt("Enter listing price in EGLD:");
        if (!price || isNaN(Number(price))) return;

        try {
            await listNFT(id, price);
            setNfts(prev => prev.map(n => n.id === id ? { ...n, is_listed: true, price } : n));
            console.log("NFT listed for sale! 🚀");
        } catch (error) {
            console.error("Failed to list NFT");
        }
    };

    const handleBuy = async (id: string) => {
        console.log("Purchase transaction initiated! 💎");
        // Simulated buy logic
    };

    const filteredNFTs = nfts.filter(n => {
        const matchesSearch = n.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || n.is_listed;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-8 pb-20">
            {/* Header section with Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bangers text-white uppercase tracking-widest">NFT Marketplace</h1>
                    <p className="text-slate-500 text-sm">Discover and trade unique AI-generated meme collectibles.</p>
                </div>

                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-neon-blue text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        ALL ARTWORKS
                    </button>
                    <button
                        onClick={() => setActiveTab('listed')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'listed' ? 'bg-neon-blue text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        ON SALE
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
                        placeholder="Search NFTs by name or traits..."
                        className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:border-neon-blue outline-none transition-all placeholder:text-slate-600"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none border-white/5 bg-slate-950 text-slate-400 gap-2 hover:text-white">
                        <Filter className="h-4 w-4" /> Attributes
                    </Button>
                    <div className="h-10 w-[1px] bg-white/5 mx-2 hidden md:block" />
                    <Button variant="ghost" className="p-2 text-neon-blue bg-neon-blue/10">
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="p-2 text-slate-500">
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-12 w-12 text-neon-blue animate-spin" />
                    <p className="text-slate-500 font-mono animate-pulse">Scanning the blockchain...</p>
                </div>
            ) : filteredNFTs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredNFTs.map((nft) => (
                            <NFTCard
                                key={nft.id}
                                id={nft.id!}
                                name={nft.name}
                                description={nft.description}
                                imageUrl={nft.image_url}
                                rarityScore={nft.rarity_score}
                                category={nft.category}
                                isListed={nft.is_listed}
                                price={nft.price}
                                onList={handleList}
                                onBuy={handleBuy}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
                    <div className="bg-slate-900/50 p-6 rounded-full border border-white/5">
                        <Sparkles className="h-12 w-12 text-slate-700" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">No NFTs found</h3>
                        <p className="text-slate-500 max-w-xs">Be the first to mint a legendary piece of art!</p>
                    </div>
                    <Button
                        onClick={() => window.location.href = '/dashboard/create-nft'}
                        className="bg-neon-blue hover:bg-cyan-600 text-slate-950 px-8 rounded-xl font-bold"
                    >
                        MINT FIRST NFT
                    </Button>
                </div>
            )}
        </div>
    );
};
