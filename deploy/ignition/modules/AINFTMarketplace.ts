// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AINFTMarketplaceModule = buildModule("AINFTMarketplaceModule", (m) => {
  const marketplace = m.contract("AINFTMarketplace");

  return { marketplace };
});

export default AINFTMarketplaceModule;
