import { useEffect, useState } from "react";
import { useWallet } from "../contexts/useWallet";
import { shortAddress, toastError, toastSuccess } from "../lib/utils";
import { AIMARKET_ABI, AIMARKET_ADDRESS } from "../contract/contractData";
import { readContract, writeContract } from "@wagmi/core";
import { config } from "../config";

type Listing = {
  listingId: number;
  seller: string;
  buyer: string;
  nftAddress: string;
  tokenId: number;
  price: bigint;
  isActive: boolean;
  isSold: boolean;
  expired: number;
};

const Marketplace = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const { wallet, connectWallet } = useWallet();

  const fetchListings = async () => {
    try {
      const active = (await readContract(config, {
        address: AIMARKET_ADDRESS as `0x${string}`,
        abi: AIMARKET_ABI,
        functionName: "getActiveListings",
      })) as Listing[];
      setListings(active);
    } catch (err) {
      console.error("Error fetching listings:", err);
      toastError("Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (listingId: number, price: bigint) => {
    if (!wallet) {
      await connectWallet();
      return toastError("Please connect wallet");
    }
    try {
      const tx = await writeContract(config, {
        address: AIMARKET_ADDRESS as `0x${string}`,
        abi: AIMARKET_ABI,
        functionName: "buyNFT",
        args: [listingId],
        account: wallet as `0x${string}`,
        value: price,
      });
      toastSuccess("🎉 Purchase successful!");
      console.log("Buy tx hash:", tx);
      fetchListings();
    } catch (err) {
      console.error("Buy error:", err);
      toastError("Failed to buy NFT");
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">🎨 Marketplace</h1>

      {loading && <p className="text-center">Loading NFTs...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {listings.map((item, index) => (
          <div key={index} className="border rounded-lg shadow-md p-4">
            <img
              src={`https://ipfs.io/ipfs/${item.tokenId}`}
              alt={`Token ${item.tokenId}`}
              className="w-full h-64 object-cover rounded"
            />
            <div className="mt-4 space-y-1 text-sm">
              <p>
                <strong>Token ID:</strong> {item.tokenId}
              </p>
              <p>
                <strong>Seller:</strong> {shortAddress(item.seller)}
              </p>
              <p>
                <strong>Price:</strong> {(Number(item.price) / 1e18).toFixed(4)}{" "}
                ETH
              </p>
            </div>

            <button
              onClick={() => handleBuy(item.listingId, item.price)}
              disabled={!item.isActive || item.isSold}
              className={`w-full mt-4 py-2 rounded text-white font-semibold ${
                !item.isActive || item.isSold
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {item.isSold ? "Sold" : "Buy"}
            </button>
          </div>
        ))}
      </div>

      {!loading && listings.length === 0 && (
        <p className="text-center mt-8 text-gray-500">No active listings.</p>
      )}
    </div>
  );
};

export default Marketplace;
