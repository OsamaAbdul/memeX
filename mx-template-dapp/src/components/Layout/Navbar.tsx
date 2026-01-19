import { useState } from 'react'; // Added useState
import { Link, useNavigate } from 'react-router-dom';
import { useGetLoginInfo, useGetAccount, getAccountProvider } from '@/lib';
import { Button } from '@/components/ui/button';
import { RouteNamesEnum } from '@/localConstants';
import DefaultLogo from '@/assets/img/-llxs6r.jpg';
import { Menu, X } from 'lucide-react'; // Added Icons

export const Navbar = () => {
    const { isLoggedIn } = useGetLoginInfo();
    const { address } = useGetAccount();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        const provider = getAccountProvider();
        await provider.logout();
        navigate(RouteNamesEnum.home);
        setIsMobileMenuOpen(false);
    };

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <nav className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between px-4">
                <Link to={RouteNamesEnum.home} className="flex items-center gap-2" onClick={closeMenu}>
                    <img src={DefaultLogo} alt="MemeX" className="h-10 w-auto rounded-lg hover:scale-105 transition-transform" />
                </Link>

                {/* Desktop Menu */}
                <div className="max-md:hidden flex items-center gap-6">
                    <Link to={RouteNamesEnum.dashboardOverview} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
                        DASHBOARD
                    </Link>
                    <Link to={RouteNamesEnum.dashboardCreate} className="text-sm font-bold text-slate-400 hover:text-neon-pink transition-colors">
                        LAUNCH TOKEN
                    </Link>
                    <Link to={RouteNamesEnum.dashboardCreateNFT} className="text-sm font-bold text-slate-400 hover:text-neon-cyan transition-colors">
                        LAUNCH NFT
                    </Link>
                    <Link to={RouteNamesEnum.dashboardNFTs} className="text-sm font-bold text-slate-400 hover:text-purple-400 transition-colors">
                        NFT MARKET
                    </Link>
                    <Link to={RouteNamesEnum.roadmap} className="text-sm font-bold text-slate-400 hover:text-mvx-fuchsia-550 transition-colors">
                        ROADMAP
                    </Link>
                </div>

                {/* Right Side Auth & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    {/* Auth Buttons */}
                    <div className="max-md:hidden flex items-center gap-2">
                        {isLoggedIn ? (
                            <>
                                <Button variant="outline" className="border-neon-blue/50 text-neon-blue font-mono text-xs">
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </Button>
                                <Button variant="ghost" onClick={handleLogout} className="text-slate-400 hover:text-white">
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="neon"
                                size="sm"
                                onClick={() => navigate(RouteNamesEnum.unlock)}
                            >
                                Connect Wallet
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-white" onClick={toggleMenu}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-slate-950 border-b border-white/10 p-4 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-5">
                    <Link to={RouteNamesEnum.dashboardOverview} onClick={closeMenu} className="text-lg font-bold text-slate-300 hover:text-white py-2 border-b border-white/5">
                        DASHBOARD
                    </Link>
                    <Link to={RouteNamesEnum.dashboardCreate} onClick={closeMenu} className="text-lg font-bold text-neon-pink hover:text-pink-400 py-2 border-b border-white/5">
                        LAUNCH TOKEN
                    </Link>
                    <Link to={RouteNamesEnum.dashboardCreateNFT} onClick={closeMenu} className="text-lg font-bold text-neon-cyan hover:text-cyan-400 py-2 border-b border-white/5">
                        LAUNCH NFT
                    </Link>
                    <Link to={RouteNamesEnum.dashboardNFTs} onClick={closeMenu} className="text-lg font-bold text-purple-400 hover:text-purple-300 py-2 border-b border-white/5">
                        NFT MARKET
                    </Link>
                    <Link to={RouteNamesEnum.roadmap} onClick={closeMenu} className="text-lg font-bold text-mvx-fuchsia-550 hover:text-fuchsia-400 py-2 border-b border-white/5">
                        ROADMAP
                    </Link>

                    <div className="pt-2 flex flex-col gap-3">
                        {isLoggedIn ? (
                            <>
                                <div className="text-slate-500 text-xs font-mono">Connected as: {address.slice(0, 10)}...</div>
                                <Button variant="outline" onClick={handleLogout} className="w-full border-white/10 text-white">
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="neon"
                                className="w-full"
                                onClick={() => {
                                    closeMenu();
                                    navigate(RouteNamesEnum.unlock);
                                }}
                            >
                                Connect Wallet
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
