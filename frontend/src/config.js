//Here this file is to configure the connection to the local anvil blockchain for frontend (wagmi setup)
import { http, createConfig } from 'wagmi'
import { anvil } from 'wagmi/chains'

export const config = createConfig({
  // 1. Tell it we are using the Anvil blockchain
  chains: [anvil], 
  
  // 2. Tell it how to "talk" to Anvil (using the URL from your terminal)
  transports: {
    [anvil.id]: http('http://127.0.0.1:8545'),
  },
})