import { useContext } from "react";
import { WalletContext } from "./WalletContext";

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
};
