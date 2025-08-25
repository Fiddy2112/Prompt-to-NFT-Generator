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
    setLoading(true);
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
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-500">
        🎨 Marketplace
      </h1>

      {/* Show loading indicator */}
      {loading && <p className="text-center">Loading NFTs...</p>}

      {/* Display NFT listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {listings.length === 0 && !loading && (
          <p className="text-center text-gray-500">
            No active listings at the moment.
          </p>
        )}

        {listings.map((item) => (
          <div key={item.listingId} className="border rounded-lg shadow-md p-4">
            <img
              src={`https://ipfs.io/ipfs/${item.tokenId}`}
              alt={`NFT Token ${item.tokenId}`}
              className="w-full h-64 object-cover rounded"
            />
            <div className="mt-4 space-y-1 text-sm font-mono">
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
              <p>
                <strong>Expires in:</strong>{" "}
                {item.expired > Date.now() / 1000
                  ? Math.ceil(
                      (item.expired - Date.now() / 1000) / (60 * 60 * 24)
                    )
                  : "Expired"}{" "}
                days
              </p>
            </div>

            {/* Buy button */}
            <button
              onClick={() => handleBuy(item.listingId, item.price)}
              disabled={!item.isActive || item.isSold}
              className={`w-full mt-4 py-2 rounded text-white font-semibold ${
                !item.isActive || item.isSold
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {item.isSold ? "Sold" : item.isActive ? "Buy Now" : "Expired"}
            </button>
          </div>
        ))}
      </div>

      {/* Message if no listings are available */}
      {!loading && listings.length === 0 && (
        <p className="text-center mt-8 text-gray-500">
          No active listings at the moment.
        </p>
      )}

      {/* Connect Wallet Button */}
      {!wallet && !loading && (
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Please connect your wallet to view and purchase NFTs
          </p>
          <button
            onClick={connectWallet}
            className="mt-4 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded font-semibold"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
