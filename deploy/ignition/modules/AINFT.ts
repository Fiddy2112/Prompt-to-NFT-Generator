// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AINFTModule = buildModule("AINFTModule", (m) => {
  const createNFT = m.contract("AINFT");

  return { createNFT };
});

export default AINFTModule;
