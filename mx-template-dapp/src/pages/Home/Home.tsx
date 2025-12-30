import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RouteNamesEnum } from '@/localConstants';
import { TokenCard, TokenCardProps } from '@/components/launchpad/TokenCard';
import { Rocket, TrendingUp, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_TOKENS: TokenCardProps[] = [
  {
    name: "PepeX",
    ticker: "PEPEX",
    description: "The rarest Pepe on MultiversX. Sentient and ready to moon. Join the froggo army immediately.",
    imageUrl: "https://media.istockphoto.com/id/1963721343/vector/frog-meme-face-flat-vector-illustration.jpg?s=612x612&w=0&k=20&c=XKyC2F70W6z1M-mUxlqR0-i9-52zJO5qPPnOXFbUoj8=",
    marketCap: "$420k",
    replies: 69
  },
  {
    name: "DogeUniverse",
    ticker: "DOGEU",
    description: "Much wow. Very chain. Doge wants to go to Mars via MultiversX speed.",
    imageUrl: "https://img.freepik.com/free-vector/cute-cool-shiba-inu-dog-wearing-sunglasses-peace-hand-cartoon-vector-icon-illustration-animal_138676-4351.jpg",
    marketCap: "$125k",
    replies: 12
  },
  {
    name: "CatWifHat",
    ticker: "CWH",
    description: "It's literally a cat wif a hat on it. What more do you want? Fundamentals are irrelevant.",
    imageUrl: "https://i.pinimg.com/736x/2c/31/97/2c3197c9add06aa6d0eb27421376878b.jpg",
    marketCap: "$88k",
    replies: 34
  },
  {
    name: "SafeMoonX",
    ticker: "SMX",
    description: "Totally safe, surely moon. The deflationary token that burns your regrets away.",
    imageUrl: "https://t3.ftcdn.net/jpg/03/07/77/66/360_F_307776652_1X48a5eZ51H7Xp6yM4p3Z1pZ1l1X1X1X.jpg",
    marketCap: "$12k",
    replies: 5
  }
];

export const Home = () => {
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
              Start Launch
            </Button>
          </Link>

          <Link to={RouteNamesEnum.dashboardOverview}>
            <Button variant="outline" size="lg" className="text-xl px-12 py-8 rounded-full border-neon-blue text-neon-blue hover:bg-neon-blue/10">
              <TrendingUp className="mr-3 h-6 w-6" />
              View Charts
            </Button>
          </Link>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto mt-16 px-4">
        <div className="flex items-center gap-2 mb-8">
          <Flame className="text-orange-500 fill-orange-500 animate-pulse" />
          <h2 className="text-3xl font-bangers text-white">Hottest Launches</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_TOKENS.map((token, index) => (
            <TokenCard key={index} {...token} />
          ))}
        </div>
      </div>
    </>
  );
};
