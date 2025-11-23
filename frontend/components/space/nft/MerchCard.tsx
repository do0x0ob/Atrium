import { RetroPanel } from "@/components/common/RetroPanel";
import { RetroButton } from "@/components/common/RetroButton";
import { getWalrusBlobUrl } from "@/config/walrus";

interface MerchCardProps {
  nft: {
    id: string;
    type: string;
    name: string;
    imageUrl: string;
    price: string;
    objectType: string;
  };
  onViewIn3D?: (nftId: string) => void;
  onPurchase: (nftId: string, nftType: string, price: string) => void;
}

export function MerchCard({ nft, onViewIn3D, onPurchase }: MerchCardProps) {
  const priceInSui = (parseInt(nft.price) / 1000000000).toFixed(2);

  return (
    <RetroPanel variant="outset" className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative bg-gray-50">
        {nft.imageUrl ? (
          <img
            src={nft.imageUrl.startsWith('http') ? nft.imageUrl : getWalrusBlobUrl(nft.imageUrl)}
            alt={nft.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
            {nft.objectType === '3d' ? '📦' : '🖼️'}
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <h3 className="font-serif font-bold text-gray-900 text-sm truncate">
          {nft.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900 font-mono">
            {priceInSui} SUI
          </div>
          <span className="text-[9px] uppercase tracking-wider font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
            {nft.objectType}
          </span>
        </div>

        <div className="flex gap-2">
          {onViewIn3D && (
            <RetroButton
              size="sm"
              variant="secondary"
              onClick={() => onViewIn3D(nft.id)}
              className="flex-1 text-xs"
            >
              View in 3D
            </RetroButton>
          )}
          <RetroButton
            size="sm"
            variant="primary"
            onClick={() => onPurchase(nft.id, nft.type, nft.price)}
            className="flex-1 text-xs"
          >
            Purchase
          </RetroButton>
        </div>
      </div>
    </RetroPanel>
  );
}

