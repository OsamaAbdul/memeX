import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Search, Filter, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TokenCard } from '@/components/launchpad/TokenCard';
import { getTokens, TokenDB } from '@/lib/services/supabase/supabase';

export const Overview = () => {
    const [tokens, setTokens] = useState<TokenDB[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const data = await getTokens();
                setTokens(data);
            } catch (error) {
                console.error("Failed to fetch tokens:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTokens();
    }, []);

    const filteredTokens = tokens.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search memes by name or ticker..."
                        className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:border-neon-pink outline-none transition-all placeholder:text-slate-600"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none border-white/5 bg-slate-950 text-slate-400 gap-2 hover:text-white">
                        <Filter className="h-4 w-4" /> Filter
                    </Button>
                    <Button variant="outline" className="flex-1 md:flex-none border-white/5 bg-slate-950 text-slate-400 gap-2 hover:text-white">
                        <TrendingUp className="h-4 w-4" /> Trending
                    </Button>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-12 w-12 text-neon-pink animate-spin" />
                    <p className="text-slate-500 font-mono animate-pulse">Syncing with MultiversX...</p>
                </div>
            ) : filteredTokens.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredTokens.map((token, index) => (
                            <TokenCard
                                key={token.id || index}
                                name={token.name}
                                ticker={token.symbol}
                                description={token.description}
                                imageUrl={token.logo_url}
                                marketCap={token.total_supply} // For demo purpose
                                replies={Math.floor(Math.random() * 50)} // Simulated
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
                        <h3 className="text-2xl font-bold text-white">No memes found</h3>
                        <p className="text-slate-500 max-w-xs">Be the first to launch a meme on the moon!</p>
                    </div>
                    <Button
                        onClick={() => window.location.href = '/dashboard/create'}
                        className="bg-neon-pink hover:bg-magenta-600 text-white px-8 rounded-xl font-bold"
                    >
                        LAUNCH NOW
                    </Button>
                </div>
            )}
        </div>
    );
};
