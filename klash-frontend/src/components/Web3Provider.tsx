import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, arbitrum, base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Query client for wagmi
const queryClient = new QueryClient();

// WalletConnect Project ID (you can get one at https://cloud.walletconnect.com)
const projectId = 'demo-project-id'; // Replace with your own project ID for production

// Metadata for your app
const metadata = {
  name: 'Klash',
  description: 'Real-time on-chain prediction markets for viral controversies',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: [typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : '']
};

// Wagmi config
const chains = [mainnet, polygon, arbitrum, base] as const;
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

// Create Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(0 72% 51%)',
    '--w3m-border-radius-master': '0.5rem',
  }
});

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
