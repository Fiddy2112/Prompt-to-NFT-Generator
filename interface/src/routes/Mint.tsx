import { useState } from "react";
import { writeContract } from "@wagmi/core";
import { config } from "../config";
import createPrediction from "../lib/generate";
import { AINFT_ABI, AINFT_ADDRESS } from "../contract/contractData";
import { toastError, toastSuccess } from "../lib/utils";
import { useWallet } from "../contexts/useWallet";
import AutoResizeTextarea from "../components/AutoResizeTextarea";
import signWallet from "../contexts/signWallet";

const Mint = () => {
  const { wallet, connectWallet } = useWallet();

  const [prompt, setPrompt] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [minting, setMinting] = useState(false);
  const [signing, setSigning] = useState(false);

  // Flow: Generate → Sign → Mint
  const generateSignMint = async () => {
    if (loadingAI || minting || signing) return;

    if (!wallet) {
      toastError("Please connect your wallet first");
      await connectWallet();
      return;
    }

    if (!prompt.trim()) {
      toastError("Please enter the prompt");
      return;
    }

    setLoadingAI(true);
    setImageURL("");
    try {
      const image = await createPrediction(prompt);
      if (!image) {
        toastError("Failed to generate image");
        return;
      }
      setImageURL(image);
      toastSuccess("Image generated! Please sign to confirm minting.");

      setSigning(true);
      const signature = await signWallet(wallet);
      setSigning(false);
      if (!signature) {
        toastError("Signature required to mint.");
        return;
      }

      // Mint
      setMinting(true);
      const hash = await writeContract(config, {
        address: AINFT_ADDRESS as `0x${string}`,
        abi: AINFT_ABI,
        functionName: "mintNFT",
        args: [image],
        account: wallet as `0x${string}`,
      });
      toastSuccess("✅ NFT Minted!");
      console.log("Tx Hash:", hash);
    } catch (err) {
      console.error(err);
      toastError("An error occurred during the mint process.");
    } finally {
      setLoadingAI(false);
      setSigning(false);
      setMinting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">AI NFT Mint</h1>
      <AutoResizeTextarea prompt={prompt} setPrompt={setPrompt} />
      {!wallet && (
        <button
          onClick={connectWallet}
          className="w-full bg-[#ff5f0d] cursor-pointer text-white py-2 rounded font-semibold"
        >
          Connect Wallet
        </button>
      )}

      <button
        onClick={generateSignMint}
        disabled={loadingAI || minting || signing || !wallet || !prompt.trim()}
        className={`w-full ${
          !wallet ? "hidden" : "block"
        } py-2 rounded text-white font-semibold
          ${
            loadingAI || minting || signing || !wallet || !prompt.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
          }
        `}
      >
        {loadingAI
          ? "Generating..."
          : signing
          ? "Waiting for signature..."
          : minting
          ? "Minting..."
          : "Generate & Mint NFT"}
      </button>

      {imageURL && (
        <img
          src={imageURL}
          alt="Generated NFT"
          className="w-full rounded shadow-md mt-4 object-contain max-h-80"
        />
      )}
    </div>
  );
};

export default Mint;
