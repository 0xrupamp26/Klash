import { ReactNode } from 'react';

interface Web3ProviderProps {
  children: ReactNode;
}

// Simplified provider for Aptos Demo (Removing EVM/Wagmi)
export const Web3Provider = ({ children }: Web3ProviderProps) => {
  return (
    <>
      {children}
    </>
  );
};
