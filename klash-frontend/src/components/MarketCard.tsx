import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Users } from "lucide-react";

interface MarketCardProps {
  id: string;
  title: string;
  sideA: string;
  sideB: string;
  oddsA: number;
  oddsB: number;
  totalBets: string;
  endsIn: string;
  isLive?: boolean;
  trending?: boolean;
}

export const MarketCard = (props: any) => {
  const {
    id,
    marketId,
    title,
    question,
    sideA,
    sideB,
    outcomes,
    oddsA,
    oddsB,
    pools,
    totalBets,
    endsIn,
    closingTime,
    isLive = true,
    trending = false,
  } = props;

  const displayId = marketId || id;
  const displayTitle = question || title || "Untitled Market";

  const optionA = outcomes?.[0] || sideA || "Yes";
  const optionB = outcomes?.[1] || sideB || "No";

  // Calculate odds and stats from pools if available
  let displayOddsA = oddsA || 50;
  let displayOddsB = oddsB || 50;
  let displayTotal = totalBets || "0";

  if (pools) {
    const total = pools.total || 0;
    if (total > 0) {
      displayOddsA = Math.round((pools.outcomeA / total) * 100) || 0;
      displayOddsB = Math.round((pools.outcomeB / total) * 100) || 0;
    }
    displayTotal = `${total} APT`;
  }

  // Calculate endsIn from closingTime if needed
  let displayEndsIn = endsIn || "24h";
  if (closingTime) {
    const diff = new Date(closingTime).getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 24) displayEndsIn = `${Math.floor(hours / 24)}d`;
    else if (hours > 0) displayEndsIn = `${hours}h`;
    else displayEndsIn = "< 1h";
  }

  if (!displayId) return null;

  return (
    <Link to={`/market/${displayId}`} className="block animate-scale-in">
      <Card className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border-border hover:border-primary/70 transition-all hover-lift hover:shadow-glow-intense">
        {isLive && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-klash-red text-white animate-pulse-slow">
              LIVE
            </Badge>
          </div>
        )}

        {trending && (
          <div className="absolute top-3 left-3">
            <TrendingUp className="h-5 w-5 text-klash animate-pulse-slow" />
          </div>
        )}

        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bungee leading-tight group-hover:text-klash transition-all duration-300 group-hover:scale-105 line-clamp-2">
            {displayTitle}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">
                {typeof optionA === 'string' ? optionA.toUpperCase() : 'YES'}
              </div>
              <div className="text-klash font-bold text-xl mt-1">{displayOddsA}%</div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">
                {typeof optionB === 'string' ? optionB.toUpperCase() : 'NO'}
              </div>
              <div className="text-muted-foreground font-bold text-xl mt-1">{displayOddsB}%</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{displayTotal} Pool</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{displayEndsIn}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
