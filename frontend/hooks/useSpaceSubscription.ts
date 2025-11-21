import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/config/sui';

/**
 * useSpaceSubscription - Unified subscription state management
 * Checks if current user has an active subscription to a space
 * Also fetches user's identity ID
 */
export function useSpaceSubscription(spaceKioskId: string | null) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [identityId, setIdentityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      if (!currentAccount || !spaceKioskId) {
        setIsSubscribed(false);
        setIdentityId(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Get Identity
        const { data: identityData } = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: { StructType: `${PACKAGE_ID}::identity::Identity` },
        });
        
        if (identityData.length > 0) {
          setIdentityId(identityData[0].data?.objectId || null);
        }

        // 2. Check Subscription
        const { data: subscriptionData } = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: { StructType: `${PACKAGE_ID}::subscription::Subscription` },
          options: { showContent: true }
        });

        // Filter for subscription to this specific space kiosk
        const hasSubscription = subscriptionData.some(sub => {
          const content = sub.data?.content as any;
          return content?.fields?.space_kiosk_id === spaceKioskId;
        });

        setIsSubscribed(hasSubscription);
      } catch (e) {
        console.error("Failed to check subscription status", e);
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, [currentAccount, suiClient, spaceKioskId]);

  return {
    isSubscribed,
    identityId,
    loading,
    setIsSubscribed, // Allow manual updates (e.g., after subscribing)
  };
}

