import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    ArrowUpCircle, Info, ShieldAlert,
    TrendingUp, Loader2
} from 'lucide-react';
import { getTokenBySymbol, TokenDB } from '@/lib/services/supabase/supabase';

// Mock data for the chart - keep as is for visual demo
const chartData = [
    { time: '00:00', price: 0.0001 },
    { time: '04:00', price: 0.00015 },
    { time: '08:00', price: 0.00012 },
    { time: '12:00', price: 0.00025 },
    { time: '16:00', price: 0.00035 },
    { time: '20:00', price: 0.00030 },
    { time: '23:59', price: 0.00050 },
];

/**
 * Lightweight Internal UI Components
 */
const Button = ({ children, className, variant, ...props }: any) => (
    <button
        className={`px-4 py-2 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 ${className}`}
        {...props}
    >
        {children}
    </button>
);

export const TokenDetails = () => {
    const { address: symbol } = useParams();
    const [token, setToken] = useState<TokenDB | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
    const [amount, setAmount] = useState('');
    const [activeTab, setActiveTab] = useState('about');

    useEffect(() => {
        const fetchToken = async () => {
            if (!symbol) return;
            try {
                const data = await getTokenBySymbol(symbol);
                setToken(data);
            } catch (error) {
                console.error("Error fetching token details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchToken();
    }, [symbol]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-12 w-12 text-neon-pink animate-spin" />
                <p className="text-slate-500 font-mono animate-pulse uppercase tracking-[0.2em]">Accessing Lore...</p>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <ShieldAlert className="h-12 w-12 text-neon-pink" />
                <p className="text-white font-bold">Token not found in the MultiversX archives.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            {/* Left Column - Chart & Info (8/12) */}
            <div className="lg:col-span-8 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-end bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                    <div className="flex gap-6 items-center">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-neon-pink/20 shrink-0 shadow-lg shadow-neon-pink/10">
                            <img src={token.logo_url} alt={token.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-bangers text-white uppercase tracking-widest leading-none">{token.name}</h1>
                                <span className="bg-neon-pink/20 text-neon-pink text-[10px] font-bold px-2 py-0.5 rounded border border-neon-pink/30">${token.symbol}</span>
                            </div>
                            <p className="text-slate-500 font-mono text-[10px] tracking-tight truncate max-w-[200px]">Launched by {token.creator_address}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Current Price</span>
                        <p className="text-2xl font-mono text-crypto-green leading-none">$0.00050</p>
                    </div>
                </div>

                {/* Chart Container */}
                <div className="bg-slate-950 border border-white/5 rounded-3xl p-6 h-[400px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-4 left-6 flex items-center gap-2 text-neon-pink text-[10px] font-bold uppercase tracking-widest z-10">
                        <TrendingUp className="h-3 w-3" /> Live Feed
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ff00ff" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ff00ff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                itemStyle={{ color: '#ff00ff', fontSize: '10px' }}
                            />
                            <Area type="monotone" dataKey="price" stroke="#ff00ff" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Info Tabs */}
                <div className="space-y-6">
                    <div className="flex p-1 bg-slate-900/50 border border-white/5 rounded-xl w-72">
                        {['about', 'activity'].map(v => (
                            <button
                                key={v}
                                onClick={() => setActiveTab(v)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === v ? 'bg-neon-pink text-white shadow-lg' : 'text-slate-500'}`}
                            >
                                {v.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'about' && (
                        <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-neon-blue/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-neon-blue/10 transition-colors" />
                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-widest relative z-10">
                                <Info className="h-4 w-4 text-neon-blue" /> Lore
                            </h3>
                            <div className="space-y-4 relative z-10">
                                <p className="text-slate-400 text-sm leading-relaxed italic">
                                    "{token.tagline || token.description}"
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Category</span>
                                        <p className="text-xs text-neon-blue font-bold">{token.category}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Tone</span>
                                        <p className="text-xs text-neon-pink font-bold">{token.tone}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Supply</span>
                                        <p className="text-xs text-white font-mono">{token.total_supply}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Audited By</span>
                                        <p className="text-xs text-green-400 font-bold uppercase">MemeX AI</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500/10 rounded-lg"><ArrowUpCircle className="h-3 w-3 text-green-400" /></div>
                                        <span className="text-xs text-white font-mono">erd1...{i}4x</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-white font-bold">12.5 EGLD</span>
                                        <span className="text-[10px] text-slate-500 block">2m ago</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column - Terminal (4/12) */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex gap-1.5 mb-6">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                    </div>

                    <div className="space-y-6">
                        <div className="flex p-1 bg-slate-950 rounded-xl border border-white/5">
                            <button
                                onClick={() => setTradeType('buy')}
                                className={`flex-1 py-3 rounded-lg font-bold text-xs transition-all ${tradeType === 'buy' ? 'bg-crypto-green text-black' : 'text-slate-500 hover:text-white'}`}
                            >
                                BUY
                            </button>
                            <button
                                onClick={() => setTradeType('sell')}
                                className={`flex-1 py-3 rounded-lg font-bold text-xs transition-all ${tradeType === 'sell' ? 'bg-neon-pink text-white' : 'text-slate-500 hover:text-white'}`}
                            >
                                SELL
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <span>Amount</span>
                                <span>Balance: 0.00 EGLD</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.0"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white font-mono text-xl outline-none focus:border-neon-pink/30 transition-all font-bold placeholder:text-slate-800"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">EGLD</span>
                            </div>
                        </div>

                        <Button className={`w-full py-4 text-sm rounded-xl shadow-lg ${tradeType === 'buy' ? 'bg-crypto-green hover:bg-green-400 text-black' : 'bg-neon-pink hover:bg-magenta-600 text-white'}`}>
                            {tradeType === 'buy' ? 'PLACE BUY ORDER' : 'PLACE SELL ORDER'}
                        </Button>

                        <div className="space-y-2 pt-4 border-t border-white/5">
                            <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-slate-500">Price Impact</span>
                                <span className="text-white">&lt; 0.1%</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-slate-500">Slippage</span>
                                <span className="text-white">1.0%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Card */}
                <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-neon-blue" /> AI Audit Report
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-300">Safety Score</span>
                            <span className={`text-xs font-bold ${token.risk_score < 30 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {100 - token.risk_score}/100
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${100 - token.risk_score}%` }}
                                className={`h-full ${token.risk_score < 30 ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]'}`}
                            />
                        </div>
                        <p className="text-[9px] text-slate-500 leading-normal">
                            {token.risk_score < 30
                                ? "Verified as non-custodial and Rug-Proof. Bonding curve mechanics satisfy MultiversX security standards."
                                : "Minor warnings detected. Ensure you review the tokenomics before investing chaotic amounts of EGLD."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
