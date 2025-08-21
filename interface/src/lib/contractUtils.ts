import { writeContract } from "@wagmi/core";
import { config } from "../config";
import {
  AINFT_ABI,
  AINFT_ADDRESS,
  OWNER_ADDRESS,
} from "../contract/contractData";

export const allowMintForUser = async (userAddress: string) => {
  try {
    const tx = await writeContract(config, {
      address: AINFT_ADDRESS as `0x${string}`,
      abi: AINFT_ABI,
      functionName: "setAllowedMinter",
      args: [userAddress, true],
      account: OWNER_ADDRESS as `0x${string}`,
    });
    console.log("Allowed minter tx hash:", tx);
    return tx;
  } catch (err) {
    console.error("Error allowing minter:", err);
  }
};

export const ownerMintForUser = async (
  userAddress: string,
  tokenURI: string
) => {
  try {
    const tx = await writeContract(config, {
      address: AINFT_ADDRESS as `0x${string}`,
      abi: AINFT_ABI,
      functionName: "adminMint",
      args: [userAddress, tokenURI],
      account: OWNER_ADDRESS as `0x${string}`,
    });
    console.log("Owner minted NFT for user. Tx hash:", tx);
    return tx;
  } catch (err) {
    console.error("Error minting for user:", err);
  }
};
