import { create } from 'zustand';

interface TokenState {
    name: string;
    symbol: string;
    description: string;
    logoUrl?: string;
    bannerUrl?: string;
    riskScore?: number;
}

interface AppState {
    tokens: TokenState[];
    isGenerating: boolean;
    activeGeneration?: {
        architect?: any;
        branding?: any;
        risk?: any;
        transaction?: any;
    };
    setGenerating: (generating: boolean) => void;
    setGenerationResult: (agent: string, result: any) => void;
    resetGeneration: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    tokens: [],
    isGenerating: false,
    activeGeneration: undefined,
    setGenerating: (generating) => set({ isGenerating: generating }),
    setGenerationResult: (agent, result) =>
        set((state) => ({
            activeGeneration: {
                ...state.activeGeneration,
                [agent]: result
            }
        })),
    resetGeneration: () => set({ activeGeneration: undefined, isGenerating: false })
}));
