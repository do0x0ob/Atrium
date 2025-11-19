"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { RetroPanel } from "@/components/common/RetroPanel";
import { RetroButton } from "@/components/common/RetroButton";
import { RetroHeading } from "@/components/common/RetroHeading";
import { ThreeScene } from "@/components/3d/ThreeScene";
import { RetroFrameCanvas } from "@/components/3d/RetroFrameCanvas";

interface SpaceData {
  kioskId: string;
  name: string;
  description: string;
  coverImage: string;
  configQuilt: string;
  subscriptionPrice: string;
  creator: string;
}

export default function SpaceEditPage() {
  const params = useParams();
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const kioskId = params.kioskId as string;
  
  const [loading, setLoading] = useState(true);
  const [spaceData, setSpaceData] = useState<SpaceData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

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
      const mockSpaces: Record<string, Partial<SpaceData>> = {
        "0x123": {
          name: "Art Gallery",
          description: "Sharing my digital art creations",
          subscriptionPrice: "1000000000", // 1 SUI
        },
        "0x456": {
          name: "Music Studio",
          description: "Original compositions and performances",
          subscriptionPrice: "2000000000", // 2 SUI
        },
        "0x789": {
          name: "Tech Workshop",
          description: "Tutorials and technical content",
          subscriptionPrice: "1500000000", // 1.5 SUI
        },
        "0xaaa": {
          name: "Photography Studio",
          description: "Professional photography and editing",
          subscriptionPrice: "1200000000",
        },
        "0xbbb": {
          name: "Writing Corner",
          description: "Stories, poems, and creative writing",
          subscriptionPrice: "800000000",
        },
        "0xccc": {
          name: "Design Lab",
          description: "UI/UX designs and graphic art",
          subscriptionPrice: "1800000000",
        },
        "0xddd": {
          name: "Cooking Channel",
          description: "Recipes and culinary adventures",
          subscriptionPrice: "900000000",
        },
        default: {
          name: "Unknown Space",
          description: "This space information is not available",
          subscriptionPrice: "1000000000",
        }
      };

      // Use the kioskId to determine which mock space to show, or default
      const selectedSpace = mockSpaces[kioskId] || mockSpaces.default;

      const mockSpace: SpaceData = {
        kioskId,
        name: selectedSpace.name!,
        description: selectedSpace.description!,
        coverImage: "",
        configQuilt: "",
        subscriptionPrice: selectedSpace.subscriptionPrice!,
        creator: currentAccount?.address || "0xabc123...",
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
        <RetroPanel className="p-8 text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Space Not Found</h2>
          <p className="text-sm text-gray-600 mb-4">The space you're looking for doesn't exist.</p>
          <RetroButton onClick={() => router.push("/")} variant="primary">
            Back to Atrium
          </RetroButton>
        </RetroPanel>
      </div>
    );
  }

  // Check if user is the creator
  if (currentAccount?.address !== spaceData.creator) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" style={{ fontFamily: 'Georgia, serif' }}>
        <RetroPanel className="p-8 text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-sm text-gray-600 mb-4">You don't have permission to edit this space.</p>
          <div className="flex gap-3 justify-center">
            <RetroButton onClick={() => router.push(`/space/${kioskId}`)} variant="secondary">
              View Space
            </RetroButton>
            <RetroButton onClick={() => router.push("/")} variant="primary">
              Back to Atrium
            </RetroButton>
          </div>
        </RetroPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header Bar */}
      <RetroPanel className="mb-0 rounded-none p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <RetroButton
            onClick={() => router.push(`/space/${kioskId}`)}
            variant="secondary"
            size="sm"
          >
            ← Back to Space
          </RetroButton>
          <div>
            <h1 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
              Edit: {spaceData.name}
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              3D Space Editor
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <RetroButton
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? "primary" : "secondary"}
            size="sm"
          >
            {isEditMode ? "Exit Edit" : "Edit Mode"}
          </RetroButton>
          <RetroButton
            onClick={() => {
              // TODO: Save changes
              console.log("Saving changes...");
            }}
            variant="primary"
            size="sm"
          >
            Save Changes
          </RetroButton>
        </div>
      </RetroPanel>

      {/* Main Content Area */}
      <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Sidebar */}
        <RetroPanel className="w-80 h-full flex-shrink-0 rounded-none border-r overflow-y-auto scrollbar-hidden">
          <div className="p-4 space-y-4">
            {/* Space Settings */}
            <div>
              <RetroHeading 
                title="Space Settings"
                subtitle="Configure your 3D world"
                className="mb-4"
              />
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    Space Name
                  </label>
                  <RetroPanel variant="inset" className="p-0">
                    <input
                      type="text"
                      value={spaceData.name}
                      onChange={(e) => setSpaceData({ ...spaceData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-transparent border-0 outline-none"
                      style={{ fontFamily: 'Georgia, serif' }}
                    />
                  </RetroPanel>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    Description
                  </label>
                  <RetroPanel variant="inset" className="p-0">
                    <textarea
                      value={spaceData.description}
                      onChange={(e) => setSpaceData({ ...spaceData, description: e.target.value })}
                      className="w-full px-3 py-2 bg-transparent border-0 outline-none resize-none"
                      style={{ fontFamily: 'Georgia, serif' }}
                      rows={3}
                    />
                  </RetroPanel>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    Cover Image
                  </label>
                  <RetroPanel variant="inset" className="p-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full px-3 py-2 bg-transparent border-0 outline-none"
                      style={{ fontFamily: 'Georgia, serif' }}
                    />
                  </RetroPanel>
                </div>
              </div>
            </div>

            {/* 3D Objects */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                3D Objects
              </h3>
              
              <div className="space-y-2">
                <RetroButton variant="secondary" className="w-full" size="sm">
                  + Add Object
                </RetroButton>
                <RetroButton variant="secondary" className="w-full" size="sm">
                  📁 Import GLB
                </RetroButton>
                <RetroButton variant="secondary" className="w-full" size="sm">
                  🎨 Add Texture
                </RetroButton>
              </div>
            </div>

            {/* Lighting */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Lighting & Environment
              </h3>
              
              <div className="space-y-2">
                <RetroButton variant="secondary" className="w-full" size="sm">
                  ☀️ Ambient Light
                </RetroButton>
                <RetroButton variant="secondary" className="w-full" size="sm">
                  💡 Point Light
                </RetroButton>
                <RetroButton variant="secondary" className="w-full" size="sm">
                  🌅 Environment Map
                </RetroButton>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t" style={{ borderColor: '#d1d5db' }}>
              <div className="space-y-2">
                <RetroButton 
                  onClick={() => router.push(`/space/${kioskId}`)}
                  variant="secondary" 
                  className="w-full"
                >
                  Preview Space
                </RetroButton>
                <RetroButton 
                  variant="primary" 
                  className="w-full"
                  onClick={() => {
                    // TODO: Publish changes
                    console.log("Publishing space...");
                  }}
                >
                  Publish Changes
                </RetroButton>
              </div>
            </div>
          </div>
        </RetroPanel>

        {/* 3D Scene Area */}
        <div className="flex-1 flex flex-col relative">
          <RetroFrameCanvas className="bg-gray-100">
            <ThreeScene
              kioskId={spaceData.kioskId}
              enableGallery={true}
            />
            
            {isEditMode && (
              <div className="absolute top-4 left-4 z-10">
                <RetroPanel className="p-3">
                  <p className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                    🎯 Edit Mode Active
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click objects to select and modify
                  </p>
                </RetroPanel>
              </div>
            )}
          </RetroFrameCanvas>

          {/* Bottom Control Panel */}
          <RetroPanel className="p-4 rounded-none border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RetroButton
                  onClick={() => setIsEditMode(!isEditMode)}
                  variant={isEditMode ? "primary" : "secondary"}
                  size="sm"
                >
                  {isEditMode ? "✏️ Editing" : "👁️ Preview"}
                </RetroButton>
                <RetroButton
                  variant="secondary"
                  size="sm"
                >
                  🔄 Reset View
                </RetroButton>
                <RetroButton
                  variant="secondary"
                  size="sm"
                >
                  📷 Take Screenshot
                </RetroButton>
              </div>
              <div className="text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                <span className="text-gray-600">Creator Mode</span>
              </div>
            </div>
          </RetroPanel>
        </div>
      </div>
    </div>
  );
}

