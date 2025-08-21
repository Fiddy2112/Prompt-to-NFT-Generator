import { signMessage } from "@wagmi/core";
import { config } from "../config";

const signWallet = async (wallet: string): Promise<string | null> => {
  const message = `I confirm that I want to use AI to create NFTs using my wallet ${wallet} at ${new Date().toLocaleString()}`;
  try {
    const signature = await signMessage(config, {
      message,
    });
    console.log("Signature:", signature);
    return signature;
  } catch (err) {
    console.error("Signing a failure:", err);
    return null;
  }
};

export default signWallet;
