import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Portfolio = () => {
  // Mock data
  const stats = {
    totalBets: 24,
    activeBets: 8,
    won: 12,
    lost: 4,
    totalWagered: "$5,240",
    totalWinnings: "$7,890",
    pnl: "+$2,650",
    pnlPercent: "+50.6%",
  };

  const activeBets = [
    {
      id: "1",
      title: "Will Elon Reply to Mark's Tweet?",
      side: "YES",
      amount: "$500",
      odds: "67%",
      potentialWin: "$745",
      endsIn: "2h 15m",
    },
    {
      id: "2",
      title: "Drake vs Kendrick: Who Drops First?",
      side: "Kendrick",
      amount: "$750",
      odds: "55%",
      potentialWin: "$1,364",
      endsIn: "1d 4h",
    },
  ];

  const resolvedBets = [
    {
      id: "3",
      title: "Will Bitcoin Hit $100K in Q1?",
      side: "YES",
      amount: "$1,000",
      result: "WON",
      payout: "$1,850",
      profit: "+$850",
      resolvedAt: "2 days ago",
    },
    {
      id: "4",
      title: "Apple Vision Pro Delay?",
      side: "NO",
      amount: "$300",
      result: "LOST",
      payout: "$0",
      profit: "-$300",
      resolvedAt: "5 days ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bungee mb-2">Portfolio</h1>
          <p className="text-muted-foreground text-lg">Track your bets and winnings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-card to-secondary/20">
            <div className="text-sm text-muted-foreground mb-1">Total Bets</div>
            <div className="text-3xl font-bungee">{stats.totalBets}</div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-card to-secondary/20">
            <div className="text-sm text-muted-foreground mb-1">Active</div>
            <div className="text-3xl font-bungee text-klash animate-pulse-slow">{stats.activeBets}</div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-card to-secondary/20">
            <div className="text-sm text-muted-foreground mb-1">Won/Lost</div>
            <div className="text-3xl font-bungee">
              <span className="text-green-500">{stats.won}</span>
              <span className="text-muted-foreground mx-1">/</span>
              <span className="text-red-500">{stats.lost}</span>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Total P&L</div>
            <div className="text-3xl font-bungee text-klash flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              {stats.pnlPercent}
            </div>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Wagered</div>
            <div className="text-2xl font-bold">{stats.totalWagered}</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Winnings</div>
            <div className="text-2xl font-bold text-klash">{stats.totalWinnings}</div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="text-sm text-muted-foreground mb-2">Net Profit</div>
            <div className="text-2xl font-bold text-klash flex items-center gap-2">
              {stats.pnl}
              <TrendingUp className="h-5 w-5" />
            </div>
          </Card>
        </div>

        {/* Bets Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="active" className="font-bold data-[state=active]:bg-gradient-klash">
              <Clock className="mr-2 h-4 w-4" />
              Active Bets ({activeBets.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="font-bold data-[state=active]:bg-gradient-klash">
              <CheckCircle className="mr-2 h-4 w-4" />
              Resolved ({resolvedBets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeBets.map((bet) => (
              <Link key={bet.id} to={`/market/${bet.id}`}>
                <Card className="p-6 hover:border-primary/50 transition-all hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bungee mb-2 hover:text-klash transition-colors">
                        {bet.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-klash-red text-white">{bet.side}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Ends in {bet.endsIn}
                        </span>
                      </div>
                    </div>
                    <Badge className="animate-pulse-slow">LIVE</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Amount</div>
                      <div className="font-bold">{bet.amount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Odds</div>
                      <div className="font-bold">{bet.odds}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-muted-foreground mb-1">Potential Win</div>
                      <div className="font-bold text-klash text-xl">{bet.potentialWin}</div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {resolvedBets.map((bet) => (
              <Card key={bet.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bungee mb-2">
                      {bet.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{bet.side}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Resolved {bet.resolvedAt}
                      </span>
                    </div>
                  </div>
                  <Badge 
                    className={bet.result === "WON" 
                      ? "bg-green-500 text-white" 
                      : "bg-red-500 text-white"
                    }
                  >
                    {bet.result === "WON" ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {bet.result}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Bet</div>
                    <div className="font-bold">{bet.amount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Payout</div>
                    <div className="font-bold">{bet.payout}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Profit/Loss</div>
                    <div className={`font-bold text-xl flex items-center gap-1 ${
                      bet.result === "WON" ? "text-green-500" : "text-red-500"
                    }`}>
                      {bet.result === "WON" ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                      {bet.profit}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Portfolio;
