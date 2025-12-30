import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RouteNamesEnum } from '@/localConstants';

export interface TokenCardProps {
    name: string;
    ticker: string;
    description: string;
    imageUrl: string;
    marketCap: string;
    replies: number;
}

export const TokenCard = ({ name, ticker, description, imageUrl, marketCap, replies }: TokenCardProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // Using ticker as a dummy address for demo
        navigate(RouteNamesEnum.dashboardTokenDetails.replace(':address', ticker));
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            onClick={handleClick}
            className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden hover:border-neon-pink/50 transition-colors group cursor-pointer"
        >
            <div className="flex p-4 gap-4">
                <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-800">
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-slate-100 truncate pr-2 text-lg">
                                {name} <span className="text-slate-500 text-sm font-normal">({ticker})</span>
                            </h3>
                            <span className="text-xs font-mono text-neon-green bg-neon-green/10 px-2 py-0.5 rounded border border-neon-green/20">
                                MC: {marketCap}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                            {description}
                        </p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                        <span className="text-xs text-slate-500">
                            Launched by <span className="text-slate-300">User...</span>
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            💬 {replies} replies
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
