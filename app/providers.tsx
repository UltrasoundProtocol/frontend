'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  getDefaultWallets,
  lightTheme
} from '@rainbow-me/rainbowkit';
import { rabbyWallet } from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const { wallets } = getDefaultWallets();

// Determine which network to use based on environment variable
const network = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';

const config = getDefaultConfig({
  appName: 'ULTRASOUND',
  projectId: '4ce72830a3a245beb89f7b75fac12100',
  chains: network === 'sepolia' ? [sepolia, mainnet] : [mainnet, sepolia],
  wallets: [
    ...wallets,
    {
      groupName: 'Other',
      wallets: [rabbyWallet],
    },
  ],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: '#D4AF37',
            accentColorForeground: 'white',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
