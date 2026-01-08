import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Brain, Palette, ShieldCheck, Cpu, ArrowRight, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
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

const agents = [
    { id: 'architect', name: 'Token Architect', icon: Brain, color: 'text-blue-400' },
    { id: 'branding', name: 'Meme Generator', icon: Palette, color: 'text-purple-400' },
    { id: 'risk', name: 'Risk Guard', icon: ShieldCheck, color: 'text-green-400' },
    { id: 'transaction', name: 'Composer', icon: Cpu, color: 'text-neon-pink' },
];

const templates = [
    { name: 'Space Shiba', prompt: 'A futuristic Shiba Inu wearing a neon space helmet on Mars.', icon: '🐕' },
    { name: 'AI Pingu', prompt: 'A robotic penguin that controls the global financial markets.', icon: '🐧' },
    { name: 'Laser Frog', prompt: 'A pixel-art frog that shoots laser beams from its eyes.', icon: '🐸' },
    { name: 'Cyber Cat', prompt: 'A high-tech cat living in a synthwave city with glowing whiskers.', icon: '🐈' },
];

export const CreateToken = () => {
    const [prompt, setPrompt] = useState('');
    const [step, setStep] = useState<'input' | 'processing' | 'review'>('input');
    const [currentAgent, setCurrentAgent] = useState(0);
    const [isAutoPilot, setIsAutoPilot] = useState(false);
    const [selectedTone, setSelectedTone] = useState('Chaotic');
    const [selectedCategory, setSelectedCategory] = useState('Meme');
    const navigate = useNavigate();
    const { address } = useGetAccount();
    const { network } = useGetNetworkConfig();
    const { isGenerating, setGenerating, setGenerationResult, activeGeneration } = useAppStore();

    const handleStartLaunch = async (customPrompt?: string) => {
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
                // If autopilot is on, we'll try to trigger the launch immediately
                // However, handleSignAndLaunch needs activeGeneration to be set, 
                // and state updates are async. In a real app, we'd pass the data directly.
                // For this demo, we'll move to review but set a high-speed transition.
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

    const handleSignAndLaunch = async () => {
        try {
            if (!activeGeneration?.architect) return;

            const proxyProvider = new ProxyNetworkProvider(network.apiAddress);
            const account = await proxyProvider.getAccount(new Address(address));

            // Create a payload that simulates a token issuance
            // format: issue@NAME@SYMBOL@SUPPLY@DECIMALS
            const nameHex = Buffer.from(activeGeneration.architect.name).toString('hex');
            const symbolHex = Buffer.from(activeGeneration.architect.symbol).toString('hex');
            const supplyHex = BigInt(activeGeneration.architect.tokenomics.totalSupply.replace(/,/g, '')).toString(16);

            const launchTransaction = new Transaction({
                value: BigInt(0),
                data: new TextEncoder().encode(`issue@${nameHex}@${symbolHex}@${supplyHex}@12`),
                receiver: new Address(address),
                gasLimit: BigInt(500000),
                chainID: network.chainId,
                sender: new Address(address),
                nonce: account.nonce,
                version: 2
            });

            await signAndSendTransactions({
                transactions: [launchTransaction],
                transactionsDisplayInfo: {
                    processingMessage: 'Launching your meme to the moon...',
                    errorMessage: 'Launch aborted by the space kraken',
                    successMessage: 'Token is LIVE! 🚀'
                }
            });

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
                symbol: activeGeneration.architect.symbol,
                description: activeGeneration.architect.description,
                logo_url: finalLogoUrl,
                banner_url: finalBannerUrl,
                risk_score: activeGeneration.risk?.riskScore || 0,
                total_supply: activeGeneration.architect.tokenomics.totalSupply,
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

        } catch (e) {
            console.error("Signing failed:", e);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 min-h-[70vh] flex flex-col items-center justify-center">
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
                                LAUNCH A <span className="text-neon-pink text-glow">MEME</span>
                            </h1>
                            <p className="text-slate-400 text-lg max-w-xl mx-auto">
                                Type one sentence. Our AI agents will handle the names, branding, tokenomics, and risk checks.
                            </p>
                        </div>

                        <div className="relative max-w-2xl mx-auto">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe your meme idea (e.g. 'A chaotic cat coin for crypto degenerates')"
                                className="w-full h-32 bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 text-white text-xl focus:border-neon-pink outline-none transition-all placeholder:text-slate-600 resize-none shadow-2xl"
                            />
                            <Button
                                onClick={() => handleStartLaunch()}
                                disabled={!prompt}
                                className="absolute bottom-4 right-4 bg-neon-pink hover:bg-magenta-600 text-white rounded-xl px-6 py-4 flex items-center gap-2 group transition-all transform active:scale-95"
                            >
                                <span className="font-bold">GENERATE</span>
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>

                        <div className="max-w-2xl mx-auto space-y-6 text-left bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                            <div className="flex flex-col md:flex-row gap-6 justify-between">
                                <div className="space-y-3">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Select Vibe</span>
                                    <div className="flex gap-2">
                                        {['Chaotic', 'Serious', 'Bullish'].map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setSelectedTone(v)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedTone === v ? 'bg-neon-pink border-neon-pink text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Fast Track</span>
                                    <div
                                        onClick={() => setIsAutoPilot(!isAutoPilot)}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${isAutoPilot ? 'bg-neon-pink' : 'bg-slate-800'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isAutoPilot ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Need inspiration?</span>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {templates.map(t => (
                                        <button
                                            key={t.name}
                                            onClick={() => {
                                                setPrompt(t.prompt);
                                                handleStartLaunch(t.prompt);
                                            }}
                                            className="p-3 bg-slate-950 border border-white/5 rounded-xl text-left hover:border-neon-pink/50 transition-all group group-hover:bg-slate-900/50"
                                        >
                                            <span className="text-xl mb-1 block">{t.icon}</span>
                                            <span className="text-[10px] text-white font-bold block truncate">{t.name}</span>
                                            <span className="text-[8px] text-slate-500 line-clamp-1 group-hover:text-slate-400">Launch now</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-6 text-slate-500 text-sm">
                            <div className="flex items-center gap-2"><Brain className="h-4 w-4" /> Smart Tokenomics</div>
                            <div className="flex items-center gap-2"><Palette className="h-4 w-4" /> AI Branding</div>
                            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Risk Guard</div>
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
                            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">AI Agents working...</h2>
                            <p className="text-slate-500">Orchestrating the launch sequence</p>
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
                                            {isDone && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Ready</span>}
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
                        className="w-full max-w-2xl bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-neon-pink/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                            <div className="w-full md:w-1/3 aspect-square bg-slate-800 rounded-3xl flex items-center justify-center border-2 border-neon-pink/20 relative group overflow-hidden">
                                {activeGeneration.branding?.logoUrl ? (
                                    <img
                                        src={activeGeneration.branding.logoUrl}
                                        alt="AI Generated Art"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                    />
                                ) : (
                                    <Palette className="h-12 w-12 text-slate-600" />
                                )}
                                <div className="absolute bottom-2 right-2 bg-slate-950/80 px-3 py-1 rounded-lg text-[10px] text-slate-400 font-bold border border-white/5 uppercase">AI GEN</div>
                            </div>

                            <div className="flex-grow space-y-6 w-full">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-4xl font-bangers text-white uppercase tracking-widest">{activeGeneration.architect.name}</h2>
                                        <span className="bg-neon-blue/20 text-neon-blue text-xs font-bold px-3 py-1 rounded-full border border-neon-blue/20">${activeGeneration.architect.symbol}</span>
                                    </div>
                                    <p className="text-slate-400 italic">"{activeGeneration.branding?.tagline || 'Ready to launch!'}"</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-1">Total Supply</span>
                                        <span className="text-white font-mono">{activeGeneration.architect.tokenomics.totalSupply}</span>
                                    </div>
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-1">Risk Score</span>
                                        <span className={`font-bold ${activeGeneration.risk?.riskScore < 30 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {activeGeneration.risk?.riskScore || 0}/100
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-neon-pink/5 border border-neon-pink/10 p-4 rounded-xl flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-neon-pink flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-slate-400">
                                        High-risk experimental token. This platform does not guarantee profits. Transaction requires EGLD for gas and bonding curve liquidity.
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep('input')}
                                        className="flex-1 bg-transparent border-slate-700 text-slate-400 hover:text-white"
                                    >
                                        REGENERATE
                                    </Button>
                                    <Button
                                        id="autopilot-action"
                                        onClick={handleSignAndLaunch}
                                        className="flex-grow bg-neon-pink hover:bg-magenta-600 text-white font-bold h-12 flex items-center gap-2"
                                    >
                                        <Rocket className="h-5 w-5" />
                                        SIGN & LAUNCH
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
