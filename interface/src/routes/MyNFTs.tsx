import { useEffect, useState } from "react";
import { config } from "../config";
import { useWallet } from "../contexts/useWallet";
import { Copy } from "lucide-react";
import {
  toastError,
  toastSuccess,
  copyPaste,
  shortAddress,
  formatDate,
  formatFileSize,
} from "../lib/utils";
import { AINFT_ABI, AINFT_ADDRESS } from "../contract/contractData";
import { readContract } from "@wagmi/core";
import { PinataSDK } from "pinata";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL;

const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT!,
  pinataGateway: GATEWAY_URL,
});

type NFTItem = {
  tokenId: number;
  tokenURI: string;
  metadata?: {
    id: string;
    name: string;
    image?: string;
    size?: number;
    type?: string;
    createdAt?: string;
  };
};

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
          tokens.push({
            tokenId: id,
            tokenURI: tokenURI as string,
          });
        } catch (err) {
          console.warn(`Failed to read tokenURI for token ${id}`);
          tokens.push({ tokenId: id, tokenURI: "" });
        }
      }

      const files = await pinata.files.public.list();
      console.log(files);

      const enrichedTokens = await Promise.all(
        tokens.map(async (nft) => {
          if (!nft.tokenURI) return nft;

          try {
            const uri = nft.tokenURI.split("/ipfs/")[1];
            const file = files.files.find((f) => f.cid.includes(uri));

            if (file) {
              const ipfsImageUrl = `https://ipfs.io/ipfs/${file.cid}`;
              return {
                ...nft,
                metadata: {
                  name: `${file.name}`,
                  image: ipfsImageUrl,
                  size: `${formatFileSize(file?.size)}`,
                  type: `${file.mime_type}`,
                  createdAt: `${formatDate(file.created_at)}`,
                },
              };
            }
            return nft;
          } catch (e) {
            console.error(
              `Error fetching metadata for token ${nft.tokenId}:`,
              e
            );
            return nft;
          }
        })
      );

      setNFTs(enrichedTokens);
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
      <div className="p-8 text-center bg-gray-50 rounded-lg shadow-md">
        <p className="mb-4 text-lg font-medium text-gray-800">
          Connect your wallet to view your NFTs.
        </p>
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-[#ff5f0d] text-white font-semibold rounded-lg shadow hover:bg-[#ff5f0d]/90 transition-all"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  const handleCopy = (text: `0x${string}`) => {
    return copyPaste(text);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
        My NFTs
      </h1>

      <div className="text-center mb-6">
        <button
          onClick={fetchMyNFTs}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-all"
        >
          Refresh NFTs
        </button>
      </div>

      {loading && (
        <p className="text-center animate-pulse text-xl font-mono text-gray-600">
          Loading...
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {nfts.map((nft) => (
          <div
            key={nft.tokenId}
            className="border rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105"
          >
            {nft.metadata ? (
              <>
                <img
                  src={nft.metadata.image || "https://via.placeholder.com/150"}
                  alt={nft.metadata.name || `NFT #${nft.tokenId}`}
                  className="w-full h-60 object-cover mb-4"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {nft.metadata.name || `Token #${nft.tokenId}`}
                  </h2>
                  <p className="text-gray-600 mb-2">{nft.metadata.size}</p>
                  <p className="text-gray-600 mb-2">{nft.metadata.type}</p>
                  <p className="text-gray-600 mb-4">{nft.metadata.createdAt}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <p
                      onClick={() => copyPaste(`${nft.tokenId}`)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      #{nft.tokenId} <Copy size={16} />
                    </p>
                    <p
                      onClick={() => handleCopy(AINFT_ADDRESS)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      {shortAddress(AINFT_ADDRESS)} <Copy size={16} />
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-60 bg-gray-300 flex items-center justify-center rounded-t-lg">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && nfts.length === 0 && (
        <p className="text-center mt-8 text-lg text-gray-500">
          You don’t own any NFTs yet.
        </p>
      )}
    </div>
  );
};

export default MyNFTs;
