import { motion } from 'framer-motion';
import { Gem, ArrowUpRight, Tag, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NFTCardProps {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    rarityScore: number;
    category: string;
    isListed: boolean;
    price?: string;
    onList: (id: string) => void;
    onBuy: (id: string, price: string) => void;
}

export const NFTCard = ({
    id,
    name,
    description,
    imageUrl,
    rarityScore,
    category,
    isListed,
    price,
    onList,
    onBuy
}: NFTCardProps) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md hover:border-neon-blue/30 transition-all duration-500"
        >
            {/* Image Section */}
            <div className="aspect-square relative overflow-hidden">
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                {/* Rarity Badge */}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                    <Gem className="h-3 w-3 text-neon-blue" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{category}</span>
                </div>

                {/* Listing Status */}
                {isListed && (
                    <div className="absolute top-4 right-4 bg-neon-blue text-slate-950 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                        On Sale
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5 space-y-4">
                <div>
                    <h3 className="text-xl font-bangers text-white uppercase tracking-wider group-hover:text-neon-blue transition-colors">
                        {name}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-1">{description}</p>
                </div>

                <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-white/5">
                    <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 uppercase font-bold">Rarity</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-neon-blue" style={{ width: `${rarityScore}%` }} />
                            </div>
                            <span className="text-[10px] text-white font-mono">{rarityScore}%</span>
                        </div>
                    </div>
                    {isListed && price && (
                        <div className="text-right">
                            <span className="text-[9px] text-slate-500 uppercase font-bold">Price</span>
                            <p className="text-sm font-bold text-neon-blue font-mono">{price} EGLD</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    {isListed ? (
                        <Button
                            onClick={() => onBuy(id, price || '0')}
                            className="flex-1 bg-neon-blue hover:bg-cyan-600 text-slate-950 rounded-xl font-bold h-10 gap-2"
                        >
                            <ShoppingCart className="h-4 w-4" /> BUY NOW
                        </Button>
                    ) : (
                        <Button
                            onClick={() => onList(id)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold h-10 gap-2 border border-white/5"
                        >
                            <Tag className="h-4 w-4" /> LIST FOR SALE
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        className="w-10 h-10 p-0 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400"
                    >
                        <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};
