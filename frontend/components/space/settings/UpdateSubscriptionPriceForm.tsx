"use client";

import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { RetroPanel } from "@/components/common/RetroPanel";
import { RetroButton } from "@/components/common/RetroButton";
import { updateSpaceConfig, MIST_PER_SUI, SUI_CHAIN } from "@/utils/transactions";

interface UpdateSubscriptionPriceFormProps {
  spaceId: string;
  ownershipId: string;
  currentPrice: string; // In MIST
  onUpdated?: () => void;
  onClose?: () => void;
}

export function UpdateSubscriptionPriceForm({ 
  spaceId, 
  ownershipId,
  currentPrice, 
  onUpdated,
  onClose,
}: UpdateSubscriptionPriceFormProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [loading, setLoading] = useState(false);
  
  // Convert current price from MIST to SUI for display
  const currentPriceInSui = (parseInt(currentPrice) / MIST_PER_SUI).toFixed(3);
  const [newPrice, setNewPrice] = useState(currentPriceInSui);

  const handleUpdate = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);

      // Convert price from SUI to MIST
      const priceInMist = Math.floor(parseFloat(newPrice) * MIST_PER_SUI);

      const tx = updateSpaceConfig(
        spaceId,
        ownershipId,
        {
          newSubscriptionPrice: priceInMist, // Only update subscription price
        }
      );

      signAndExecute(
        { 
          transaction: tx,
          chain: SUI_CHAIN,
        },
        {
          onSuccess: (result) => {
            console.log('✅ Subscription price updated successfully:', result);
            alert("Subscription price updated successfully!");
            setLoading(false);
            onUpdated?.();
            onClose?.();
          },
          onError: (error) => {
            console.error("❌ Failed to update price:", error);
            setLoading(false);
            alert(`Failed to update price: ${error.message || error}`);
          },
        }
      );
    } catch (error: any) {
      console.error("Error:", error);
      setLoading(false);
      alert(`Error: ${error.message}`);
    }
  };

  const priceChanged = newPrice !== currentPriceInSui;

  return (
    <div className="space-y-4">
      <RetroPanel variant="inset" className="p-4">
        <div className="space-y-3">
          {/* Current Price Display */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
              Current Price
            </label>
            <div className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
              {currentPriceInSui} SUI / day
            </div>
            <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Georgia, serif' }}>
              30 days: {(parseFloat(currentPriceInSui) * 30).toFixed(2)} SUI
            </p>
          </div>

          <div className="h-px bg-gray-300" />

          {/* New Price Input */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
              New Subscription Price (SUI per day)
            </label>
            <div className="flex items-center border border-gray-300 bg-white">
              <input
                type="number"
                min="0"
                step="0.001"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="flex-1 px-3 py-2 bg-transparent border-0 outline-none"
                style={{ fontFamily: 'Georgia, serif' }}
                placeholder="0.01"
              />
              <span className="px-3 text-sm text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>
                SUI
              </span>
            </div>
            {newPrice && parseFloat(newPrice) >= 0 && (
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                {parseFloat(newPrice) > 0 
                  ? `30 days: ${(parseFloat(newPrice) * 30).toFixed(2)} SUI`
                  : "Free content (no subscription required)"}
              </p>
            )}
          </div>

          {priceChanged && (
            <div className="bg-blue-50 border border-blue-200 p-2 rounded">
              <p className="text-xs text-blue-700" style={{ fontFamily: 'Georgia, serif' }}>
                💡 Price change will apply to new subscriptions only. Existing subscriptions remain unchanged.
              </p>
            </div>
          )}
        </div>
      </RetroPanel>

      <div className="flex gap-3">
        {onClose && (
          <RetroButton
            onClick={onClose}
            variant="secondary"
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </RetroButton>
        )}
        <RetroButton
          onClick={handleUpdate}
          variant="primary"
          className="flex-1"
          disabled={loading || !priceChanged || !currentAccount}
        >
          {loading ? "Updating..." : "Update Price"}
        </RetroButton>
      </div>

      <p className="text-xs text-gray-500 text-center" style={{ fontFamily: 'Georgia, serif' }}>
        Requires SpaceOwnership NFT to update
      </p>
    </div>
  );
}

