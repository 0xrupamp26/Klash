import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Clock, Flame } from "lucide-react";
import { useState, useEffect } from "react";

interface BettingOption {
  range: string;
  odds: number;
  pool: number;
}

interface FeaturedMarketCardProps {
  title: string;
  tweetEmbedCode: string;
  endsIn: string;
  totalPool: string;
  options: BettingOption[];
}

export const FeaturedMarketCard = ({ 
  title, 
  tweetEmbedCode, 
  endsIn, 
  totalPool,
  options 
}: FeaturedMarketCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState("10");

  useEffect(() => {
    // Load Twitter widgets script
    const script = document.createElement('script');
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePlaceBet = () => {
    if (selectedOption) {
      console.log(`Placing bet: ${betAmount} USDC on ${selectedOption}`);
      // TODO: Implement actual betting logic
    }
  };

  return (
    <Card className="relative overflow-hidden border-2 border-klash/50 bg-gradient-to-br from-card via-card to-card/80 shadow-glow-intense hover:shadow-[0_0_60px_rgba(220,38,38,0.4)] transition-all duration-500 animate-scale-in hover:scale-[1.02]">
      {/* Featured Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-2 bg-gradient-klash px-4 py-2 rounded-full shadow-glow animate-glow-pulse">
          <Flame className="h-4 w-4" />
          <span className="font-bungee text-xs">FEATURED</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-klash">
            <TrendingUp className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-bold">LIVE CONTROVERSY</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bungee text-foreground leading-tight">
            {title}
          </h2>
        </div>

        {/* Tweet Embed */}
        <div 
          className="bg-background/50 rounded-lg p-4 border border-border/30"
          dangerouslySetInnerHTML={{ __html: tweetEmbedCode }}
        />

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-klash" />
            <span className="text-muted-foreground">Total Pool:</span>
            <span className="font-bold text-foreground">{totalPool}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-klash" />
            <span className="text-muted-foreground">Ends:</span>
            <span className="font-bold text-foreground">{endsIn}</span>
          </div>
        </div>

        {/* Betting Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-bungee text-foreground">PREDICT THE COUNT:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {options.map((option) => (
              <button
                key={option.range}
                onClick={() => setSelectedOption(option.range)}
                className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                  selectedOption === option.range
                    ? "border-klash bg-klash/20 shadow-glow scale-105"
                    : "border-border/30 bg-card/50 hover:border-klash/50 hover:bg-card/80"
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="text-xl font-bungee text-foreground">{option.range}</div>
                  <div className="text-xs text-muted-foreground">comments</div>
                  <div className="text-sm font-bold text-klash">{option.odds}x</div>
                  <div className="text-xs text-muted-foreground">${(option.pool / 1000).toFixed(1)}K pool</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bet Input & Action */}
        {selectedOption && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex gap-3">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="flex-1 px-4 py-3 bg-background/50 border border-border/30 rounded-lg text-foreground font-bold focus:outline-none focus:border-klash transition-colors"
                placeholder="Amount (USDC)"
                min="1"
              />
              <Button 
                onClick={handlePlaceBet}
                className="bg-gradient-klash shadow-glow-intense font-bungee text-base px-8 hover:scale-105 transition-all"
              >
                PLACE BET
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Potential return: <span className="text-klash font-bold">
                ${(parseFloat(betAmount) * (options.find(o => o.range === selectedOption)?.odds || 1)).toFixed(2)} USDC
              </span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
