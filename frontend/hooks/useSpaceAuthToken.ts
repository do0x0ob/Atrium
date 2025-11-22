/**
 * useSpaceAuthToken - Query user's authentication token for a space
 * Returns either SpaceOwnership (for creators) or Subscription (for subscribers)
 */

import { useState, useEffect, useCallback } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { PACKAGE_ID } from '@/config/sui';

interface AuthToken {
  type: 'ownership' | 'subscription' | null;
  id: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void; // Add refetch function
}

/**
 * Query user's authentication token for accessing space content
 * @param spaceId - The Space object ID
 * @param userAddress - Current user's wallet address
 * @param isCreator - Whether the user is the space creator
 * @returns Authentication token info (ownership or subscription)
 */
export function useSpaceAuthToken(
  spaceId: string | undefined,
  userAddress: string | undefined,
  isCreator: boolean
): AuthToken {
  const [authToken, setAuthToken] = useState<AuthToken>({
    type: null,
    id: null,
    loading: false,
    error: null,
    refetch: () => {}, // Placeholder
  });
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Refetch function that can be called externally
  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!spaceId || !userAddress) {
      setAuthToken({
        type: null,
        id: null,
        loading: false,
        error: null,
        refetch,
      });
      return;
    }

    let isCancelled = false;

    const queryAuthToken = async () => {
      setAuthToken(prev => ({ ...prev, loading: true, error: null, refetch }));

      try {
        const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

        if (isCreator) {
          // Query SpaceOwnership NFT for creator
          const ownershipType = `${PACKAGE_ID}::space::SpaceOwnership`;
          
          const ownedObjects = await suiClient.getOwnedObjects({
            owner: userAddress,
            filter: {
              StructType: ownershipType,
            },
            options: {
              showContent: true,
              showType: true,
            },
          });

          if (isCancelled) return;

          // Find the ownership NFT that matches this space
          const ownershipNFT = ownedObjects.data.find(obj => {
            if (obj.data?.content?.dataType !== 'moveObject') return false;
            const fields = obj.data.content.fields as any;
            return fields?.space_id === spaceId;
          });

          if (ownershipNFT) {
            console.log('✅ Found SpaceOwnership NFT:', ownershipNFT.data?.objectId);
            setAuthToken({
              type: 'ownership',
              id: ownershipNFT.data?.objectId || null,
              loading: false,
              error: null,
              refetch,
            });
          } else {
            console.warn('⚠️ No SpaceOwnership found for space:', spaceId);
            setAuthToken({
              type: null,
              id: null,
              loading: false,
              error: 'SpaceOwnership not found',
              refetch,
            });
          }
        } else {
          // Query Subscription NFT for subscriber
          const subscriptionType = `${PACKAGE_ID}::subscription::Subscription`;
          
          const ownedObjects = await suiClient.getOwnedObjects({
            owner: userAddress,
            filter: {
              StructType: subscriptionType,
            },
            options: {
              showContent: true,
              showType: true,
            },
          });

          if (isCancelled) return;

          // Find the subscription that matches this space
          const subscriptionNFT = ownedObjects.data.find(obj => {
            if (obj.data?.content?.dataType !== 'moveObject') return false;
            const fields = obj.data.content.fields as any;
            return fields?.space_id === spaceId;
          });

          if (subscriptionNFT) {
            console.log('✅ Found Subscription NFT:', subscriptionNFT.data?.objectId);
            setAuthToken({
              type: 'subscription',
              id: subscriptionNFT.data?.objectId || null,
              loading: false,
              error: null,
              refetch,
            });
          } else {
            console.warn('⚠️ No Subscription found for space:', spaceId);
            setAuthToken({
              type: null,
              id: null,
              loading: false,
              error: 'Subscription not found. Please subscribe to access content.',
              refetch,
            });
          }
        }
      } catch (error: any) {
        if (isCancelled) return;
        
        console.error('❌ Failed to query auth token:', error);
        setAuthToken({
          type: null,
          id: null,
          loading: false,
          error: error.message || 'Failed to query authentication token',
          refetch,
        });
      }
    };

    queryAuthToken();

    return () => {
      isCancelled = true;
    };
  }, [spaceId, userAddress, isCreator, refetchTrigger, refetch]);

  return authToken;
}

