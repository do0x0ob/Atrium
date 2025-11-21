/**
 * Hook for loading secure (encrypted) content with Seal
 * Provides unified state management and concurrency control
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { downloadAndDecryptContent } from '@/services/sealContent';
import { useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';
import { getWalrusAggregatorUrl } from '@/config/walrus';

interface UseSecureContentOptions {
  blobId: string;
  resourceId: string;
  contentType: string;
  isLocked: boolean;
}

interface UseSecureContentReturn {
  content: string | null;
  loading: boolean;
  error: string | null;
}

export function useSecureContent({
  blobId,
  resourceId,
  contentType,
  isLocked,
}: UseSecureContentOptions): UseSecureContentReturn {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  const handleSign = useCallback(
    (msg: Uint8Array) => signPersonalMessage({ message: msg }),
    [signPersonalMessage]
  );

  useEffect(() => {
    // Prevent concurrent execution
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    
    const loadContent = async () => {
      if (!blobId) {
        setError('No blob ID provided');
        return;
      }

      // Public content: download directly from Walrus
      if (!isLocked) {
        try {
          setLoading(true);
          const aggregatorUrl = getWalrusAggregatorUrl();
          const res = await fetch(`${aggregatorUrl}/v1/blobs/${blobId}`);
          
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          
          const data = await res.text();
          setContent(data);
        } catch (e: any) {
          setError(`Failed to load: ${e.message}`);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Encrypted content: requires decryption
      if (!currentAccount) {
        setError("Please connect wallet to view this content");
        return;
      }

      if (!resourceId || resourceId === '' || resourceId === '0x') {
        setError('Invalid resource ID');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await downloadAndDecryptContent(
          blobId,
          resourceId,
          currentAccount.address,
          handleSign,
          contentType
        );

        setContent(data);
      } catch (e: any) {
        setError(e.message || "Failed to decrypt content");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [blobId, resourceId, isLocked, currentAccount?.address, contentType, handleSign]);

  return { content, loading, error };
}

