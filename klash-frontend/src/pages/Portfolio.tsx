import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { betApi } from "@/services/api-client";

const Portfolio = () => {
  const [activeBets, setActiveBets] = useState<any[]>([]);
  const [resolvedBets, setResolvedBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBets: 0,
    activeBets: 0,
    won: 0,
    lost: 0,
    totalWagered: "$0",
    totalWinnings: "$0",
    pnl: "$0",
    pnlPercent: "0%",
  });

  useEffect(() => {
    const fetchBets = async () => {
      try {
        // Mock wallet address for now
        const walletAddress = "0x123...mock";
        const response = await betApi.getUserBets(walletAddress);

        if (response.success && response.data) {
          const bets = response.data;
          const active = bets.filter((b: any) => b.status === 'ACTIVE' || b.status === 'PENDING');
          const resolved = bets.filter((b: any) => b.status !== 'ACTIVE' && b.status !== 'PENDING');

          setActiveBets(active);
          setResolvedBets(resolved);

          // Calculate stats
          const totalBets = bets.length;
          const won = resolved.filter((b: any) => b.status === 'WON').length;
          const lost = resolved.filter((b: any) => b.status === 'LOST').length;
          const totalWageredVal = bets.reduce((acc: number, b: any) => acc + b.amount, 0);
          const totalWinningsVal = resolved.reduce((acc: number, b: any) => acc + (b.payout || 0), 0);
          const pnlVal = totalWinningsVal - totalWageredVal;
          const pnlPercentVal = totalWageredVal > 0 ? (pnlVal / totalWageredVal) * 100 : 0;

          setStats({
            totalBets,
            activeBets: active.length,
            won,
            lost,
            totalWagered: `$${totalWageredVal.toFixed(2)}`,
            totalWinnings: `$${totalWinningsVal.toFixed(2)}`,
            pnl: `${pnlVal >= 0 ? '+' : ''}$${pnlVal.toFixed(2)}`,
            pnlPercent: `${pnlVal >= 0 ? '+' : ''}${pnlPercentVal.toFixed(1)}%`,
          });
        }
      } catch (error) {
        console.error('Error fetching bets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

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
              <Link key={bet.betId} to={`/market/${bet.marketId}`}>
                <Card className="p-6 hover:border-primary/50 transition-all hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bungee mb-2 hover:text-klash transition-colors">
                        Market #{bet.marketId.substring(0, 8)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-klash-red text-white">{bet.outcome === 0 ? "YES" : "NO"}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Placed at {new Date(bet.placedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge className="animate-pulse-slow">LIVE</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Amount</div>
                      <div className="font-bold">${bet.amount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Odds</div>
                      <div className="font-bold">{bet.odds?.atPlacement?.toFixed(2) || "-"}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-muted-foreground mb-1">Potential Win</div>
                      <div className="font-bold text-klash text-xl">
                        ${(bet.amount * (bet.odds?.atPlacement || 1)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
            {activeBets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No active bets found.
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {resolvedBets.map((bet) => (
              <Card key={bet.betId} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bungee mb-2">
                      Market #{bet.marketId.substring(0, 8)}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{bet.outcome === 0 ? "YES" : "NO"}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Resolved {bet.resolvedAt ? new Date(bet.resolvedAt).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={bet.status === "WON"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                    }
                  >
                    {bet.status === "WON" ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {bet.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Bet</div>
                    <div className="font-bold">${bet.amount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Payout</div>
                    <div className="font-bold">${bet.payout || 0}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Profit/Loss</div>
                    <div className={`font-bold text-xl flex items-center gap-1 ${bet.status === "WON" ? "text-green-500" : "text-red-500"
                      }`}>
                      {bet.status === "WON" ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                      {bet.profit || (bet.payout || 0) - bet.amount}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {resolvedBets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No resolved bets found.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Portfolio;
