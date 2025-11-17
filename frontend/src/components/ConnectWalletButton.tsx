import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { toast } from 'sonner';

export const ConnectWalletButton = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={() => open()}
        className="bg-gradient-klash shadow-glow-intense font-bold hover:scale-105 transition-all animate-glow-pulse"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-gradient-klash shadow-glow font-bold hover:scale-105 transition-all">
          <Wallet className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{formatAddress(address!)}</span>
          <span className="sm:hidden">{address!.slice(0, 4)}...</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <div className="px-2 py-3">
          <p className="text-sm text-muted-foreground mb-1">Connected Wallet</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono font-bold">{formatAddress(address!)}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          <span>Copy Address</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => open({ view: 'Account' })} className="cursor-pointer">
          <Wallet className="mr-2 h-4 w-4" />
          <span>Wallet Details</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
