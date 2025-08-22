import React, { useState } from "react";
import { writeContract } from "@wagmi/core";
import { config } from "../config";
import createPrediction from "../lib/generate";
import { AINFT_ABI, AINFT_ADDRESS } from "../contract/contractData";
import { shortAddress, toastError, toastSuccess } from "../lib/utils";
import { useWallet } from "../contexts/useWallet";
import AutoResizeTextarea from "../components/AutoResizeTextarea";
import signWallet from "../contexts/signWallet";
import { Plus, Minus } from "lucide-react";
import { uploadToPinata } from "../lib/uploadToPinata";

const Mint = () => {
  const { wallet, connectWallet } = useWallet();

  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  const [prompt, setPrompt] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [minting, setMinting] = useState(false);
  const [signing, setSigning] = useState(false);
  const [style, setStyle] = useState("");
  const [txHash, setTxHash] = useState("");
  const [aspectRatio, setAspectRatio] = useState("");
  const [count, setCount] = useState(1);

  // Flow: Generate → Sign → Mint
  // const generateSignMint = async () => {
  //   if (loadingAI || minting || signing) return;

  //   if (!wallet) {
  //     toastError("Please connect your wallet first");
  //     await connectWallet();
  //     return;
  //   }

  //   if (!prompt.trim()) {
  //     toastError("Please enter the prompt");
  //     return;
  //   }

  //   setLoadingAI(true);
  //   setImageURL("");
  //   try {
  //     const image = await createPrediction(prompt, style, aspectRatio, count);
  //     if (!image) {
  //       toastError("Failed to generate image");
  //       return;
  //     }
  //     setImageURL(image);
  //     toastSuccess("Image generated! Please sign to confirm minting.");

  //     setSigning(true);
  //     const signature = await signWallet(wallet);
  //     setSigning(false);
  //     if (!signature) {
  //       toastError("Signature required to mint.");
  //       return;
  //     }

  //     // Mint
  //     setMinting(true);
  //     const hash = await writeContract(config, {
  //       address: AINFT_ADDRESS as `0x${string}`,
  //       abi: AINFT_ABI,
  //       functionName: "mintNFT",
  //       args: [image],
  //       account: wallet as `0x${string}`,
  //     });
  //     toastSuccess("NFT Minted!");
  //     setTxHash(hash);
  //   } catch (err) {
  //     console.error(err);
  //     toastError("An error occurred during the mint process.");
  //   } finally {
  //     setLoadingAI(false);
  //     setSigning(false);
  //     setMinting(false);
  //   }
  // };

  const generateImage = async () => {
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
    setImageBlob(null);
    try {
      const image = await createPrediction(prompt, style, aspectRatio, count);

      if (!image) {
        toastError("Image generation failed");
        return;
      }

      const res = await fetch(image);
      const blob = await res.blob();
      setImageBlob(blob);

      setImageURL(URL.createObjectURL(blob));
      toastSuccess("Image generated! Preview ready");
    } catch (err) {
      console.error(err);
      toastError("An error occurred during generation.");
    } finally {
      setLoadingAI(false);
    }
  };

  const mintNFT = async () => {
    if (!wallet || !imageBlob) {
      toastError("Please generate an image first");
      return;
    }

    setSigning(true);
    try {
      const signature = await signWallet(wallet);
      if (!signature) {
        toastError("Signature required.");
        return;
      }
      setSigning(false);
      setMinting(true);

      const ipfsURL = await uploadToPinata(imageBlob);
      if (!ipfsURL) {
        toastError("Failed to upload to IPFS.");
        return;
      }

      const hash = await writeContract(config, {
        address: AINFT_ADDRESS as `0x${string}`,
        abi: AINFT_ABI,
        functionName: "mintNFT",
        args: [ipfsURL],
        account: wallet as `0x${string}`,
      });

      toastSuccess("NFT Minted!");
      setTxHash(hash);
    } catch (err) {
      console.error(err);
      toastError("Minting failed");
    } finally {
      setSigning(false);
      setMinting(false);
    }
  };

  const styleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStyle = e.target.value;
    setStyle(selectedStyle);
  };

  const setAspectRatioOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setAspectRatio(selected);
  };

  const setIncrease = () => {
    if (count > 9) return;
    setCount((prev) => (prev < 9 ? prev + 1 : prev));
  };

  const setDecrease = () => {
    if (count < 1) return;
    setCount((prev) => (prev > 1 ? prev - 1 : prev));
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-black">
        AI NFT Generator
      </h1>

      {!wallet ? (
        <div className="flex flex-col items-center space-y-4 mt-8">
          <p className="text-center text-gray-600 font-medium">
            Please connect your wallet to start minting your AI NFT.
          </p>
          <button
            onClick={connectWallet}
            className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          {/* Prompt */}
          <div className="space-y-2">
            <label className="font-semibold block font-mono ">Prompt</label>
            <AutoResizeTextarea prompt={prompt} setPrompt={setPrompt} />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold block mb-1 font-mono text-center">
                Style
              </label>
              <select
                className="w-full border cursor-pointer rounded-md p-2 font-mono"
                value={style}
                onChange={styleOnChange}
              >
                <option value="">-Select Style-</option>
                <option value="anime">Anime</option>
                <option value="imagine-turbo">Fast</option>
                <option value="flux-dev">Futuristic</option>
                <option value="flux-schnell">Abstract</option>
                <option value="realistic">Realistic</option>
                <option value="sdxl-1.0">High Resolution</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1 font-mono text-center">
                Aspect Ratio
              </label>
              <select
                className=" cursor-pointer w-full border rounded-md p-2 font-mono"
                value={aspectRatio}
                onChange={setAspectRatioOnChange}
              >
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1 font-mono text-center">
                Seed
              </label>
              <div className="flex items-center gap-2">
                <button
                  disabled={count <= 1}
                  onClick={setDecrease}
                  className={`${
                    count <= 1 ? "cursor-not-allowed" : "cursor-pointer"
                  } p-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 `}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={count}
                  className="w-full text-center font-mono border rounded-md p-2"
                  readOnly
                />
                <button
                  disabled={count >= 9}
                  onClick={setIncrease}
                  className={`${
                    count >= 9 ? "cursor-not-allowed" : "cursor-pointer"
                  } p-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <button
              onClick={generateImage}
              disabled={loadingAI || !prompt.trim()}
              className={`w-full sm:w-1/2 py-2 rounded-md font-semibold text-white cursor-pointer ${
                loadingAI ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loadingAI ? "Generating..." : "Generate Image"}
            </button>

            <button
              onClick={mintNFT}
              disabled={!imageBlob || signing || minting}
              className={`w-full sm:w-1/2 py-2 rounded-md font-semibold text-white ${
                !imageBlob || signing || minting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
              }`}
            >
              {signing ? "Signing..." : minting ? "Minting..." : "Mint NFT"}
            </button>
          </div>

          {/* Image Preview */}
          {imageURL && (
            <div className="mt-6">
              <h3 className="font-semibold text-center mb-2">Preview</h3>
              <img
                src={imageURL}
                alt="Generated NFT"
                className="w-full rounded-md shadow object-contain max-h-[400px]"
              />
            </div>
          )}

          {/* Transaction Hash */}
          {txHash && (
            <p className="font-mono text-sm mt-4 break-all text-center">
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600"
              >
                {shortAddress(txHash)}
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Mint;
