"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export function WalletButton() {
  const currentAccount = useCurrentAccount();

  return (
    <div className="relative">
      <ConnectButton
        connectText="連接錢包"
        className="px-6 py-3 rounded-lg font-medium transition-all
          bg-gradient-header text-white shadow-lg
          hover:shadow-xl hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-primary-purple focus:ring-offset-2"
      />
      {currentAccount && (
        <div className="absolute -bottom-8 right-0 text-xs text-text-secondary">
          {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
        </div>
      )}
    </div>
  );
}

