//Here this file is to configure the connection to the local anvil blockchain for frontend (wagmi setup)
import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";

export const config = createConfig({
  // 1. Tell it we are using the Sepolia testnet
  chains: [sepolia],

  // 2. Tell it how to "talk" to Sepolia (using Infura RPC)
  transports: {
    [sepolia.id]: http(
      "https://sepolia.infura.io/v3/31a3c11aa7554ab592dfb8c62e4b11c5"
    ),
  },
});
