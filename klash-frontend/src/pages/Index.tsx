import { Header } from "@/components/Header";
import { MarketCard } from "@/components/MarketCard";
import { FeaturedMarketCard } from "@/components/FeaturedMarketCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Clock, TrendingUp, Sparkles } from "lucide-react";
import klashLogo from "@/assets/klash-logo.png.png";
import { mockMarkets } from "@/data/mockMarkets";
import { Link } from "react-router-dom";

const Index = () => {
  const handleBet = async (marketId: string, outcome: number, amount: number) => {
    // Mock bet handling for demo
    console.log('Bet placed:', { marketId, outcome, amount });
  };

  // Use mock data for demo
  const displayMarkets = mockMarkets;

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

      {/* Featured Controversies */}
      <section className="container py-12 space-y-8">
        <div className="animate-fade-in">
          <FeaturedMarketCard
            title="How Many Racist Comments Will This Tweet Get in 6 Hours?"
            tweetEmbedCode='<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Argentina I&#39;m in you <br><br>Frens let&#39;s connect before <a href="https://twitter.com/EFDevcon?ref_src=twsrc%5Etfw">@EFDevcon</a> <a href="https://t.co/FHxhVTPZbb">pic.twitter.com/FHxhVTPZbb</a></p>&mdash; Thiru.eth ✈️ Devconnect 🇦🇷 (@0xThiru) <a href="https://twitter.com/0xThiru/status/1989066151515865401?ref_src=twsrc%5Etfw">November 13, 2025</a></blockquote>'
            endsIn="5h 42m"
            totalPool="$89.5K"
            options={[
              { range: "0-10", odds: 1.2, pool: 45000 },
              { range: "11-50", odds: 2.5, pool: 28000 },
              { range: "51-100", odds: 4.8, pool: 12000 },
              { range: "100+", odds: 8.5, pool: 4500 },
            ]}
          />
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <FeaturedMarketCard
            title="How Many Days Will This Be Alive on the Algorithm?"
            tweetEmbedCode='<blockquote class="twitter-tweet" data-media-max-width="560"><p lang="en" dir="ltr">Makeup ate today <a href="https://t.co/NZ5UFAXxf8">pic.twitter.com/NZ5UFAXxf8</a></p>&mdash; bud wiser (@w0rdgenerator) <a href="https://twitter.com/w0rdgenerator/status/1984987985696408026?ref_src=twsrc%5Etfw">November 2, 2025</a></blockquote>'
            endsIn="48h"
            totalPool="$156.3K"
            options={[
              { range: "1-3 Days", odds: 2.1, pool: 62000 },
              { range: "4-7 Days", odds: 3.5, pool: 48000 },
              { range: "8-14 Days", odds: 5.2, pool: 32000 },
              { range: "15+ Days", odds: 9.8, pool: 14300 },
            ]}
          />
        </div>
      </section>

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
