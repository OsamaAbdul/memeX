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
import { signAndSendTransactions } from '@/helpers';
import {
    Transaction,
    Address,
    useGetAccount,
    useGetNetworkConfig,
    ProxyNetworkProvider,
    formatAmount
} from '@/lib';
import { contractAddress } from '@/config';

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

    // Balances
    const [tokenBalance, setTokenBalance] = useState('0');
    const [egldBalance, setEgldBalance] = useState('0');

    const { address, account: userAccount } = useGetAccount();
    const { network } = useGetNetworkConfig();

    useEffect(() => {
        const fetchData = async () => {
            if (!symbol) return;
            try {
                // 1. Fetch Token Details DB
                const data = await getTokenBySymbol(symbol);
                setToken(data);

                // 2. Fetch User Balances
                if (address) {
                    const proxyProvider = new ProxyNetworkProvider(network.apiAddress);

                    // Get EGLD Balance
                    const acc = await proxyProvider.getAccount(new Address(address));
                    setEgldBalance(formatAmount({ input: acc.balance.toString(), digits: 4, showLastNonZeroDecimal: false }));

                    // Get Token Balance
                    // API Call to get specific token balance
                    // Endpoint: /accounts/{address}/tokens/{identifier}
                    try {
                        const tokenRes = await fetch(`${network.apiAddress}/accounts/${address}/tokens/${symbol}`);
                        if (tokenRes.ok) {
                            const tokenData = await tokenRes.json();
                            // Assuming standard 18 decimals for these tokens for now, or use tokenData.decimals
                            setTokenBalance(formatAmount({ input: tokenData.balance, digits: 2, showLastNonZeroDecimal: false }));
                        } else {
                            setTokenBalance('0');
                        }
                    } catch (e) {
                        console.warn("Could not fetch token balance", e);
                        setTokenBalance('0');
                    }
                }

            } catch (error) {
                console.error("Error fetching details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [symbol, address, network.apiAddress]);

    const [estimatedOutput, setEstimatedOutput] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);

    // Debounce estimation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (amount && parseFloat(amount) > 0) {
                estimateTrade();
            } else {
                setEstimatedOutput('');
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [amount, tradeType, symbol]);


    const estimateTrade = async () => {
        if (!amount || !symbol) return;
        setIsSimulating(true);
        try {
            const proxyProvider = new ProxyNetworkProvider(network.apiAddress);

            // Construct Query
            // View: getAmountOut(token_identifier, amount_in, is_buy)
            // Input: TokenIdentifier, BigUint, bool

            // We need to manually construct the request for queryContract if we don't use the full SmartContract object overhead
            // Or typically:
            // const sc = new SmartContract({ address: new Address(contractAddress) });
            // ...

            // Simplified Query using raw values encoded
            // Arg1: Token Identifier (Hex)
            // Arg2: Amount In (BigUint Hex - even length)
            // Arg3: Is Buy (01 for true, 00 for false?) -> standard bool codec is 00/01? Actually 'true'/'false' in some codecs?
            // MultiversX Bool: 1 byte, 1 = true, 0 = false.

            const tokenIdHex = Buffer.from(symbol).toString('hex');

            // Amount In - adjust decimals
            // If Buy: Input is EGLD (18 decimals)
            // If Sell: Input is Token (Assuming 18 decimals)
            const inputVal = BigInt(Math.floor(parseFloat(amount) * 10 ** 18));
            let amountHex = inputVal.toString(16);
            if (amountHex.length % 2 !== 0) amountHex = '0' + amountHex;

            const isBuyHex = tradeType === 'buy' ? '01' : '00';

            const query = {
                scAddress: contractAddress,
                funcName: 'getAmountOut',
                args: [tokenIdHex, amountHex, isBuyHex]
            };

            const queryResponse = await proxyProvider.queryContract(query);

            // Parse Result
            // Output: BigUint
            if (queryResponse.returnData && queryResponse.returnData.length > 0) {
                const returnBuffer = Buffer.from(queryResponse.returnData[0], 'base64');
                const resultBig = BigInt('0x' + returnBuffer.toString('hex'));
                const formatted = formatAmount({ input: resultBig.toString(), digits: 4, showLastNonZeroDecimal: false });
                setEstimatedOutput(formatted);
            }

        } catch (e) {
            console.warn("Estimation failed", e);
            setEstimatedOutput('');
        } finally {
            setIsSimulating(false);
        }
    };

    const handleTrade = async () => {
        if (!amount || !token || !symbol) return;

        try {
            const proxyProvider = new ProxyNetworkProvider(network.apiAddress);
            const account = await proxyProvider.getAccount(new Address(address));

            let transaction: Transaction;

            if (tradeType === 'buy') {
                // Buy: Send EGLD, call buy@TokenID
                const valueBig = BigInt(Math.floor(parseFloat(amount) * 10 ** 18));
                const tokenIdHex = Buffer.from(symbol).toString('hex');

                transaction = new Transaction({
                    value: valueBig,
                    data: new TextEncoder().encode(`buy@${tokenIdHex}`),
                    receiver: new Address(contractAddress),
                    gasLimit: BigInt(10000000),
                    chainID: network.chainId,
                    sender: new Address(address),
                    nonce: account.nonce,
                    version: 2
                });
            } else {
                // Sell: Send Token, call sell
                // ESDTTransfer@TokenID@Amount@sell
                const valueBig = BigInt(Math.floor(parseFloat(amount) * 10 ** 18)); // Assuming 18 decimals? Usually Tokens are 18.
                // If token decimals differ, we need token info.

                const tokenIdHex = Buffer.from(symbol).toString('hex');
                const amountHex = valueBig.toString(16);
                const funcHex = Buffer.from('sell').toString('hex');

                const safeHex = (val: string) => val.length % 2 !== 0 ? '0' + val : val;

                const dataString = `ESDTTransfer@${safeHex(tokenIdHex)}@${safeHex(amountHex)}@${funcHex}`;

                transaction = new Transaction({
                    value: BigInt(0),
                    data: new TextEncoder().encode(dataString),
                    receiver: new Address(contractAddress),
                    gasLimit: BigInt(10000000),
                    chainID: network.chainId,
                    sender: new Address(address),
                    nonce: account.nonce,
                    version: 2
                });
            }

            await signAndSendTransactions({
                transactions: [transaction],
                transactionsDisplayInfo: {
                    processingMessage: `Processing ${tradeType.toUpperCase()} Order...`,
                    errorMessage: 'Transaction failed',
                    successMessage: 'Order Executed Successfully!'
                }
            });

        } catch (error) {
            console.error("Trade failed:", error);
        }
    };

    const [bondingCurveProgress, setBondingCurveProgress] = useState(0);

    useEffect(() => {
        const fetchContractData = async () => {
            // Fetch Contract Balance for Bonding Curve Progress
            try {
                const proxyProvider = new ProxyNetworkProvider(network.apiAddress);
                const contractAcc = await proxyProvider.getAccount(new Address(contractAddress));

                // Target is 50 EGLD (Mock target for now, usually defined in SC)
                const targetEgld = 50 * 10 ** 18;
                const currentBalance = BigInt(contractAcc.balance.toString());

                // Calculate percentage
                let progress = Number((currentBalance * 100n) / BigInt(targetEgld));
                if (progress > 100) progress = 100;
                setBondingCurveProgress(progress);

            } catch (e) {
                console.error("Failed to fetch contract balance", e);
            }
        };
        fetchContractData();
    }, [network.apiAddress]);

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

                {/* Bonding Curve Progress */}
                <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-4 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-2 relative z-10">
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            🚀 Graduation Progress
                            {bondingCurveProgress > 80 && <span className="text-[10px] bg-yellow-500 text-black px-2 rounded-full animate-pulse">KING OF THE HILL</span>}
                        </h4>
                        <span className="text-xs font-mono text-neon-blue">{bondingCurveProgress.toFixed(1)}% / 100%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 relative z-10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${bondingCurveProgress}%` }}
                            className="h-full bg-gradient-to-r from-neon-blue to-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.5)]"
                        />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 relative z-10">
                        When the market cap reaches <strong>50 EGLD</strong>, liquidity is deposited into xExchange and burned.
                    </p>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 blur-[40px] rounded-full" />
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
                                <span>Balance: {tradeType === 'buy' ? egldBalance : tokenBalance} {tradeType === 'buy' ? 'EGLD' : token?.symbol}</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.0"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white font-mono text-xl outline-none focus:border-neon-pink/30 transition-all font-bold placeholder:text-slate-800"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">{tradeType === 'buy' ? 'EGLD' : token?.symbol}</span>
                            </div>
                        </div>

                        <Button
                            className={`w-full py-4 text-sm rounded-xl shadow-lg ${tradeType === 'buy' ? 'bg-crypto-green hover:bg-green-400 text-black' : 'bg-neon-pink hover:bg-magenta-600 text-white'}`}
                            onClick={handleTrade}
                        >
                            {tradeType === 'buy' ? `BUY ${token?.symbol}` : `SELL ${token?.symbol}`}
                        </Button>

                        <div className="space-y-2 pt-4 border-t border-white/5">
                            {/* Estimation Display */}
                            <div className="flex justify-between items-center text-[10px] font-mono bg-white/5 p-2 rounded">
                                <span className="text-slate-400">You will receive:</span>
                                <span className="text-neon-pink font-bold flex items-center gap-2">
                                    {isSimulating ? <Loader2 className="h-3 w-3 animate-spin" /> : (estimatedOutput ? `~ ${estimatedOutput} ${tradeType === 'buy' ? token?.symbol : 'EGLD'}` : '-')}
                                </span>
                            </div>

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
