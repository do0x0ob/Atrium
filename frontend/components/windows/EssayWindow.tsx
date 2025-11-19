import React, { useState, useEffect } from 'react';
import { RetroPanel } from '@/components/common/RetroPanel';
import { downloadAndDecryptContent } from '@/services/sealContent';
import { useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';

interface EssayWindowProps {
  blobId: string;
  resourceId: string;
  title: string;
  isLocked: boolean;
}

export const EssayWindow: React.FC<EssayWindowProps> = ({ blobId, resourceId, title, isLocked }) => {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!blobId) return;

      if (!isLocked) {
        try {
          setLoading(true);
          const aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || "https://aggregator.walrus-testnet.walrus.space";
          const res = await fetch(`${aggregatorUrl}/v1/blobs/${blobId}`);
          const text = await res.text();
          setContent(text);
        } catch (e) {
          setError("Failed to load essay");
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!currentAccount) {
        setError("Please connect wallet to view this content");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const text = await downloadAndDecryptContent(
          blobId,
          resourceId,
          currentAccount.address,
          (msg) => signPersonalMessage({ message: msg }),
          'text/markdown'
        );
        
        setContent(text);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to decrypt essay");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [blobId, isLocked, currentAccount]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin text-3xl text-gray-400 mb-2">⟳</div>
          <div className="text-gray-600">Decrypting Essay...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white p-8">
        <div className="text-center text-red-500">
          <div className="text-3xl mb-2">⚠️</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white overflow-y-auto p-8 font-serif">
      <article className="prose prose-slate max-w-none">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">{title}</h1>
        <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">
          {content}
        </div>
      </article>
    </div>
  );
};

