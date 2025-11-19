import { Link } from "react-router-dom";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import klashLogo from "@/assets/klash-logo.png.png";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={klashLogo} alt="Klash" className="h-8 w-auto" />
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="transition-colors hover:text-klash">
            Markets
          </Link>
          <Link to="/create-market" className="transition-colors hover:text-klash">
            Create Your Own
          </Link>
          <Link to="/portfolio" className="transition-colors hover:text-klash">
            Portfolio
          </Link>
        </nav>
        
        <ConnectWalletButton />
      </div>
    </header>
  );
};
