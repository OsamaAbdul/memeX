import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Brain, Palette, ShieldCheck, Cpu, ArrowRight, Loader2, AlertTriangle, CheckCircle2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import {
    TokenArchitectAgent,
    BrandGeneratorAgent,
    RiskGuardAgent,
    TransactionComposerAgent
} from '@/lib/services/ai/aiService';
import { signAndSendTransactions } from '@/helpers';
import {
    Transaction,
    Address,
    useGetAccount,
    useGetNetworkConfig,
    ProxyNetworkProvider
} from '@/lib';
import { saveToken, uploadImageFromUrl } from '@/lib/services/supabase/supabase';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { RouteNamesEnum } from '@/localConstants';
import { contractAddress } from '@/config';
import { createLaunchTransaction } from '@/lib/services/launchpad';
import DefaultLogo from '@/assets/img/-llxs6r.jpg';

const agents = [
    { id: 'architect', name: 'Token Architect', icon: Brain, color: 'text-blue-400' },
    { id: 'branding', name: 'Meme Generator', icon: Palette, color: 'text-purple-400' },
    { id: 'risk', name: 'Risk Guard', icon: ShieldCheck, color: 'text-green-400' },
    { id: 'transaction', name: 'Composer', icon: Cpu, color: 'text-neon-pink' },
];

const templates = [
    { name: 'Space Shiba', prompt: 'A futuristic Shiba Inu wearing a neon space helmet on Mars.', icon: '🐕', logo: DefaultLogo },
    { name: 'AI Pingu', prompt: 'A robotic penguin that controls the global financial markets.', icon: '🐧', logo: DefaultLogo },
    { name: 'Laser Frog', prompt: 'A pixel-art frog that shoots laser beams from its eyes.', icon: '🐸', logo: DefaultLogo },
    { name: 'Cyber Cat', prompt: 'A high-tech cat living in a synthwave city with glowing whiskers.', icon: '🐈', logo: DefaultLogo },
];

