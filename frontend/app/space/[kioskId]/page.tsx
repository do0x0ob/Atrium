"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSuiClient } from "@mysten/dapp-kit";
import { SpaceDetail } from "@/components/space/SpaceDetail";
import { RetroPanel } from "@/components/common/RetroPanel";
import { RetroButton } from "@/components/common/RetroButton";

export default function SpacePage() {
  const params = useParams();
  const router = useRouter();
  const kioskId = params.kioskId as string;
  const suiClient = useSuiClient();
  const [loading, setLoading] = useState(true);
  const [spaceData, setSpaceData] = useState<any>(null);

  useEffect(() => {
    if (kioskId) {
      loadSpaceData();
    }
  }, [kioskId]);

  const loadSpaceData = async () => {
    try {
      setLoading(true);
      
      // TODO: Load space data from chain
      // For now, use mock data that matches SpaceList.tsx
      const mockSpaces: Record<string, any> = {
        "0x123": {
          name: "Art Gallery",
          description: "Sharing my digital art creations",
          creator: "0xabc",
          subscriptionPrice: "1000000000", // 1 SUI
        },
        "0x456": {
          name: "Music Studio",
          description: "Original compositions and performances",
          creator: "0xdef",
          subscriptionPrice: "2000000000", // 2 SUI
        },
        "0x789": {
          name: "Tech Workshop",
          description: "Tutorials and technical content",
          creator: "0xghi",
          subscriptionPrice: "1500000000", // 1.5 SUI
        },
        "0xaaa": {
          name: "Photography Studio",
          description: "Professional photography and editing",
          creator: "0xjkl",
          subscriptionPrice: "1200000000",
        },
        "0xbbb": {
          name: "Writing Corner",
          description: "Stories, poems, and creative writing",
          creator: "0xmno",
          subscriptionPrice: "800000000",
        },
        "0xccc": {
          name: "Design Lab",
          description: "UI/UX designs and graphic art",
          creator: "0xpqr",
          subscriptionPrice: "1800000000",
        },
        "0xddd": {
          name: "Cooking Channel",
          description: "Recipes and culinary adventures",
          creator: "0xstu",
          subscriptionPrice: "900000000",
        },
        default: {
          name: "Unknown Space",
          description: "This space information is not available",
          creator: "0x000",
          subscriptionPrice: "1000000000",
        }
      };

      // Use the kioskId to determine which mock space to show, or default
      const selectedSpace = mockSpaces[kioskId] || mockSpaces.default;

      const mockSpace = {
        kioskId,
        name: selectedSpace.name,
        description: selectedSpace.description,
        coverImage: "",
        configQuilt: "",
        subscriptionPrice: selectedSpace.subscriptionPrice,
        creator: selectedSpace.creator,
        videoBlobs: [],
      };

      setSpaceData(mockSpace);
    } catch (error) {
      console.error("Failed to load space:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" style={{ fontFamily: 'Georgia, serif' }}>
        <RetroPanel className="p-8">
          <div className="text-center">
            <div className="inline-block animate-spin text-3xl text-gray-400 mb-4">
              ⟳
            </div>
            <p className="text-sm text-gray-600">Loading space...</p>
          </div>
        </RetroPanel>
      </div>
    );
  }

  if (!spaceData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" style={{ fontFamily: 'Georgia, serif' }}>
        <RetroPanel className="p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🏛️</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Space Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">
            The space you're looking for doesn't exist or has been removed.
          </p>
          <RetroButton 
            onClick={() => router.push("/")} 
            variant="primary"
          >
            Back to Atrium
          </RetroButton>
        </RetroPanel>
      </div>
    );
  }

  return <SpaceDetail space={spaceData} />;
}

