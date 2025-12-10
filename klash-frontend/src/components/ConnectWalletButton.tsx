import { Button } from "@/components/ui/button";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
import { useEffect } from "react";

export const ConnectWalletButton = () => {
  const { connect, disconnect, connected, account, isLoading } = useWallet();

  const handleConnect = async () => {
    try {
      // Connect specifically to Petra
      connect("Petra" as any); 
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to connect wallet");
    }
  };

  const handleDisconnect = async () => {
    try {
        await disconnect();
        toast.info("Wallet Disconnected");
    } catch (e) {
        console.error(e);
    }
  };
  
  // React to connection status
  useEffect(() => {
    if (connected && account) {
        // Optional: Trigger any side effects like funding check here if needed
    }
  }, [connected, account]);

  if (connected && account) {
    return (
      <Button
        variant="outline"
        onClick={handleDisconnect}
        className="bg-purple-900/50 border-purple-500 text-purple-100 hover:bg-purple-900/80 transition-all font-mono"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          {account.address.slice(0, 4)}...{account.address.slice(-4)}
        </div>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(168,85,247,0.5)] font-bold"
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isLoading ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};
