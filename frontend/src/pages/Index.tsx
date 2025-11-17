import { Header } from "@/components/Header";
import { MarketCard } from "@/components/MarketCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Clock, TrendingUp } from "lucide-react";
import klashLogo from "@/assets/klash-logo.png.png";
import { useMarkets, useApiMutation } from "@/hooks/use-api";
import { Market, apiClient } from "@/services/api-client";
import { toast } from "sonner";

const Index = () => {
  const { data: markets, loading, error, refetch } = useMarkets();
  
  const { mutate: placeBet } = useApiMutation(
    (data: { marketId: string; outcome: number; amount: number; walletAddress: string }) =>
      apiClient.post('bets', data)
  );

  // Transform market data for MarketCard component
  const transformMarket = (market: Market) => {
    const oddsA = market.pools.total > 0 ? (market.pools.outcomeB / market.pools.total) * 100 : 50;
    const oddsB = market.pools.total > 0 ? (market.pools.outcomeA / market.pools.total) * 100 : 50;
    
    return {
      id: market.marketId,
      title: market.question,
      sideA: market.outcomes[0],
      sideB: market.outcomes[1],
      oddsA: Math.round(oddsA),
      oddsB: Math.round(oddsB),
      totalBets: `$${(market.pools.total / 1000).toFixed(1)}K`,
      endsIn: getTimeRemaining(market.closingTime),
      trending: market.metadata.controversyScore > 0.7,
      isLive: market.status === 'OPEN',
    };
  };

  const getTimeRemaining = (closingTime: string) => {
    const now = new Date();
    const close = new Date(closingTime);
    const diff = close.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0) return `${days}d ${remainingHours}h`;
    if (hours > 0) return `${hours}h`;
    return `${Math.floor(diff / (1000 * 60))}m`;
  };

  const handleBet = async (marketId: string, outcome: number, amount: number) => {
    // This would get the user's wallet address from Web3 context
    const walletAddress = localStorage.getItem('wallet_address') || '0x...';
    
    const result = await placeBet({ marketId, outcome, amount, walletAddress });
    if (result) {
      toast.success('Bet placed successfully!');
      refetch(); // Refresh markets data
    } else {
      toast.error('Failed to place bet');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-klash mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading markets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12">
          <div className="text-center">
            <p className="text-red-500">Error loading markets: {error}</p>
            <Button onClick={refetch} className="mt-4">Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback mock data for development
  const mockMarkets = [
    {
      id: "1",
      title: "Will Elon Reply to Mark's Tweet?",
      sideA: "YES",
      sideB: "NO",
      oddsA: 67,
      oddsB: 33,
      totalBets: "$42.5K",
      endsIn: "2h 15m",
      trending: true,
      isLive: true,
    },
    {
      id: "2",
      title: "Drake vs Kendrick: Who Drops First?",
      sideA: "Drake",
      sideB: "Kendrick",
      oddsA: 45,
      oddsB: 55,
      totalBets: "$128K",
      endsIn: "1d 4h",
      trending: true,
      isLive: true,
    },
    {
      id: "3",
      title: "Will Twitter Rebrand Again This Year?",
      sideA: "YES",
      sideB: "NO",
      oddsA: 23,
      oddsB: 77,
      totalBets: "$89K",
      endsIn: "5d 12h",
      isLive: true,
    },
    {
      id: "4",
      title: "UFC 300: Jon Jones Knockout?",
      sideA: "KO/TKO",
      sideB: "Decision",
      oddsA: 58,
      oddsB: 42,
      totalBets: "$256K",
      endsIn: "3h 45m",
      trending: true,
      isLive: true,
    },
    {
      id: "5",
      title: "Apple Vision Pro: More Than 1M Sold?",
      sideA: "YES",
      sideB: "NO",
      oddsA: 34,
      oddsB: 66,
      totalBets: "$67K",
      endsIn: "2d 8h",
      isLive: true,
    },
    {
      id: "6",
      title: "Will AI Beat Humans at Coding by EOY?",
      sideA: "YES",
      sideB: "NO",
      oddsA: 78,
      oddsB: 22,
      totalBets: "$145K",
      endsIn: "6d 2h",
      isLive: true,
    },
  ];

  const transformedMarkets = (markets as Market[])?.map(transformMarket) || [];
  const displayMarkets = transformedMarkets.length > 0 ? transformedMarkets : mockMarkets;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-border/20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent animate-pulse-slow" />
        <div className="container relative py-16 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Centered Logo as Tagline */}
            <div className="flex justify-center items-center mb-8 animate-bounce-in">
              <img
                src={klashLogo}
                alt="Klash - Put Your Money Where The Mouth Is"
                className="w-full max-w-2xl mx-auto drop-shadow-2xl"
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Put Your Money Where The Mouth Is
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/90 mb-4 animate-fade-in font-bold" style={{ animationDelay: "0.3s" }}>
              The most electrifying prediction market for viral moments
            </p>
            <p className="text-base md:text-lg text-muted-foreground mb-10 animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: "0.4s" }}>
              Real-time on-chain betting on the controversies everyone's talking about.
              <br />
              <span className="text-klash font-bold">AI-curated markets.</span> Lightning-fast resolution. <span className="text-klash font-bold">Transparent payouts.</span>
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-scale-in" style={{ animationDelay: "0.4s" }}>
              <Button size="lg" className="bg-gradient-klash shadow-glow-intense font-bold text-lg px-10 h-16 hover:scale-110 transition-all animate-glow-pulse">
                <Flame className="mr-2 h-6 w-6" />
                Start Trading
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="text-center">
                <div className="text-3xl font-bungee text-klash mb-1">$2.4M+</div>
                <div className="text-muted-foreground">Total Volume</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bungee text-klash mb-1">50K+</div>
                <div className="text-muted-foreground">Active Traders</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bungee text-klash mb-1">98%</div>
                <div className="text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section className="container py-12">
        <div className="mb-8 text-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bungee mb-3 text-klash">Live Markets</h2>
          <p className="text-muted-foreground">AI-curated controversies updating in real-time</p>
        </div>
        <Tabs defaultValue="trending" className="space-y-8">
          <TabsList className="bg-secondary/50 p-1 backdrop-blur-sm border border-border/30">
            <TabsTrigger value="trending" className="font-bold data-[state=active]:bg-gradient-klash data-[state=active]:shadow-glow transition-all">
              <TrendingUp className="mr-2 h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="live" className="font-bold data-[state=active]:bg-gradient-klash data-[state=active]:shadow-glow transition-all">
              <Flame className="mr-2 h-4 w-4" />
              Live Now
            </TabsTrigger>
            <TabsTrigger value="ending" className="font-bold data-[state=active]:bg-gradient-klash data-[state=active]:shadow-glow transition-all">
              <Clock className="mr-2 h-4 w-4" />
              Ending Soon
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayMarkets.filter(m => m.trending).map((market) => (
                <MarketCard key={market.id} {...market} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="live" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayMarkets.filter(m => m.isLive).map((market) => (
                <MarketCard key={market.id} {...market} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayMarkets.slice(0, 3).map((market) => (
                <MarketCard key={market.id} {...market} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Index;
