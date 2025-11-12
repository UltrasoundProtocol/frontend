'use client';

import * as React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  getDefaultWallets,
  lightTheme,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { rabbyWallet } from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { useTheme } from 'next-themes';

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

function RainbowKitThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const rainbowTheme = mounted && resolvedTheme === 'dark'
    ? darkTheme({
        accentColor: '#D4AF37',
        accentColorForeground: 'white',
      })
    : lightTheme({
        accentColor: '#D4AF37',
        accentColorForeground: 'white',
      });

  return (
    <RainbowKitProvider theme={rainbowTheme}>
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitThemeWrapper>
            {children}
          </RainbowKitThemeWrapper>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
