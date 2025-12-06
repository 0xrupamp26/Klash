import { Button } from "@/components/ui/button";
import { walletService } from "@/services/wallet-service";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

export const ConnectWalletButton = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      // Simple check if already connected or just check local state/previous session
      // For now, let's just see if walletService has state
      if (walletService.isConnected()) {
        setAddress(await walletService.getWalletAddress());
      }
    };
    checkConnection();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const addr = await walletService.connectWallet();
      setAddress(addr);
      toast.success("Petra Wallet Connected!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to connect Petra Wallet");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    walletService.disconnect();
    setAddress(null);
    toast.info("Wallet Disconnected");
  };

  if (address) {
    return (
      <Button
        variant="outline"
        onClick={handleDisconnect}
        className="bg-purple-900/50 border-purple-500 text-purple-100 hover:bg-purple-900/80 transition-all font-mono"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          {address.slice(0, 4)}...{address.slice(-4)}
        </div>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={connecting}
      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(168,85,247,0.5)] font-bold"
    >
      <Wallet className="mr-2 h-4 w-4" />
      {connecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};
