import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RouteNamesEnum } from '@/localConstants';
import { TokenCard } from '@/components/launchpad/TokenCard';
import { NFTCard } from '@/components/launchpad/NFTCard';  // NEW
import { Rocket, TrendingUp, Flame, Loader2, Sparkles } from 'lucide-react'; // ADDED Sparkles
import { motion } from 'framer-motion';
import { getTokens, TokenDB, getNFTs, buyNFT } from '@/lib/services/supabase/supabase'; // ADDED getNFTs, buyNFT
import { useGetAccount } from '@/lib'; // NEW

export const Home = () => {
  const [tokens, setTokens] = useState<TokenDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nfts, setNfts] = useState<any[]>([]);
  const [isBuying, setIsBuying] = useState(false);
  const { address } = useGetAccount();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tokensData, nftsData] = await Promise.all([
          getTokens(undefined, 6),
          getTokens(undefined, 8) // Placeholder for getListedNFTs if it existed, we filter manually for now
        ]);

        // Fetch all NFTs and filter listed
        const allNFTs = await getNFTs();
        const listedNFTs = allNFTs.filter(n => n.is_listed).slice(0, 4);

        setTokens(tokensData);
        setNfts(listedNFTs);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBuyNFT = async (id: string, price: string) => {
    if (!address) {
      alert("Please connect wallet first!");
      return;
    }

    if (!confirm(`Buy NFT for ${price} EGLD?`)) return;

    setIsBuying(true);
    try {
      await buyNFT(id, address);
      setNfts(prev => prev.filter(n => n.id !== id));
      alert("NFT Purchased Successfully! 💎");
    } catch (error) {
      console.error("Purchase failed", error);
      alert("Purchase failed. See console.");
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center pt-12 pb-16 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4"
        >
          <h1 className="text-6xl md:text-9xl font-bangers text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue drop-shadow-[0_0_15px_rgba(255,0,255,0.5)]">
            memeX
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto">
            The fairest, pump-est, most meme-able launchpad on MultiversX.
            <span className="block text-neon-blue mt-2 font-semibold">No Presale. No Team Allocation. 100% Community.</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-6 pt-4"
        >
          <Link to={RouteNamesEnum.dashboardCreate}>
            <Button variant="neon" size="lg" className="text-xl px-12 py-8 rounded-full">
              <Rocket className="mr-3 h-6 w-6" />
              Launch Token
            </Button>
          </Link>

          <Link to={RouteNamesEnum.dashboardOverview}>
            <Button variant="outline" size="lg" className="text-xl px-12 py-8 rounded-full border-neon-blue text-neon-blue hover:bg-neon-blue/10">
              <TrendingUp className="mr-3 h-6 w-6" />
              Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto mt-16 px-4 pb-20 space-y-20">
        {/* TOKENS SECTION */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <Flame className="text-orange-500 fill-orange-500 animate-pulse" />
            <h2 className="text-3xl font-bangers text-white">Hottest Launches</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 text-neon-pink animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tokens.map((token, index) => (
                <TokenCard
                  key={token.id || index}
                  name={token.name}
                  ticker={token.symbol}
                  description={token.description}
                  imageUrl={token.logo_url}
                  marketCap={token.total_supply}
                  replies={Math.floor(Math.random() * 50)}
                />
              ))}
              {tokens.length === 0 && (
                <div className="col-span-full text-center text-slate-500 py-10">
                  No launches yet. Be the first!
                </div>
              )}
            </div>
          )}
        </div>

        {/* NFTS SECTION */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="text-neon-blue fill-neon-blue animate-pulse" />
            <h2 className="text-3xl font-bangers text-white">Trending NFTs</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 text-neon-blue animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <NFTCard
                  key={nft.id}
                  id={nft.id}
                  name={nft.name}
                  description={nft.description}
                  imageUrl={nft.image_url}
                  rarityScore={nft.rarity_score}
                  category={nft.category}
                  isListed={true}
                  price={nft.price}
                  onBuy={() => handleBuyNFT(nft.id, nft.price || '0')}
                  onList={() => { }} // Home page doesn't support listing, only buying
                />
              ))}
              {nfts.length === 0 && (
                <div className="col-span-full text-center text-slate-500 py-10 bg-slate-900/50 rounded-2xl border border-white/5">
                  <p>No NFTs listed for sale right now.</p>
                  <Link to={RouteNamesEnum.dashboardCreate} className="text-neon-blue hover:underline">Mint one here!</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
