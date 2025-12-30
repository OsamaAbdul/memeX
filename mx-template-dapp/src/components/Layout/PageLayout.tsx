import { ReactNode } from 'react';
import { AuthRedirectWrapper } from 'wrappers';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';

export const PageLayout = ({ children, className }: { children: ReactNode; className?: string }) => {
    return (
        <div className="min-h-screen bg-slate-950 font-inter text-slate-100 selection:bg-neon-pink selection:text-white relative">
            {/* Animated Background Mesh */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-neon-pink/5 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-neon-blue/5 blur-[120px] animate-pulse delay-75" />
            </div>

            <Navbar />

            <main className={cn("flex-grow pt-16 relative z-10 w-full", className)}>
                <AuthRedirectWrapper>{children}</AuthRedirectWrapper>
            </main>

            <footer className="mt-auto border-t border-white/5 bg-slate-950/50 backdrop-blur-sm py-12 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="font-bangers text-xl text-white tracking-wider">
                                meme<span className="text-neon-pink text-2xl">X</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">The pump-est launchpad on MultiversX.</p>
                        </div>
                        <p className="text-sm text-slate-500">© 2025 memeX. To the Moon! 🚀</p>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            <span className="text-slate-400 hover:text-neon-blue cursor-pointer transition-colors">Twitter</span>
                            <span className="text-slate-400 hover:text-neon-pink cursor-pointer transition-colors">Discord</span>
                            <span className="text-slate-400 hover:text-neon-green cursor-pointer transition-colors">Telegram</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
