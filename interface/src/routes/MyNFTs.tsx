import { useEffect, useState } from "react";
import { config } from "../config";
import { useWallet } from "../contexts/useWallet";
import { toastError, toastSuccess } from "../lib/utils";
import { AINFT_ABI, AINFT_ADDRESS } from "../contract/contractData";
import { publicClient } from "../client";
import { parseAbiItem } from "viem";
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

const MyNFTs = () => {
  const { wallet, connectWallet } = useWallet();
  const [nfts, setNFTs] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Hàm lấy tokenId từ event Minted của hợp đồng
  const fetchMintedTokenIds = async (
    address: `0x${string}`
  ): Promise<number[]> => {
    try {
      const logs = await publicClient.getLogs({
        address: AINFT_ADDRESS as `0x${string}`,
        event: parseAbiItem(
          "event Minted(address indexed to, uint256 indexed tokenId, string tokenURI)"
        ),
        args: {
          to: address,
        },
      });
      return logs.map((log) => Number(log.args.tokenId));
    } catch (err) {
      console.error("Error fetching logs:", err);
      return [];
    }
  };

  const fetchMyNFTs = async () => {
    if (!wallet) return;
    setLoading(true);

    try {
      // Lấy tokenId của user từ event Minted
      const tokenIds = await fetchMintedTokenIds(wallet as `0x${string}`);

      const tokens: NFTItem[] = [];

      // Lấy tokenURI cho từng tokenId
      for (const id of tokenIds) {
        try {
          const tokenURI = await readContract(config, {
            address: AINFT_ADDRESS as `0x${string}`,
            abi: AINFT_ABI,
            functionName: "tokenURI",
            args: [id],
          });

          tokens.push({ tokenId: id, tokenURI: tokenURI as string });
        } catch {
          tokens.push({ tokenId: id, tokenURI: "" });
        }
      }

      const enriched = await Promise.all(
        tokens.map(async (nft) => {
          if (!nft.tokenURI) return nft;

          try {
            const uri = nft.tokenURI.startsWith("ipfs://")
              ? nft.tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
              : nft.tokenURI;

            const resp = await fetch(uri);
            if (!resp.ok) throw new Error("Failed fetch");
            const meta = await resp.json();
            return { ...nft, metadata: meta };
          } catch {
            return nft;
          }
        })
      );

      setNFTs(enriched);
      toastSuccess("Fetched your NFTs!");
    } catch (err) {
      console.error(err);
      toastError("Failed to fetch your NFTs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet) fetchMyNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center font-mono">My NFTs</h1>
      {loading && (
        <p className="text-center animate-pulse font-mono">Loading...</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <div key={nft.tokenId} className="border rounded-lg shadow p-4">
            {nft.metadata?.image ? (
              <img
                src={
                  nft.metadata.image.startsWith("ipfs://")
                    ? nft.metadata.image.replace(
                        "ipfs://",
                        "https://ipfs.io/ipfs/"
                      )
                    : nft.metadata.image
                }
                alt={nft.metadata.name || `#${nft.tokenId}`}
                className="w-full h-60 object-cover rounded mb-3"
              />
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
