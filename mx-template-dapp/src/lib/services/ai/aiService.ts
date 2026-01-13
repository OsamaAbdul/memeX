/**
 * AI Service Layer for memeX Launchpad
 * Implements the 4-agent system using Google Gemini 2.5 Flash.
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'; // Fallback to 1.5 if 2.5 is not yet available in all regions
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

export interface TokenArchitectResponse {
    name: string;
    symbol: string;
    description: string;
    category: string;
    tone: string;
    tokenomics: {
        totalSupply: string;
        initialLiquidityPercent: string;
        bondingCurve: string;
    };
}

export interface NFTArchitectResponse {
    name: string;
    description: string;
    category: string;
    attributes: Array<{
        trait_type: string;
        value: string;
    }>;
    rarityScore: number;
}

export interface BrandingResponse {
    logoCID: string;
    bannerCID: string;
    logoUrl: string;
    bannerUrl: string;
    tagline: string;
}

export interface RiskResponse {
    riskScore: number;
    warnings: string[];
    blocked: boolean;
    reason: string;
}

export interface TransactionResponse {
    transactions: any[];
    estimatedFee: string;
    requiredBalance: string;
}

/**
 * Helper to call Gemini REST API
 */
async function callGemini(systemPrompt: string, userPrompt: string) {
    if (!API_KEY) {
        throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `${systemPrompt}\n\nUser Input: ${userPrompt}\n\nResponse (JSON ONLY):`
                }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("Gemini returned an empty response.");
    }

    return JSON.parse(text);
}

export const TokenArchitectAgent = async (prompt: string): Promise<TokenArchitectResponse> => {
    const systemPrompt = `You are the Token Architect for memeX, a premium MultiversX memecoin launchpad. 
    Your goal is to transform a simple meme idea into a professional token configuration.
    Return a JSON object with: 
    - name: Catchy meme name (e.g. "PepeX")
    - symbol: 3-5 letter ticker (e.g. "PPX")
    - description: 2-sentence witty description.
    - category: One of [Meme, Utility, AI, Gaming]
    - tone: One of [Chaotic, Serious, Bullish, DeGen]
    - tokenomics: { totalSupply: "1,000,000,000", initialLiquidityPercent: "10%", bondingCurve: "Linear" }`;

    return await callGemini(systemPrompt, prompt);
};

export const NFTArchitectAgent = async (prompt: string): Promise<NFTArchitectResponse> => {
    const systemPrompt = `You are the NFT Architect for memeX. 
    Transform a meme idea into a unique NFT collectible.
    Return a JSON object with: 
    - name: Unique name for the NFT
    - description: A story or lore behind this NFT
    - category: One of [Rare, Epic, Legendary, Mythic]
    - attributes: Array of { trait_type, value } (at least 3 traits)
    - rarityScore: (0-100, where 100 is rarest)`;

    return await callGemini(systemPrompt, prompt);
};

export const BrandGeneratorAgent = async (architect: any): Promise<BrandingResponse> => {
    const symbol = 'symbol' in architect ? `(${architect.symbol})` : '';
    const systemPrompt = `You are a Brand Genius for memeX. 
    Given the identity: ${architect.name} ${symbol} - ${architect.description}.
    Generate:
    - tagline: A viral, pump-inducing tagline.
    - logoKeywords: comma-separated keywords for an image (e.g. "cute, cat, space, neon")
    - bannerKeywords: comma-separated keywords for a banner.
    Response must be JSON.`;

    const result = await callGemini(systemPrompt, "Generate branding assets.");

    // Use Pollinations.ai (Main Endpoint)
    // We use the /p/ format which is the robust permalink structure
    const randomSeed = Math.floor(Math.random() * 1000000);

    // Construct the prompts
    const logoPrompt = result.logoKeywords
        ? `${result.logoKeywords}, ${architect.name} logo, vector style, white background`
        : `${architect.name} mascot meme coin logo, high quality, vector style, white background`;

    const bannerPrompt = result.bannerKeywords
        ? `${result.bannerKeywords}, ${architect.name} banner, wide, neon, crypto, 4k`
        : `${architect.name} abstract cyber crypto banner, 4k, neon, wide`;

    // Append seed to prompt to force cache busting on their side if query params are ignored
    // Use proper image endpoint (not permalink page)
    const logoUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(logoPrompt)}?width=512&height=512&seed=${randomSeed}&model=flux&nologo=true`;
    const bannerUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(bannerPrompt)}?width=1200&height=400&seed=${randomSeed}&model=flux&nologo=true`;

    return {
        logoCID: "bafybeigdyrzt5sfp7udm7hu76uh7y26igwwjsrvatqjrfatx6ofv7zvyrm",
        bannerCID: "bafybeigdyrzt5sfp7udm7hu76uh7y26igwwjsrvatqjrfatx6ofv7zvyrm",
        logoUrl,
        bannerUrl,
        tagline: result.tagline || `To the moon with ${architect.name}! 🚀`
    };
};

export const RiskGuardAgent = async (architect: any): Promise<RiskResponse> => {
    const systemPrompt = `You are the Risk & Compliance Guard.
    Audit this concept: Name: ${architect.name}, Description: ${architect.description}.
    Analyze for: Scams, hate speech, or financial red flags.
    Return JSON:
    - riskScore: (0-100, 0 is safest)
    - warnings: Array of string warnings
    - blocked: boolean
    - reason: string if blocked`;

    return await callGemini(systemPrompt, "Audit this concept.");
};

export const TransactionComposerAgent = async (architect: any): Promise<TransactionResponse> => {
    // This agent is mostly logic-based but uses AI to explain fees/requirements
    const supplyInfo = architect.tokenomics?.totalSupply ? `${architect.tokenomics.totalSupply} supply` : "NFT unique issuance";
    const systemPrompt = `Analyze the launch requirements for an asset with ${supplyInfo}.
    Predict the network load and explain requirements.
    Return JSON:
    - estimatedFee: e.g. "0.005 EGLD"
    - requiredBalance: e.g. "0.1 EGLD"
    Keep transactions array empty for now.`;

    const result = await callGemini(systemPrompt, "Calculate fees.");

    return {
        transactions: [],
        estimatedFee: result.estimatedFee || "0.005 EGLD",
        requiredBalance: result.requiredBalance || "0.1 EGLD"
    };
};
