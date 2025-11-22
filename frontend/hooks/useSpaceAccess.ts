/**
 * useSpaceAccess - Subscription and Permission Logic
 * Handles subscription status and access control for spaces
 */

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/config/sui';

interface UseSpaceAccessOptions {
  spaceKioskId: string;
  spaceCreator: string;
}

interface UseSpaceAccessReturn {
  isSubscribed: boolean;
  identityId: string | null;
  isCreator: boolean;
  accessStatus: 'creator' | 'subscriber' | 'visitor';
  loading: boolean;
}

export function useSpaceAccess({ 
  spaceKioskId, 
  spaceCreator 
}: UseSpaceAccessOptions): UseSpaceAccessReturn {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [identityId, setIdentityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if current user is the space creator
  const isCreator = currentAccount?.address 
    ? currentAccount.address.toLowerCase() === spaceCreator?.toLowerCase()
    : false;

  // Get access status
  const accessStatus = isCreator 
    ? 'creator' 
    : isSubscribed 
    ? 'subscriber' 
    : 'visitor';

  useEffect(() => {
    async function checkStatus() {
      if (!currentAccount || !spaceKioskId) {
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
      } catch (error) {
        console.error('[useSpaceAccess] Failed to check status:', error);
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, [currentAccount, spaceKioskId, suiClient]);

  return {
    isSubscribed,
    identityId,
    isCreator,
    accessStatus,
    loading,
  };
}

