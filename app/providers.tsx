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
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ApolloProvider } from '@apollo/client';
import { ultrasoundClient } from '@/src/lib/apollo/client';

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
  appName: 'ULTRASOUND',
  projectId: '4ce72830a3a245beb89f7b75fac12100',
  chains: [mainnet],
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
        <ApolloProvider client={ultrasoundClient}>
          <RainbowKitProvider
            theme={lightTheme({
              accentColor: '#D4AF37',
              accentColorForeground: 'white',
            })}
          >
            {children}
          </RainbowKitProvider>
        </ApolloProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
