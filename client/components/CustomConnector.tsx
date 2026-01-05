"use client";

import {
  ConnectButton,
  useActiveAccount,
  useDisconnect,
  useActiveWallet,
  useActiveWalletChain,
} from "thirdweb/react";
import { client } from "@/lib/client";
import { wallets } from "@/lib/wallets";
import { supportedChains, defaultChain } from "@/lib/chains";
import { useState } from "react";

export default function CustomConnector() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const chain = useActiveWalletChain();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);

  if (account) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-black hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
              <p className="font-semibold">Connected </p>
              <p>
                <strong>Chain:</strong> {chain?.name}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                {account.address.slice(0, 10)}...{account.address.slice(-8)}
              </p>
            </div>

            <button
              onClick={() => {
                if (wallet) {
                  disconnect(wallet);
                }
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Disconnect
            </button>
          </div>
        )}

        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  } else {
    return (
      <ConnectButton
        client={client}
        wallets={wallets}
        chains={supportedChains}
        chain={defaultChain}
        autoConnect={true}
        theme="light"
        accountAbstraction={{
          chain: defaultChain,
          sponsorGas: true,
        }}
        connectModal={{
          size: "wide",
          title: "Connect to Base in Votium",
          showThirdwebBranding: false,
          termsOfServiceUrl: "https://myapp.com/terms",
          privacyPolicyUrl: "https://myapp.com/privacy",
        }}
        connectButton={{
          label: "Connect Wallet",
          className:
            "!bg-black hover:!bg-gray-800 !px-6 !py-3 !rounded-lg !font-semibold",
        }}
      />
    );
  }
}
