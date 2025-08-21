import { createContext, useEffect, useState, type ReactNode } from "react";
import { connect, getAccount, injected, watchAccount } from "@wagmi/core";
import { config } from "../config";
import { toastError, toastSuccess } from "../lib/utils";

type WalletContextType = {
  wallet: `0x${string}` | null;
  connectWallet: () => Promise<void>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const WalletContext = createContext<WalletContextType | undefined>(
  undefined
);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<`0x${string}` | null>(null);

  useEffect(() => {
    const acc = getAccount(config);
    setWallet(acc.address || null);

    const unwatch = watchAccount(config, {
      onChange(account) {
        setWallet(account.address || null);
      },
    });

    return () => unwatch();
  }, []);

  const connectWallet = async () => {
    try {
      const result = await connect(config, { connector: injected() });
      setWallet(result.accounts[0]);
      toastSuccess("🦊 Wallet connected");
    } catch (err) {
      console.log(err);
      toastError("Failed to connect wallet");
    }
  };

  return (
    <WalletContext.Provider value={{ wallet, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