export const CreateToken = () => {
    const [prompt, setPrompt] = useState('');
    const [step, setStep] = useState<'input' | 'processing' | 'review'>('input');
    const [currentAgent, setCurrentAgent] = useState(0);
    const [isAutoPilot, setIsAutoPilot] = useState(false);
    const [selectedTone, setSelectedTone] = useState('Chaotic');
    const [selectedCategory, setSelectedCategory] = useState('Meme');

    // New State for Multi-Step Launch
    const [launchStep, setLaunchStep] = useState<'issue' | 'activate'>('issue');
    const [issuedTokenId, setIssuedTokenId] = useState('');
    const [isSigning, setIsSigning] = useState(false);

    // Editable Fields State
    const [customSupply, setCustomSupply] = useState('1,000,000,000');
    const [customLiquidity, setCustomLiquidity] = useState('100');

    const navigate = useNavigate();
    const { address } = useGetAccount();
    const { network } = useGetNetworkConfig();
    const { isGenerating, setGenerating, setGenerationResult, activeGeneration } = useAppStore();

    const handleGenerate = async (customPrompt?: string) => {
        const finalPrompt = customPrompt || prompt;
        if (!finalPrompt) return;

        setStep('processing');
        setGenerating(true);
        setCurrentAgent(0);

        try {
            const architectData = await TokenArchitectAgent(`${finalPrompt} [Tone: ${selectedTone}, Category: ${selectedCategory}]`);
            setGenerationResult('architect', architectData);
            setCurrentAgent(1);

            const brandingData = await BrandGeneratorAgent(architectData);
            setGenerationResult('branding', brandingData);
            setCurrentAgent(2);

            const riskData = await RiskGuardAgent(architectData);
            setGenerationResult('risk', riskData);
            setCurrentAgent(3);

            const txData = await TransactionComposerAgent(architectData);
            setGenerationResult('transaction', txData);

            setGenerating(false);

            if (isAutoPilot) {
                setStep('review');
                setTimeout(() => {
                    const signBtn = document.getElementById('autopilot-action');
                    if (signBtn) signBtn.click();
                }, 1000);
            } else {
                setStep('review');
            }
        } catch (error) {
            console.error("AI Launch failed", error);
            setGenerating(false);
            setStep('input');
        }
    };

    const handleIssueToken = async () => {
        try {
            if (!activeGeneration?.architect) return;
            const account = { nonce: 0 }; // In a real app we fetch nonce, but signAndSend handles it via provider usually or we fetch it.
            // Actually signAndSendTransactions uses provider which handles nonce usually, but the helper might need it. 
            // The previous code fetched it.
            const proxyProvider = new ProxyNetworkProvider(network.apiAddress);
            const onChainAccount = await proxyProvider.getAccount(new Address(address));

            const nameHex = Buffer.from(activeGeneration.architect.name).toString('hex');
            const symbolHex = Buffer.from(activeGeneration.architect.symbol).toString('hex');

            // Use custom supply from input (remove commas)
            const cleanSupply = customSupply.replace(/,/g, '');
            const supplyBig = BigInt(cleanSupply);
            let supplyHex = supplyBig.toString(16);
            if (supplyHex.length % 2 !== 0) supplyHex = '0' + supplyHex;

            // Issue Transaction
            // Receiver: System Contract for Issuance
            const systemContract = new Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u");

            const issueTransaction = new Transaction({
                value: BigInt("50000000000000000"), // 0.05 EGLD
                data: new TextEncoder().encode(`issue@${nameHex}@${symbolHex}@${supplyHex}@12`),
                receiver: systemContract,
                gasLimit: BigInt(60000000),
                chainID: network.chainId,
                sender: new Address(address),
                nonce: onChainAccount.nonce,
                version: 2
            });

            await signAndSendTransactions({
                transactions: [issueTransaction],
                transactionsDisplayInfo: {
                    processingMessage: 'Issuing Token on Network...',
                    errorMessage: 'Issuance failed',
                    successMessage: 'Token Issued Successfully! Please proceed to activation.'
                }
            });

            // Move to next step
            setLaunchStep('activate');

            alert("Transaction sent! Once confirmed, copy the Token ID from your wallet (e.g., MEME-123456) and paste it below.");

        } catch (e) {
            console.error("Issuance failed:", e);
        } finally {
            setIsSigning(false);
        }
    };

    const handleActivateMarket = async () => {
        if (!issuedTokenId) {
            alert("Please enter the Token Identifier from your wallet (e.g., MEME-123456)");
            return;
        }

        setIsSigning(true);
        try {
            if (!activeGeneration?.architect) return;
            const proxyProvider = new ProxyNetworkProvider(network.apiAddress);
            const onChainAccount = await proxyProvider.getAccount(new Address(address));

            const cleanSupply = customSupply.replace(/,/g, '');
            const supplyBig = BigInt(cleanSupply);

            // Use custom liquidity
            // Note: In real bonding curve, initial liquidity relates to virtual EGLD differently.
            // For now assuming the input is exactly the Virtual EGLD amount intended.
            const virtualEgld = BigInt(customLiquidity) * BigInt("1000000000000000000"); // EGLD has 18 decimals

            const launchTransaction = createLaunchTransaction({
                tokenId: issuedTokenId,
                supplyBigInt: supplyBig,
                virtualEgldAmount: virtualEgld,
                senderAddress: address
            });

            launchTransaction.nonce = BigInt(onChainAccount.nonce);

            await signAndSendTransactions({
                transactions: [launchTransaction],
                transactionsDisplayInfo: {
                    processingMessage: 'Initializing Bonding Curve...',
                    errorMessage: 'Activation failed',
                    successMessage: 'Market Active! 🚀'
                }
            });

            // Save to DB and Finish
            await handlePostLaunch();

        } catch (e) {
            console.error("Activation failed:", e);
        } finally {
            setIsSigning(false);
        }
    }

    const handlePostLaunch = async () => {
        if (!activeGeneration?.architect) return;

        // Permanent Storage for AI Art
        let finalLogoUrl = activeGeneration.branding?.logoUrl || '';
        let finalBannerUrl = activeGeneration.branding?.bannerUrl || '';

        if (finalLogoUrl) {
            finalLogoUrl = await uploadImageFromUrl(finalLogoUrl, `${activeGeneration.architect.symbol}_logo`);
        }
        if (finalBannerUrl) {
            finalBannerUrl = await uploadImageFromUrl(finalBannerUrl, `${activeGeneration.architect.symbol}_banner`);
        }

        // Save to Supabase
        await saveToken({
            name: activeGeneration.architect.name,
            symbol: fixedTokenId(), // Store the real ID
            description: activeGeneration.architect.description,
            logo_url: finalLogoUrl,
            banner_url: finalBannerUrl,
            risk_score: activeGeneration.risk?.riskScore || 0,
            total_supply: customSupply,
            category: activeGeneration.architect.category,
            tone: activeGeneration.architect.tone,
            tagline: activeGeneration.branding?.tagline || '',
            creator_address: address
        });

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff00ff', '#00ffff', '#ffffff']
        });

        // Navigate to the newly created token page
        setTimeout(() => {
            navigate(RouteNamesEnum.dashboardOverview);
        }, 3000);
    }

    // Helper to get symbol/id
    const fixedTokenId = () => issuedTokenId || activeGeneration?.architect?.symbol || '';

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 min-h-[70vh] flex flex-col items-center justify-center relative">
            {isSigning && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                    <Loader2 className="h-16 w-16 text-neon-pink animate-spin mb-4" />
                    <h2 className="text-3xl font-bangers text-white tracking-widest animate-pulse">Waiting for Wallet...</h2>
                    <p className="text-slate-400 mt-2">Please sign the transaction in your extension/app</p>
                </div>
            )}

            <AnimatePresence mode="wait">
                {step === 'input' && (
                    <motion.div
                        key="input-step"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full text-center space-y-8"
                    >
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl font-bangers text-white tracking-widest">
                                LAUNCH A <span className="text-neon-pink text-glow">MEMECOIN</span>
                            </h1>
                            <p className="text-slate-400 text-lg max-w-xl mx-auto">
                                Type a vibe. Our AI will generate the lore, tokenomics, and branding instantly.
                            </p>
                        </div>

                        <div className="relative max-w-2xl mx-auto">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe your meme idea (e.g. 'A cybernetic frog that controls the stock market')"
                                className="w-full h-32 bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 text-white text-xl focus:border-neon-pink outline-none transition-all placeholder:text-slate-600 resize-none shadow-2xl"
                            />
                            <Button
                                onClick={() => handleGenerate()}
                                disabled={!prompt}
                                className="absolute bottom-4 right-4 bg-neon-pink hover:bg-magenta-600 text-white rounded-xl px-6 py-4 flex items-center gap-2 group transition-all transform active:scale-95"
                            >
                                <span className="font-bold">GENERATE</span>
                                <Wand2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                            </Button>
                        </div>

                        <div className="space-y-3 max-w-2xl mx-auto">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Or choose a template</span>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {templates.map(t => (
                                    <button
                                        key={t.name}
                                        onClick={() => {
                                            setPrompt(t.prompt);
                                            handleGenerate(t.prompt);
                                        }}
                                        className="p-3 bg-slate-950 border border-white/5 rounded-xl text-left hover:border-neon-pink/50 transition-all group group-hover:bg-slate-900/50 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <span className="text-2xl">{t.icon}</span>
                                                <img src={t.logo} alt="Logo" className="w-6 h-6 rounded-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-white font-bold block truncate">{t.name}</span>
                                                <span className="text-[8px] text-slate-500 line-clamp-1 group-hover:text-slate-400">Launch now</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'processing' && (
                    <motion.div
                        key="processing-step"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full max-w-md space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">AI Engine Active...</h2>
                            <p className="text-slate-500">Constructing your memecoin reality</p>
                        </div>

                        <div className="space-y-4">
                            {agents.map((agent, index) => {
                                const Icon = agent.icon;
                                const isActive = currentAgent === index;
                                const isDone = currentAgent > index;

                                return (
                                    <div
                                        key={agent.id}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${isActive ? 'bg-slate-900/50 border-neon-pink/50 shadow-neon-pink/10 shadow-lg scale-105' :
                                            isDone ? 'bg-slate-900/20 border-green-500/20 opacity-100' : 'bg-transparent border-white/5 opacity-30'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-xl ${isActive ? 'bg-neon-pink/20' : 'bg-slate-800'}`}>
                                            <Icon className={`h-6 w-6 ${isActive ? agent.color : 'text-slate-400'}`} />
                                        </div>
                                        <div className="flex-grow">
                                            <span className={`font-bold block ${isActive ? 'text-white' : 'text-slate-500'}`}>{agent.name}</span>
                                            {isActive && <span className="text-xs text-neon-pink animate-pulse">Processing...</span>}
                                            {isDone && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Complete</span>}
                                        </div>
                                        {isActive && <Loader2 className="h-5 w-5 text-neon-pink animate-spin" />}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {step === 'review' && activeGeneration?.architect && (
                    <motion.div
                        key="review-step"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-3xl bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-neon-pink/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative z-10">
                            <div className="w-full aspect-square bg-slate-800 rounded-3xl flex items-center justify-center border-2 border-neon-pink/20 relative group overflow-hidden shadow-2xl">
                                {activeGeneration.branding?.logoUrl ? (
                                    <img
                                        key={activeGeneration.branding.logoUrl}
                                        src={activeGeneration.branding.logoUrl}
                                        alt="AI Generated Logo"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                    />
                                ) : (
                                    <Palette className="h-12 w-12 text-slate-600" />
                                )}
                                <div className="absolute top-4 right-4 bg-neon-pink/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{activeGeneration.architect.category}</div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-bangers text-white uppercase tracking-widest">{activeGeneration.architect.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-slate-800 rounded text-xs font-mono text-neon-pink border border-neon-pink/30">{fixedTokenId() || activeGeneration.architect.symbol + "M"}</span>
                                        <span className="text-slate-500 text-xs">{activeGeneration.architect.tone} Tone</span>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed mt-2">{activeGeneration.architect.description}</p>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Tokenomics</h3>
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Total Supply</span>
                                            <input
                                                type="text"
                                                value={customSupply}
                                                onChange={(e) => setCustomSupply(e.target.value)}
                                                className="bg-transparent text-right text-white font-mono border-b border-white/10 focus:border-neon-pink outline-none w-32"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Liquidity (EGLD)</span>
                                            <input
                                                type="text"
                                                value={customLiquidity}
                                                onChange={(e) => setCustomLiquidity(e.target.value)}
                                                className="bg-transparent text-right text-green-400 font-mono border-b border-white/10 focus:border-neon-pink outline-none w-24"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 space-y-4">
                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setStep('input')}
                                            className="flex-1 bg-transparent border-slate-700 text-slate-400 hover:text-white"
                                        >
                                            Try Again
                                        </Button>

                                        {!issuedTokenId ? (
                                            <Button
                                                onClick={handleIssueToken}
                                                className="flex-[2] bg-slate-800 hover:bg-slate-700 text-white font-bold h-12 flex items-center justify-center gap-2 border border-white/10"
                                            >
                                                <Cpu className="h-5 w-5" />
                                                1. Issue Token
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleActivateMarket}
                                                className="flex-[2] bg-neon-pink hover:bg-magenta-600 text-white font-bold h-12 flex items-center justify-center gap-2"
                                            >
                                                <Rocket className="h-5 w-5" />
                                                2. Launch Market
                                            </Button>
                                        )}
                                    </div>

                                    <div className="bg-slate-950/80 p-3 rounded-lg border border-white/5">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1">
                                            Token ID (Paste here after Step 1)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. MEME-123456"
                                            value={issuedTokenId}
                                            onChange={(e) => setIssuedTokenId(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs font-mono focus:border-neon-pink outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
