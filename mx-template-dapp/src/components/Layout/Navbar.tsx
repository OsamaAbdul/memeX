import { Link, useNavigate } from 'react-router-dom';
import { useGetLoginInfo, useGetAccount, getAccountProvider } from '@/lib';
import { Button } from '@/components/ui/button';
import { RouteNamesEnum } from '@/localConstants';
import DefaultLogo from '@/assets/img/-llxs6r.jpg';

export const Navbar = () => {
    const { isLoggedIn } = useGetLoginInfo();
    const { address } = useGetAccount();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const provider = getAccountProvider();
        await provider.logout();
        navigate(RouteNamesEnum.home);
    };

    return (
        <nav className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between px-4">
                <Link to={RouteNamesEnum.home} className="flex items-center gap-2">
                    <img src={DefaultLogo} alt="MemeX" className="h-10 w-auto rounded-lg hover:scale-105 transition-transform" />
                </Link>

                <div className="flex items-center gap-4">
                    <Link to={RouteNamesEnum.dashboardCreate}>
                        <Button variant="ghost" className="text-white hover:text-neon-pink font-inter">
                            Start Launch
                        </Button>
                    </Link>

                    {isLoggedIn ? (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="border-neon-blue/50 text-neon-blue font-mono text-xs">
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </Button>
                            <Button variant="ghost" onClick={handleLogout} className="text-slate-400 hover:text-white">
                                Log Out
                            </Button>
                        </div>
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
            </div>
        </nav>
    );
};
