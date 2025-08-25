import { useEffect, useState } from "react";
import { readContract, writeContract } from "@wagmi/core";
import { config } from "../config";

import { useWallet } from "../contexts/useWallet";
import { toastError, toastSuccess } from "../lib/utils";
import { AINFT_ABI, AINFT_ADDRESS } from "../contract/contractData";

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
  tokenURI: string;
};

const MyListings = () => {
  const { wallet, connectWallet } = useWallet();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchMyListings = async () => {
    if (!wallet) return;
    setLoading(true);

    try {
      const allIds = (await readContract(config, {
        address: AINFT_ADDRESS as `0x${string}`,
        abi: AINFT_ABI,
        functionName: "getListingsByUser",
        args: [wallet],
      })) as number[];

      if (allIds.length === 0) {
        setListings([]);
        toastError("You don't have any active listings.");
        return;
      }

      const data: Listing[] = [];
      for (const id of allIds) {
        const listing = (await readContract(config, {
          address: AINFT_ADDRESS as `0x${string}`,
          abi: AINFT_ABI,
          functionName: "listings",
          args: [id],
        })) as Listing;
        data.push({ ...listing, listingId: id });
      }

      setListings(data);
    } catch (err) {
      console.error("Fetch my listings error:", err);
      toastError("Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (listingId: number) => {
    if (!wallet) {
      await connectWallet();
      return toastError("Please connect wallet");
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this listing?"
    );
    if (!confirmed) return;

    setCancellingId(listingId);
    try {
      await writeContract(config, {
        address: AINFT_ADDRESS as `0x${string}`,
        abi: AINFT_ABI,
        functionName: "cancelListing",
        args: [listingId],
        account: wallet as `0x${string}`,
      });
      toastSuccess("Listing cancelled!");
      fetchMyListings();
    } catch (err) {
      console.error("Cancel listing error:", err);
      toastError("Failed to cancel listing.");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    fetchMyListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  if (!wallet) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4 font-mono text-base">
          Connect wallet to view your listings.
        </p>
        <button
          onClick={connectWallet}
          className="px-4 py-2 font-mono text-base cursor-pointer bg-[#ff5f0d] hover:bg-[#ff5f0d]/90 text-white rounded"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 font-mono">
        My Listings
      </h1>

      {loading && <p className="text-center animate-pulse">Loading...</p>}

      {/* Kiểm tra nếu không có listing */}
      {listings.length === 0 && !loading ? (
        <p className="text-center text-gray-500 font-mono">
          You have no active listings. Try listing some NFTs!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item.listingId}
              className="border rounded-lg shadow-md p-4"
            >
              <img
                src={
                  item.tokenId && item.nftAddress
                    ? `https://ipfs.io/ipfs/${item.tokenId}`
                    : "https://via.placeholder.com/300"
                }
                alt={`NFT ${item.tokenId}`}
                className="w-full h-64 object-cover rounded"
              />
              <div className="mt-4 space-y-1 text-sm font-mono">
                <p>
                  <strong>Listing ID:</strong> {item.listingId}
                </p>
                <p>
                  <strong>Token ID:</strong> {item.tokenId}
                </p>
                <p>
                  <strong>Price:</strong>{" "}
                  {(Number(item.price) / 1e18).toFixed(4)} ETH
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {item.isSold ? "Sold" : item.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              {item.isActive && !item.isSold && (
                <button
                  onClick={() => handleCancel(item.listingId)}
                  disabled={cancellingId === item.listingId}
                  className={`w-full mt-4 py-2 rounded text-white font-semibold ${
                    cancellingId === item.listingId
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {cancellingId === item.listingId
                    ? "Cancelling..."
                    : "Cancel Listing"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
