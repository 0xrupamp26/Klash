import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, Users, TrendingUp, MessageSquare, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

const MarketDetail = () => {
  const { id } = useParams();
  const [betAmount, setBetAmount] = useState("");
  const [selectedSide, setSelectedSide] = useState<"yes" | "no">("yes");

  // Mock data
  const market = {
    title: "Will Elon Reply to Mark's Tweet?",
    description: "Mark Zuckerberg called out Elon Musk on Twitter about AI safety. Will Elon respond within 24 hours?",
    sideA: "YES",
    sideB: "NO",
    oddsA: 67,
    oddsB: 33,
    totalPool: "$42,500",
    totalBets: 1247,
    endsIn: "2h 15m 33s",
    category: "Tech Drama",
    isLive: true,
  };

  const recentActivity = [
    { user: "0x742d...89ab", side: "YES", amount: "$500", time: "2m ago", avatar: "🔥" },
    { user: "0x123f...45cd", side: "NO", amount: "$1,200", time: "5m ago", avatar: "💎" },
    { user: "0x456a...12ef", side: "YES", amount: "$750", time: "8m ago", avatar: "⚡" },
    { user: "0x789b...67gh", side: "YES", amount: "$300", time: "12m ago", avatar: "🚀" },
    { user: "0xabc1...23ij", side: "NO", amount: "$2,500", time: "15m ago", avatar: "🎯" },
  ];

  const socialFeed = [
    { platform: "Twitter", text: "@elonmusk needs to respond! The silence is deafening 🔥", time: "3m ago" },
    { platform: "Twitter", text: "No way he responds. Elon's moved on to bigger things", time: "7m ago" },
    { platform: "Reddit", text: "This is peak internet drama. All in on YES", time: "11m ago" },
  ];

  const potentialWin = betAmount ? (parseFloat(betAmount) * (selectedSide === "yes" ? 1.49 : 3.03)).toFixed(2) : "0.00";

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
                    {market.isLive ? "LIVE" : "CLOSED"}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    {market.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="font-bold text-klash">{market.endsIn}</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bungee mb-4 leading-tight">
                {market.title}
              </h1>
              
              <p className="text-muted-foreground text-lg mb-6">
                {market.description}
              </p>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold">{market.totalBets.toLocaleString()}</span>
                  <span className="text-muted-foreground">bets</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold">{market.totalPool}</span>
                  <span className="text-muted-foreground">total pool</span>
                </div>
              </div>
            </Card>

            {/* Odds Display */}
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`p-6 cursor-pointer transition-all border-2 ${
                  selectedSide === "yes" 
                    ? "border-primary bg-primary/5 shadow-glow" 
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedSide("yes")}
              >
                <div className="text-sm text-muted-foreground mb-1">YES</div>
                <div className="text-2xl font-bold mb-2">{market.sideA}</div>
                <div className="text-4xl font-bungee text-klash">{market.oddsA}%</div>
                <Progress value={market.oddsA} className="mt-4 h-2" />
              </Card>

              <Card 
                className={`p-6 cursor-pointer transition-all border-2 ${
                  selectedSide === "no" 
                    ? "border-primary bg-primary/5 shadow-glow" 
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedSide("no")}
              >
                <div className="text-sm text-muted-foreground mb-1">NO</div>
                <div className="text-2xl font-bold mb-2">{market.sideB}</div>
                <div className="text-4xl font-bungee text-muted-foreground">{market.oddsB}%</div>
                <Progress value={market.oddsB} className="mt-4 h-2" />
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
                  <span>{selectedSide === "yes" ? market.oddsA : market.oddsB}%</span>
                </div>
              </div>

              <Button className="w-full h-14 text-lg font-bold bg-gradient-klash shadow-glow animate-glow-pulse">
                Place Bet
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
