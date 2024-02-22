import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {ThemeProvider} from '@0xsequence/design-system'
import '@0xsequence/design-system/styles.css'
import { KitProvider } from '@0xsequence/kit'
import { getDefaultConnectors } from '@0xsequence/kit-connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { mainnet, polygon, Chain } from 'wagmi/chains'
import { Transport } from 'viem'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const queryClient = new QueryClient() 

function Dapp() {
  const chains = [mainnet, polygon] as [Chain, ...Chain[]]
  
  const projectAccessKey = '<access-key>'

  const connectors = getDefaultConnectors({
    walletConnectProjectId: 'wallet-connect-id',
    defaultChainId: 137,
    appName: 'demo app',
    projectAccessKey
  })

  const transports: Record<number, Transport> = {}

  chains.forEach(chain => {
    transports[chain.id] = http()
  })
  
  const config = createConfig({
    transports,
    chains,
    connectors
  })

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        <KitProvider config={{}}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
        </KitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

root.render(
  <React.StrictMode>
    <ThemeProvider>
    <Dapp />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
