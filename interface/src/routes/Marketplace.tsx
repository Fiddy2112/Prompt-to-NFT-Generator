import { useState } from "react";
import { useWallet } from "../contexts/useWallet";
import { toastError, toastSuccess } from "../lib/utils";
import { AIMARKET_ABI, AIMARKET_ADDRESS } from "../contract/contractData";
import { writeContract } from "@wagmi/core";
import { config } from "../config";

const ListNFT = () => {
  const [tokenId, setTokenId] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [nftAddress, setNftAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { wallet, connectWallet } = useWallet();

  const handleListNFT = async () => {
    if (!wallet) {
      await connectWallet();
      return toastError("Please connect wallet");
    }

    if (!tokenId || !price || !nftAddress) {
      return toastError("Please fill all the fields");
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return toastError("Please enter a valid price");
    }

    setLoading(true);

    try {
      const tx = await writeContract(config, {
        address: AIMARKET_ADDRESS as `0x${string}`,
        abi: AIMARKET_ABI,
        functionName: "listNFT",
        args: [nftAddress, parseInt(tokenId), parsedPrice * 1e18],
        account: wallet as `0x${string}`,
      });

      toastSuccess("🎉 NFT listed successfully!");
      console.log("List NFT tx hash:", tx);
      setTokenId("");
      setPrice("");
      setNftAddress("");
    } catch (err) {
      console.error("List NFT error:", err);
      toastError("Failed to list NFT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-500">
        🖼 List Your NFT
      </h1>

      {loading && <p className="text-center">Listing NFT...</p>}

      <div className="space-y-4">
        {/* Input for NFT Address */}
        <div>
          <label className="block text-sm font-semibold">NFT Address</label>
          <input
            type="text"
            value={nftAddress}
            onChange={(e) => setNftAddress(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Enter the NFT contract address"
          />
        </div>

        {/* Input for Token ID */}
        <div>
          <label className="block text-sm font-semibold">Token ID</label>
          <input
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Enter the Token ID"
          />
        </div>

        {/* Input for Price */}
        <div>
          <label className="block text-sm font-semibold">Price (ETH)</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Enter price in ETH"
          />
        </div>

        {/* List NFT button */}
        <div className="mt-4">
          <button
            onClick={handleListNFT}
            disabled={loading}
            className={`w-full py-3 rounded text-white font-semibold ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {loading ? "Listing..." : "List NFT"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListNFT;
