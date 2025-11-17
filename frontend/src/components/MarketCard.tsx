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

export const MarketCard = ({
  id,
  title,
  sideA,
  sideB,
  oddsA,
  oddsB,
  totalBets,
  endsIn,
  isLive = true,
  trending = false,
}: MarketCardProps) => {
  return (
    <Link to={`/market/${id}`} className="block animate-scale-in">
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
          <h3 className="text-xl font-bungee leading-tight group-hover:text-klash transition-all duration-300 group-hover:scale-105">
            {title}
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">YES</div>
              <div className="font-bold text-lg">{sideA}</div>
              <div className="text-klash font-bold text-xl mt-1">{oddsA}%</div>
            </div>
            
            <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">NO</div>
              <div className="font-bold text-lg">{sideB}</div>
              <div className="text-muted-foreground font-bold text-xl mt-1">{oddsB}%</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{totalBets}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{endsIn}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
