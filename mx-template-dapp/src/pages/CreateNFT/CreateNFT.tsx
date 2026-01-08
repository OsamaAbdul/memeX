import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Brain, Palette, ShieldCheck, Cpu, ArrowRight, Loader2, CheckCircle2, Sparkles, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import {
    NFTArchitectAgent,
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
import { saveNFT, uploadImageFromUrl } from '@/lib/services/supabase/supabase';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { RouteNamesEnum } from '@/localConstants';

const agents = [
    { id: 'architect', name: 'NFT Architect', icon: Brain, color: 'text-blue-400' },
    { id: 'branding', name: 'Art Generator', icon: Palette, color: 'text-purple-400' },
    { id: 'risk', name: 'Rarity Check', icon: ShieldCheck, color: 'text-green-400' },
    { id: 'transaction', name: 'Composer', icon: Cpu, color: 'text-neon-pink' },
];

const nftTemplates = [
    { name: 'Cyber Viking', prompt: 'A legendary viking warrior with glowing blue cybernetic eyes and a plasma axe.', icon: '🛡️' },
    { name: 'Neon Samurai', prompt: 'A futuristic samurai standing in the rain of a Tokyo-inspired cyber city.', icon: '⚔️' },
    { name: 'Space Wizard', prompt: 'A mystical wizard floating in deep space, casting spells made of stardust.', icon: '🧙‍♂️' },
    { name: 'Digital Dragon', prompt: 'A majestic dragon composed of green binary code and glowing data streams.', icon: '🐲' },
];

export const CreateNFT = () => {
    const [prompt, setPrompt] = useState('');
    const [step, setStep] = useState<'input' | 'processing' | 'review'>('input');
    const [currentAgent, setCurrentAgent] = useState(0);
    const [isAutoPilot, setIsAutoPilot] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Epic');
    const navigate = useNavigate();
    const { address } = useGetAccount();
    const { network } = useGetNetworkConfig();
    const { setGenerating } = useAppStore();
    const [activeNFT, setActiveNFT] = useState<any>(null);

    const handleStartLaunch = async (customPrompt?: string) => {
        const finalPrompt = customPrompt || prompt;
        if (!finalPrompt) return;

        setStep('processing');
        setGenerating(true);
        setCurrentAgent(0);

        try {
            const architectData = await NFTArchitectAgent(`${finalPrompt} [Category: ${selectedCategory}]`);
            setCurrentAgent(1);

            const brandingData = await BrandGeneratorAgent(architectData as any);
            setCurrentAgent(2);

            const riskData = await RiskGuardAgent(architectData as any);
            setCurrentAgent(3);

            const txData = await TransactionComposerAgent(architectData as any);

            setActiveNFT({
                architect: architectData,
                branding: brandingData,
                risk: riskData,
                transaction: txData
            });

            setGenerating(false);

            if (isAutoPilot) {
                setStep('review');
                setTimeout(() => {
                    const mintBtn = document.getElementById('autopilot-action-nft');
                    if (mintBtn) mintBtn.click();
                }, 1000);
            } else {
                setStep('review');
            }
        } catch (error) {
            console.error("AI NFT Creation failed", error);
            setGenerating(false);
            setStep('input');
        }
    };

    const handleSignAndMint = async () => {
        try {
            if (!activeNFT?.architect) return;

            const proxyProvider = new ProxyNetworkProvider(network.apiAddress);
            const account = await proxyProvider.getAccount(new Address(address));

            // Create a payload that simulates an NFT minting
            const nameHex = Buffer.from(activeNFT.architect.name).toString('hex');

            const mintTransaction = new Transaction({
                value: BigInt(0),
                data: new TextEncoder().encode(`mintNFT@${nameHex}@${Buffer.from('MEMEX').toString('hex')}`),
                receiver: new Address(address),
                gasLimit: BigInt(60000000),
                chainID: network.chainId,
                sender: new Address(address),
                nonce: account.nonce,
                version: 2
            });

            await signAndSendTransactions({
                transactions: [mintTransaction],
                transactionsDisplayInfo: {
                    processingMessage: 'Minting your masterpiece...',
                    errorMessage: 'Minting failed',
                    successMessage: 'NFT is MINTED! 🎨'
                }
            });

            // Permanent Storage for AI Art
            let finalImageUrl = activeNFT.branding?.logoUrl || '';

            if (finalImageUrl) {
                finalImageUrl = await uploadImageFromUrl(finalImageUrl, `${activeNFT.architect.name}_nft`);
            }

            // Save to Supabase
            await saveNFT({
                name: activeNFT.architect.name,
                description: activeNFT.architect.description,
                image_url: finalImageUrl,
                rarity_score: activeNFT.architect.rarityScore || 0,
                category: activeNFT.architect.category,
                attributes: activeNFT.architect.attributes,
                creator_address: address,
                is_listed: false
            });

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00ffff', '#ff00ff', '#ffffff']
            });

            setTimeout(() => {
                navigate(RouteNamesEnum.dashboardNFTs);
            }, 3000);

        } catch (e) {
            console.error("Minting failed:", e);
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
                                MINT AN <span className="text-neon-blue text-glow">NFT</span>
                            </h1>
                            <p className="text-slate-400 text-lg max-w-xl mx-auto">
                                Type a vision. Our AI will craft the story, traits, and high-fidelity artwork.
                            </p>
                        </div>

                        <div className="relative max-w-2xl mx-auto">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe your NFT idea (e.g. 'A legendary cyberpunk astronaut holding a glowing meme')"
                                className="w-full h-32 bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 text-white text-xl focus:border-neon-blue outline-none transition-all placeholder:text-slate-600 resize-none shadow-2xl"
                            />
                            <Button
                                onClick={() => handleStartLaunch()}
                                disabled={!prompt}
                                className="absolute bottom-4 right-4 bg-neon-blue hover:bg-cyan-600 text-slate-950 rounded-xl px-6 py-4 flex items-center gap-2 group transition-all transform active:scale-95"
                            >
                                <span className="font-bold">MINT AI ART</span>
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>

                        <div className="max-w-2xl mx-auto space-y-6 text-left bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                            <div className="flex flex-col md:flex-row gap-6 justify-between">
                                <div className="space-y-3">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Select Rarity Goal</span>
                                    <div className="flex gap-2">
                                        {['Rare', 'Epic', 'Legendary', 'Mythic'].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setSelectedCategory(r)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedCategory === r ? 'bg-neon-blue border-neon-blue text-slate-950 shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Fast Track</span>
                                    <div
                                        onClick={() => setIsAutoPilot(!isAutoPilot)}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${isAutoPilot ? 'bg-neon-blue' : 'bg-slate-800'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isAutoPilot ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Need inspiration?</span>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {nftTemplates.map(t => (
                                        <button
                                            key={t.name}
                                            onClick={() => {
                                                setPrompt(t.prompt);
                                                handleStartLaunch(t.prompt);
                                            }}
                                            className="p-3 bg-slate-950 border border-white/5 rounded-xl text-left hover:border-neon-blue/50 transition-all group group-hover:bg-slate-900/50"
                                        >
                                            <span className="text-xl mb-1 block">{t.icon}</span>
                                            <span className="text-[10px] text-white font-bold block truncate">{t.name}</span>
                                            <span className="text-[8px] text-slate-500 line-clamp-1 group-hover:text-slate-400">Mint now</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-6 text-slate-500 text-sm">
                            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Generated</div>
                            <div className="flex items-center gap-2"><Gem className="h-4 w-4" /> Unique Traits</div>
                            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Verifiable</div>
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
                            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">AI Artistic Engine...</h2>
                            <p className="text-slate-500">Creating metadata and rendering artwork</p>
                        </div>

                        <div className="space-y-4">
                            {agents.map((agent, index) => {
                                const Icon = agent.icon;
                                const isActive = currentAgent === index;
                                const isDone = currentAgent > index;

                                return (
                                    <div
                                        key={agent.id}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${isActive ? 'bg-slate-900/50 border-neon-blue/50 shadow-neon-blue/10 shadow-lg scale-105' :
                                            isDone ? 'bg-slate-900/20 border-green-500/20 opacity-100' : 'bg-transparent border-white/5 opacity-30'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-xl ${isActive ? 'bg-neon-blue/20' : 'bg-slate-800'}`}>
                                            <Icon className={`h-6 w-6 ${isActive ? agent.color : 'text-slate-400'}`} />
                                        </div>
                                        <div className="flex-grow">
                                            <span className={`font-bold block ${isActive ? 'text-white' : 'text-slate-500'}`}>{agent.name}</span>
                                            {isActive && <span className="text-xs text-neon-blue animate-pulse">Generating...</span>}
                                            {isDone && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Ready</span>}
                                        </div>
                                        {isActive && <Loader2 className="h-5 w-5 text-neon-blue animate-spin" />}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {step === 'review' && activeNFT?.architect && (
                    <motion.div
                        key="review-step"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-3xl bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-neon-blue/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative z-10">
                            <div className="w-full aspect-square bg-slate-800 rounded-3xl flex items-center justify-center border-2 border-neon-blue/20 relative group overflow-hidden shadow-2xl">
                                {activeNFT.branding?.logoUrl ? (
                                    <img
                                        src={activeNFT.branding.logoUrl}
                                        alt="AI Generated Art"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                    />
                                ) : (
                                    <Palette className="h-12 w-12 text-slate-600" />
                                )}
                                <div className="absolute top-4 right-4 bg-neon-blue/90 text-slate-950 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{activeNFT.architect.category}</div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-bangers text-white uppercase tracking-widest">{activeNFT.architect.name}</h2>
                                    <p className="text-slate-400 text-sm leading-relaxed">{activeNFT.architect.description}</p>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Attributes</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {activeNFT.architect.attributes.map((attr: any, i: number) => (
                                            <div key={i} className="bg-slate-950/50 p-2 rounded-lg border border-white/5 text-center">
                                                <span className="text-[9px] text-slate-500 block uppercase">{attr.trait_type}</span>
                                                <span className="text-xs text-neon-blue font-bold">{attr.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Rarity Score</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-neon-blue transition-all duration-1000"
                                                style={{ width: `${activeNFT.architect.rarityScore}%` }}
                                            />
                                        </div>
                                        <span className="text-white font-mono font-bold">{activeNFT.architect.rarityScore}/100</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep('input')}
                                        className="flex-1 bg-transparent border-slate-700 text-slate-400 hover:text-white"
                                    >
                                        RE-ROLL
                                    </Button>
                                    <Button
                                        id="autopilot-action-nft"
                                        onClick={handleSignAndMint}
                                        className="flex-[2] bg-neon-blue hover:bg-cyan-600 text-slate-950 font-bold h-12 flex items-center justify-center gap-2"
                                    >
                                        <Rocket className="h-5 w-5" />
                                        MINT NFT
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
