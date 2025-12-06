import { Header } from "@/components/Header";
import { MarketCard } from "@/components/MarketCard";
import { FeaturedMarketCard } from "@/components/FeaturedMarketCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Clock, TrendingUp, Sparkles } from "lucide-react";
import klashLogo from "@/assets/klash-logo.png.png";
import { marketApi } from "@/services/api-client";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Index = () => {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        console.log("Fetching markets...");
        const response = await marketApi.getMarkets();
        console.log("Markets API Response:", response);
        if (response.success && response.data) {
          console.log("Setting markets state with:", response.data);
          setMarkets(response.data);
        } else {
          console.error("Market response unsuccessful or no data:", response);
        }
      } catch (error) {
        console.error('Error fetching markets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const handleBet = async (marketId: string, outcome: number, amount: number) => {
    console.log('Bet placed:', { marketId, outcome, amount });
  };

  const displayMarkets = markets;

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
              <Link to="/create-market">
                <Button size="lg" variant="outline" className="border-2 border-klash font-bold text-lg px-10 h-16 hover:scale-110 hover:bg-klash/10 transition-all">
                  <Sparkles className="mr-2 h-6 w-6" />
                  Create Your Own Markets
                </Button>
              </Link>
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

      {/* Featured Controversies Section Removed to show dynamic content better */}

      {/* Other Markets Section */}
      <section className="container py-12">
        <div className="mb-8 text-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bungee mb-3 text-klash">More Live Markets</h2>
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
              {displayMarkets.map((market) => (
                <MarketCard key={market.id || market.marketId} {...market} />
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
