import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Users, TrendingUp, MessageSquare } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { marketApi, betApi } from "@/services/api-client";

const MarketDetail = () => {
  const { id } = useParams();
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState("");
  const [selectedSide, setSelectedSide] = useState<"yes" | "no">("yes");
  const [placingBet, setPlacingBet] = useState(false);

  useEffect(() => {
    const fetchMarket = async () => {
      if (!id) return;
      try {
        const response = await marketApi.getMarket(id);
        if (response.success && response.data) {
          setMarket(response.data);
        }
      } catch (error) {
        console.error('Error fetching market:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, [id]);

  const handlePlaceBet = async () => {
    if (!market || !betAmount) return;

    setPlacingBet(true);
    try {
      // Mock wallet address for now - in real app, get from wallet connection
      const walletAddress = "0x123...mock";

      await betApi.placeBet({
        marketId: market.marketId,
        outcome: selectedSide === "yes" ? 0 : 1,
        amount: parseFloat(betAmount),
        walletAddress,
      });

      // Refresh market data
      const response = await marketApi.getMarket(market.marketId);
      if (response.success && response.data) {
        setMarket(response.data);
      }
      setBetAmount("");
      alert("Bet placed successfully!");
    } catch (error) {
      console.error('Error placing bet:', error);
      alert("Failed to place bet");
    } finally {
      setPlacingBet(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!market) return <div className="min-h-screen flex items-center justify-center">Market not found</div>;

  // Calculate odds (simplified)
  const totalPool = market.pools.total || 0;
  const poolA = market.pools.outcomeA || 0;
  const poolB = market.pools.outcomeB || 0;

  const oddsA = totalPool > 0 ? Math.round((poolA / totalPool) * 100) : 50;
  const oddsB = totalPool > 0 ? Math.round((poolB / totalPool) * 100) : 50;

  const potentialWin = betAmount ? (parseFloat(betAmount) * (selectedSide === "yes" ? (100 / oddsA) : (100 / oddsB))).toFixed(2) : "0.00";

  // Mock recent activity for now as backend doesn't support it yet
  const recentActivity = [
    { user: "0x742d...89ab", side: "YES", amount: "$500", time: "2m ago", avatar: "🔥" },
    { user: "0x123f...45cd", side: "NO", amount: "$1,200", time: "5m ago", avatar: "💎" },
  ];

  const socialFeed = [
    { platform: "Twitter", text: market.originalTweetText || "No tweet text", time: "Original Tweet" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Markets
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Header */}
            <Card className="p-6 bg-gradient-to-br from-card to-secondary/20 border-primary/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge className="bg-klash-red text-white mb-2 animate-pulse-slow">
                    {market.status}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    {market.metadata?.category || "General"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="font-bold text-klash">{new Date(market.closingTime).toLocaleDateString()}</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bungee mb-4 leading-tight">
                {market.question}
              </h1>

              <p className="text-muted-foreground text-lg mb-6">
                {market.originalTweetText}
              </p>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold">{market.totalBets?.toLocaleString() || 0}</span>
                  <span className="text-muted-foreground">bets</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold">${totalPool}</span>
                  <span className="text-muted-foreground">total pool</span>
                </div>
              </div>
            </Card>

            {/* Odds Display */}
            <div className="grid grid-cols-2 gap-4">
              <Card
                className={`p-6 cursor-pointer transition-all border-2 ${selectedSide === "yes"
                  ? "border-primary bg-primary/5 shadow-glow"
                  : "border-border hover:border-primary/50"
                  }`}
                onClick={() => setSelectedSide("yes")}
              >
                <div className="text-sm text-muted-foreground mb-1">{market.outcomes?.[0] || "YES"}</div>
                <div className="text-2xl font-bold mb-2">{market.outcomes?.[0] || "YES"}</div>
                <div className="text-4xl font-bungee text-klash">{oddsA}%</div>
                <Progress value={oddsA} className="mt-4 h-2" />
              </Card>

              <Card
                className={`p-6 cursor-pointer transition-all border-2 ${selectedSide === "no"
                  ? "border-primary bg-primary/5 shadow-glow"
                  : "border-border hover:border-primary/50"
                  }`}
                onClick={() => setSelectedSide("no")}
              >
                <div className="text-sm text-muted-foreground mb-1">{market.outcomes?.[1] || "NO"}</div>
                <div className="text-2xl font-bold mb-2">{market.outcomes?.[1] || "NO"}</div>
                <div className="text-4xl font-bungee text-muted-foreground">{oddsB}%</div>
                <Progress value={oddsB} className="mt-4 h-2" />
              </Card>
            </div>

            {/* Social Feed */}
            <Card className="p-6">
              <h3 className="text-xl font-bungee mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-klash" />
                Live Discussion
              </h3>
              <div className="space-y-4">
                {socialFeed.map((post, idx) => (
                  <div key={idx} className="bg-secondary/30 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{post.platform}</Badge>
                      <span className="text-xs text-muted-foreground">{post.time}</span>
                    </div>
                    <p className="text-sm">{post.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Betting Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-24 bg-gradient-to-b from-card to-secondary/20">
              <h3 className="text-xl font-bungee mb-6">Place Your Bet</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Betting on: <span className="font-bold text-klash">{selectedSide.toUpperCase()}</span>
                  </label>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Amount (USDC)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="text-2xl font-bold h-14 bg-background"
                  />
                </div>

                <div className="flex gap-2">
                  {["10", "50", "100", "500"].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAmount(amount)}
                      className="flex-1"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 mb-6 border border-border">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Potential Win</span>
                  <span className="font-bold text-lg text-klash">${potentialWin}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Current Odds</span>
                  <span>{selectedSide === "yes" ? oddsA : oddsB}%</span>
                </div>
              </div>

              <Button
                className="w-full h-14 text-lg font-bold bg-gradient-klash shadow-glow animate-glow-pulse"
                onClick={handlePlaceBet}
                disabled={placingBet || !betAmount}
              >
                {placingBet ? "Placing Bet..." : "Place Bet"}
              </Button>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-bungee mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{activity.avatar}</span>
                      <div>
                        <div className="font-mono text-xs text-muted-foreground">{activity.user}</div>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant={activity.side === "YES" ? "default" : "outline"}
                            className={activity.side === "YES" ? "bg-klash-red text-white" : ""}
                          >
                            {activity.side}
                          </Badge>
                          <span className="font-bold">{activity.amount}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;
