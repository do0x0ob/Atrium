"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ThreeScene } from "@/components/3d/ThreeScene";
import { ThemeToggle } from "@/components/3d/ThemeToggle";
import { StageTheme } from "@/types/theme";
import { SubscribeButton } from "@/components/subscription/SubscribeButton";
import { RetroPanel } from "@/components/common/RetroPanel";
import { RetroButton } from "@/components/common/RetroButton";
import { SpaceInfoCard } from "./SpaceInfoCard";
import { SpaceTabNavigation } from "./SpaceTabNavigation";
import { getAccessStatus } from "./AccessStatusIndicator";
import { ContentList } from "./ContentList";
import { ContentItemData } from "./ContentItem";

interface SpaceDetailProps {
  space: {
    kioskId: string;
    name: string;
    description: string;
    coverImage: string;
    configQuilt: string;
    subscriptionPrice: string;
    creator: string;
    videoBlobs: string[];
  };
}

export function SpaceDetail({ space }: SpaceDetailProps) {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const [activeTab, setActiveTab] = useState<"merch" | "video" | "essay" | "subscribe">("merch");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isContentMenuOpen, setIsContentMenuOpen] = useState(false);
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);
  const [theme, setTheme] = useState<StageTheme>('light');

  const isCreator = currentAccount?.address === space.creator;
  const accessStatus = getAccessStatus(currentAccount, isSubscribed, isCreator);

  // Define tabs based on user status
  const contentTabs = [
    { id: "merch", label: "Merch", icon: "🛍️" },
    { id: "video", label: "Video", icon: "🎥" },
    { id: "essay", label: "Essay", icon: "📝" },
  ];
  
  const subscribeTab = { id: "subscribe", label: "Subscribe", icon: "🔒" };
  
  // Add subscribe tab for non-subscribers on mobile
  const tabs = (currentAccount && !isSubscribed && !isCreator) 
    ? [...contentTabs, subscribeTab]
    : contentTabs;

  const handleJoinAtrium = () => {
    router.push("/");
  };

  const handleSubscribe = () => {
    setActiveTab("merch");
    // Focus on subscription area
  };

  const handleEditSpace = () => {
    router.push(`/space/${space.kioskId}/edit`);
  };

  // Mock content data - TODO: Load from chain
  const contentItems: ContentItemData[] = [
    // Merch items
    {
      id: "merch-1",
      title: "Limited Edition Art Print",
      description: "High-quality print of the featured artwork, signed by the artist",
      price: 5,
      type: "merch",
      isLocked: false,
    },
    {
      id: "merch-2", 
      title: "Exclusive Digital Assets Pack",
      description: "Collection of 3D models and textures used in this space",
      price: 10,
      type: "merch",
      isLocked: true,
    },
    // Video items
    {
      id: "video-1",
      title: "Behind the Scenes",
      description: "Free introduction to the creative process",
      price: 0,
      type: "video",
      isLocked: false,
    },
    {
      id: "video-2",
      title: "Advanced Tutorial Series",
      description: "Complete step-by-step guide to creating similar artwork",
      price: 0,
      type: "video", 
      isLocked: true,
    },
    {
      id: "video-3",
      title: "Live Workshop Recording",
      description: "2-hour live session with Q&A",
      price: 0,
      type: "video",
      isLocked: true,
    },
    // Essay items
    {
      id: "essay-1",
      title: "The Philosophy of Digital Art",
      description: "My thoughts on the intersection of technology and creativity",
      price: 0,
      type: "essay",
      isLocked: false,
    },
    {
      id: "essay-2",
      title: "Technical Deep Dive",
      description: "Detailed explanation of the techniques used in this project",
      price: 0,
      type: "essay",
      isLocked: true,
    },
  ];

  const handleUnlockContent = (itemId: string) => {
    // Show subscribe form
    setShowSubscribeForm(true);
  };

  const handleViewContent = (itemId: string) => {
    console.log("View content:", itemId);
    // TODO: Open content viewer
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/space/${space.kioskId}`;
    const shareText = `✨ ${space.name}\n\n${space.description}\n\n🔗 ${shareUrl}`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      alert("Link and description copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy to clipboard");
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Main Content Area - Full Height */}
      <div className="flex flex-col-reverse lg:flex-row flex-1 overflow-hidden">
        
        {/* Mobile: Bottom Navigation Bar - Hidden on Desktop */}
        <div className="lg:hidden flex-shrink-0" style={{ borderColor: '#d1d5db' }}>
          <RetroPanel variant="outset" className="rounded-none">
            {/* Expandable Content Panel - Above buttons */}
            {isContentMenuOpen && (
              <div 
                className="max-h-72 overflow-y-auto scrollbar-hidden border-b bg-white"
                style={{ borderColor: '#d1d5db' }}
              >
                <div className="p-2.5">
                  {activeTab === "subscribe" ? (
                    /* Subscribe Form */
                    <div>
                      <div className="text-center mb-2">
                        <span className="text-xs text-gray-700 font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                          🔒 Subscribe to unlock premium content
                        </span>
                      </div>
                      <SubscribeButton
                        spaceKioskId={space.kioskId}
                        price={space.subscriptionPrice}
                        onSubscribed={() => {
                          setIsSubscribed(true);
                          setActiveTab("merch");
                          setIsContentMenuOpen(false);
                        }}
                      />
                    </div>
                  ) : !currentAccount ? (
                    /* Guest Join Prompt */
                    <div className="text-center py-4">
                      <div className="text-3xl mb-2">👀</div>
                      <p className="text-xs text-gray-700 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                        Join Atrium to subscribe and unlock content
                      </p>
                      <RetroButton
                        onClick={() => {
                          handleJoinAtrium();
                          setIsContentMenuOpen(false);
                        }}
                        variant="primary"
                        size="sm"
                        className="w-full"
                      >
                        Join Atrium
                      </RetroButton>
                    </div>
                  ) : (
                    /* Content List */
                    <ContentList
                      items={contentItems}
                      type={activeTab as "merch" | "video" | "essay"}
                      isSubscribed={isSubscribed}
                      isCreator={isCreator}
                      onUnlock={(itemId) => {
                        handleUnlockContent(itemId);
                        setIsContentMenuOpen(false);
                      }}
                      onView={(itemId) => {
                        handleViewContent(itemId);
                        setIsContentMenuOpen(false);
                      }}
                    />
                  )}
                </div>
              </div>
            )}
            
            {/* Fixed Button Row */}
            <div className="flex" style={{ borderColor: '#d1d5db' }}>
              {tabs.map((tab) => (
                <div 
                  key={tab.id}
                  className="flex-1 border-r last:border-r-0"
                  style={{ borderColor: '#d1d5db' }}
                >
                  <RetroButton
                    onClick={() => {
                      if (activeTab === tab.id) {
                        setIsContentMenuOpen(!isContentMenuOpen);
                      } else {
                        setActiveTab(tab.id as "merch" | "video" | "essay" | "subscribe");
                        setIsContentMenuOpen(true);
                      }
                    }}
                    variant={activeTab === tab.id ? "primary" : "secondary"}
                    size="sm"
                    className="w-full rounded-none"
                  >
                    <div className="flex flex-col items-center py-1">
                      <span className="text-base mb-0.5">{tab.icon}</span>
                      <span className="text-xs" style={{ fontFamily: 'Georgia, serif' }}>
                        {tab.label}
                      </span>
                    </div>
                  </RetroButton>
                </div>
              ))}
            </div>
          </RetroPanel>
        </div>

        {/* Desktop: Sidebar - Full Height */}
        <div className="hidden lg:flex w-80 flex-shrink-0 border-r h-full" style={{ borderColor: '#d1d5db' }}>
          <div className="h-full flex flex-col bg-white w-full">
            {/* Space Info Header */}
            <div className="p-3 md:p-4 border-b flex-shrink-0" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }}>
              <SpaceInfoCard space={space} />
            </div>

            {/* Content Tabs */}
            <div className="px-3 py-2 border-b flex-shrink-0" style={{ borderColor: '#d1d5db' }}>
              <SpaceTabNavigation 
                tabs={contentTabs}
                activeTab={showSubscribeForm ? "" : (activeTab === "subscribe" ? "merch" : activeTab)}
                onTabChange={(tabId) => {
                  setShowSubscribeForm(false);
                  setActiveTab(tabId as "merch" | "video" | "essay");
                }}
              />
            </div>

            {/* Content List */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden p-2 md:p-3 bg-white">
              {!currentAccount ? (
                /* Guest View */
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">👀</div>
                    <p className="text-sm text-gray-700 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                      Join Atrium to subscribe and unlock content
                    </p>
                    <RetroButton
                      onClick={handleJoinAtrium}
                      variant="primary"
                      size="md"
                    >
                      Join Atrium
                    </RetroButton>
                  </div>
                </div>
              ) : showSubscribeForm ? (
                /* Subscribe Form View */
                <div className="space-y-3">
                  <RetroButton
                    onClick={() => setShowSubscribeForm(false)}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    ← Back to Content
                  </RetroButton>
                  <SubscribeButton
                    spaceKioskId={space.kioskId}
                    price={space.subscriptionPrice}
                    onSubscribed={() => {
                      setIsSubscribed(true);
                      setShowSubscribeForm(false);
                    }}
                  />
                </div>
              ) : (
                /* Content List View */
                <div className="space-y-3">
                  {/* Subscribe Button for Desktop */}
                  {!isSubscribed && !isCreator && (
                    <RetroButton
                      onClick={() => setShowSubscribeForm(true)}
                      variant="primary"
                      size="sm"
                      className="w-full"
                    >
                      🔒 Subscribe to Unlock Premium Content
                    </RetroButton>
                  )}
                  
                  <ContentList
                    items={contentItems}
                    type={activeTab === "subscribe" ? "merch" : (activeTab as "merch" | "video" | "essay")}
                    isSubscribed={isSubscribed}
                    isCreator={isCreator}
                    onUnlock={handleUnlockContent}
                    onView={handleViewContent}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3D Scene Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Bar - Compact on Mobile */}
          <div className="px-2 py-1.5 lg:px-3 lg:py-2 border-b flex-shrink-0" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <RetroButton
                  onClick={() => router.push("/")}
                  variant="secondary"
                  size="sm"
                  className="flex-shrink-0"
                >
                  ←
                </RetroButton>
                <div className="min-w-0">
                  <h1 className="text-sm lg:text-base font-bold text-gray-800 truncate" style={{ fontFamily: 'Georgia, serif' }}>
                    {space.name}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <ThemeToggle currentTheme={theme} onThemeChange={setTheme} />
                
                {/* Divider */}
                <div className="h-6 w-px bg-gray-300" />
                
                <RetroButton
                  onClick={handleShare}
                  variant="secondary"
                  size="sm"
                  title="Share this space"
                >
                  📤
                </RetroButton>
                {isCreator && (
                  <RetroButton
                    onClick={handleEditSpace}
                    variant="primary"
                    size="sm"
                    className="hidden lg:inline-flex"
                  >
                    Edit
                  </RetroButton>
                )}
              </div>
            </div>
          </div>
          
          {/* 3D Canvas */}
          <div className="flex-1 relative" style={{ backgroundColor: '#e8f4f8' }}>
            <ThreeScene
              kioskId={space.kioskId}
              enableGallery={true}
              theme={theme}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

