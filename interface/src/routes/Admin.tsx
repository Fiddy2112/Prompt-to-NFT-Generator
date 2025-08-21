import { useState } from "react";
import { useWallet } from "../contexts/useWallet";
import { allowMintForUser, ownerMintForUser } from "../lib/contractUtils";
import { shortAddress, toastError, toastSuccess } from "../lib/utils";
import { OWNER_ADDRESS } from "../contract/contractData";

const Admin = () => {
  const { wallet, connectWallet } = useWallet();
  const [userAddress, setUserAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [tokenURI, setTokenURI] = useState("");
  if (!wallet || wallet.toLowerCase() !== OWNER_ADDRESS.toLowerCase()) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-2xl mb-4">Admin Panel</h1>
        <p>You must connect as owner to access this page.</p>
        <button
          onClick={connectWallet}
          className="mt-4 cursor-pointer bg-[#ff5f0d] hover:bg-[#ff5f0d]/90 text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  const handleAllowMint = async () => {
    if (!userAddress.trim()) {
      toastError("Please enter a valid user address.");
      return;
    }

    setLoading(true);
    try {
      const tx = await allowMintForUser(userAddress);
      setTxHash(tx);
      toastSuccess(`User ${shortAddress(userAddress)} allowed to mint.`);
      setUserAddress("");
    } catch (err) {
      toastError("Failed to allow mint for user.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminMint = async () => {
    if (!userAddress.trim() || !tokenURI.trim()) {
      toastError("Please enter a valid user address and token URI.");
      return;
    }
    setLoading(true);
    try {
      const tx = await ownerMintForUser(userAddress, tokenURI);
      setTxHash(tx);
      toastSuccess(`NFT minted for ${shortAddress(userAddress)}!`);
      setUserAddress("");
      setTokenURI("");
    } catch (err) {
      toastError("Failed to mint NFT.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Allow Minting for User</h2>
          <input
            type="text"
            placeholder="User wallet address"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-2"
          />
          <button
            onClick={handleAllowMint}
            disabled={loading}
            className="w-full bg-green-600 cursor-pointer text-white py-2 rounded font-semibold"
          >
            {loading ? "Allowing..." : "Allow Mint for User"}
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            Admin Mint NFT for User
          </h2>
          <input
            type="text"
            placeholder="User wallet address"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-2"
          />
          <input
            type="text"
            placeholder="Token URI (image URL or metadata URI)"
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-2"
          />
          <button
            onClick={handleAdminMint}
            disabled={loading}
            className="w-full bg-blue-600 cursor-pointer text-white py-2 rounded font-semibold"
          >
            {loading ? "Minting..." : "Mint NFT for User"}
          </button>
        </div>
      </div>

      {txHash && (
        <p className="text-base font-mono">
          TxHash:{" "}
          <a
            className="hover:underline"
            target="_blank"
            rel="noreferrer"
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
          >
            {shortAddress(txHash)}
          </a>
        </p>
      )}
    </div>
  );
};

export default Admin;
