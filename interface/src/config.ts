import { createConfig, http } from "@wagmi/core";
import { mainnet, sepolia } from "@wagmi/core/chains";

export const config = createConfig({
  ssr: false,
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http("https://ethereum-rpc.publicnode.com"),
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
  },
});
