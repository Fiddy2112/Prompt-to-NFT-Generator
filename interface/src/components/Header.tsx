import { useWallet } from "../contexts/useWallet";
import { OWNER_ADDRESS } from "../contract/contractData";
import { shortAddress } from "../lib/utils";
import { NavLink } from "react-router-dom";

const Header = () => {
  const { wallet, connectWallet } = useWallet();

  const isOwner = wallet?.toLowerCase() === OWNER_ADDRESS.toLowerCase();

  return (
    <div className="p-5 flex items-center justify-between mx-auto container border-b">
      <h1 className="font-mono text-xl font-bold animate-pulse">
        <a href="">AI NFT Marketplace</a>
      </h1>
      <nav className="font-mono text-base flex items-center gap-5">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "text-gray-500 border-b" : ""
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/mint"
          className={({ isActive }) =>
            isActive ? "text-gray-500 border-b" : ""
          }
        >
          Mint
        </NavLink>
        <NavLink
          to="/marketplace"
          className={({ isActive }) =>
            isActive ? "text-gray-500 border-b" : ""
          }
        >
          Marketplace
        </NavLink>
        <NavLink
          to="/my-nfts"
          className={({ isActive }) =>
            isActive ? "text-gray-500 border-b" : ""
          }
        >
          My NFTs
        </NavLink>
        <NavLink
          to="/my-listings"
          className={({ isActive }) =>
            isActive ? "text-gray-500 border-b" : ""
          }
        >
          My Listings
        </NavLink>

        {isOwner && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive
                ? "text-red-600 border-b-2 border-red-600"
                : "text-red-400"
            }
          >
            Admin
          </NavLink>
        )}
      </nav>
      <button
        className="text-base font-mono p-2 rounded-md border cursor-pointer"
        onClick={connectWallet}
      >
        {wallet ? shortAddress(wallet) : "Connect Wallet"}
      </button>
    </div>
  );
};

export default Header;
