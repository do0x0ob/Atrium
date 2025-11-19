import React, { useState, useEffect } from 'react';
import { RetroPanel } from '@/components/common/RetroPanel';
import { RetroButton } from '@/components/common/RetroButton';
import { downloadAndDecryptContent } from '@/services/sealContent';
import { useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';

interface VideoWindowProps {
  blobId: string;
  resourceId: string;
  title: string;
  isLocked: boolean;
}

export const VideoWindow: React.FC<VideoWindowProps> = ({ blobId, resourceId, title, isLocked }) => {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      if (!blobId) return;

      if (!isLocked) {
        // If not locked, just stream from Walrus directly (assuming it's a public blob if not locked, or we treat unencrypted as standard)
        // Note: In real impl, unencrypted blobs are just public.
        // But our logic assumes we might have encrypted it even if "unlocked" in UI? 
        // Ideally if !isLocked, it means it wasn't encrypted.
        const aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || "https://aggregator.walrus-testnet.walrus.space";
        setVideoUrl(`${aggregatorUrl}/v1/blobs/${blobId}`);
        return;
      }

      if (!currentAccount) {
        setError("Please connect wallet to view this content");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const url = await downloadAndDecryptContent(
          blobId,
          resourceId,
          currentAccount.address,
          (msg) => signPersonalMessage({ message: msg }),
          'video/mp4'
        );
        
        setVideoUrl(url);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to decrypt video");
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
    
    return () => {
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [blobId, isLocked, currentAccount]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-2">⟳</div>
          <div>Decrypting Secure Video...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-red-500 p-4">
        <div className="text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black flex flex-col">
      {videoUrl ? (
        <video 
          src={videoUrl} 
          controls 
          autoPlay 
          className="w-full h-full object-contain"
          controlsList="nodownload"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Video unavailable
        </div>
      )}
    </div>
  );
};

