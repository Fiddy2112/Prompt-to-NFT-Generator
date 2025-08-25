import { useEffect, useState } from "react";
import { config } from "../config";
import { useWallet } from "../contexts/useWallet";
import { toastError, toastSuccess } from "../lib/utils";
import { AINFT_ABI, AINFT_ADDRESS } from "../contract/contractData";
import { readContract } from "@wagmi/core";

type NFTItem = {
  tokenId: number;
  tokenURI: string;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
  };
};

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL;

const MyNFTs = () => {
  const { wallet, connectWallet } = useWallet();
  const [nfts, setNFTs] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyNFTs = async () => {
    if (!wallet) return;
    setLoading(true);

    try {
      const tokenIds = (await readContract(config, {
        address: AINFT_ADDRESS as `0x${string}`,
        abi: AINFT_ABI,
        functionName: "getTokensByOwner",
        args: [wallet],
      })) as bigint[];

      const tokens: NFTItem[] = [];

      for (const idBigInt of tokenIds) {
        const id = Number(idBigInt);
        try {
          const tokenURI = await readContract(config, {
            address: AINFT_ADDRESS as `0x${string}`,
            abi: AINFT_ABI,
            functionName: "tokenURI",
            args: [id],
          });

          tokens.push({ tokenId: id, tokenURI: tokenURI as string });
        } catch (err) {
          console.log(err);
          console.warn(`Failed to read tokenURI for token ${id}`);
          tokens.push({ tokenId: id, tokenURI: "" });
        }
      }

      const enriched = await Promise.all(
        tokens.map(async (nft) => {
          if (!nft.tokenURI) return nft;

          try {
            const uri = `${nft.tokenURI.replace(
              `${GATEWAY_URL}/`,
              "https://ipfs.io/"
            )}`;

            const resp = await fetch(uri);
            if (!resp.ok) throw new Error("Metadata fetch failed");

            const meta = await resp.json();
            return { ...nft, metadata: meta };
          } catch (e) {
            console.error(`Metadata error for token ${nft.tokenId}:`, e);
            return nft;
          }
        })
      );

      setNFTs(enriched);
      toastSuccess("Fetched your NFTs!");
    } catch (err) {
      console.error("Error fetching NFTs:", err);
      toastError("Failed to fetch your NFTs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet) fetchMyNFTs();
  }, [wallet]);

  if (!wallet) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4 text-base font-mono">
          Connect wallet to view your NFTs.
        </p>
        <button
          onClick={connectWallet}
          className="px-4 py-2 text-base font-mono cursor-pointer bg-[#ff5f0d] hover:bg-[#ff5f0d]/90 text-white rounded"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  console.log(nfts);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center font-mono">My NFTs</h1>

      <div className="text-center mb-4">
        <button
          onClick={fetchMyNFTs}
          className="px-4 py-2 bg-blue-500 text-white rounded font-mono hover:bg-blue-600 cursor-pointer"
        >
          Refresh NFTs
        </button>
      </div>

      {loading && (
        <p className="text-center animate-pulse font-mono">Loading...</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <div key={nft.tokenId} className="border rounded-lg shadow p-4">
            {nft ? (
              <>
                <img
                  src={`${nft.tokenURI.replace(
                    `${GATEWAY_URL}/`,
                    "https://ipfs.io/"
                  )}`}
                  alt={`#${nft.tokenId}`}
                  className="w-full h-60 object-cover rounded mb-3"
                />
              </>
            ) : (
              <div className="w-full h-60 bg-gray-200 flex items-center justify-center rounded mb-3">
                No image
              </div>
            )}
            <h2 className="text-lg font-semibold">
              {nft.metadata?.name || `Token #${nft.tokenId}`}
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              {nft.metadata?.description}
            </p>
            <p className="font-mono text-xs text-gray-400">#{nft.tokenId}</p>
          </div>
        ))}
      </div>

      {!loading && nfts.length === 0 && (
        <p className="text-center mt-8 text-gray-500 text-base font-mono">
          You don’t own any NFTs yet.
        </p>
      )}
    </div>
  );
};

export default MyNFTs;
