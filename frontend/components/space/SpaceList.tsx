"use client";

import { useState, useEffect } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { SpaceCard } from "./SpaceCard";
import { SpaceCategoryFilter, SpaceCategory } from "./SpaceCategoryFilter";
import { RetroPanel } from "@/components/common/RetroPanel";
import { RetroHeading } from "@/components/common/RetroHeading";
import { RetroEmptyState } from "@/components/common/RetroEmptyState";

interface Space {
  kioskId: string;
  name: string;
  description: string;
  coverImage: string;
  subscriptionPrice: string;
  creator: string;
  category: SpaceCategory;
}

export function SpaceList() {
  const suiClient = useSuiClient();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SpaceCategory>("all");

  useEffect(() => {
    loadSpaces();
  }, []);


  const loadSpaces = async () => {
    try {
      setLoading(true);
      
      // TODO: Load spaces from registry
      // For now, use mock data
      const mockSpaces: Space[] = [
        {
          kioskId: "0x123",
          name: "Art Gallery",
          description: "Sharing my digital art creations",
          coverImage: "",
          subscriptionPrice: "1000000000", // 1 SUI
          creator: "0xabc",
          category: "art",
        },
        {
          kioskId: "0x456",
          name: "Music Studio",
          description: "Original compositions and performances",
          coverImage: "",
          subscriptionPrice: "2000000000", // 2 SUI
          creator: "0xdef",
          category: "music",
        },
        {
          kioskId: "0x789",
          name: "Tech Workshop",
          description: "Tutorials and technical content",
          coverImage: "",
          subscriptionPrice: "1500000000", // 1.5 SUI
          creator: "0xghi",
          category: "tech",
        },
        {
          kioskId: "0xaaa",
          name: "Photography Studio",
          description: "Professional photography and editing",
          coverImage: "",
          subscriptionPrice: "1200000000",
          creator: "0xjkl",
          category: "art",
        },
        {
          kioskId: "0xbbb",
          name: "Writing Corner",
          description: "Stories, poems, and creative writing",
          coverImage: "",
          subscriptionPrice: "800000000",
          creator: "0xmno",
          category: "portfolio",
        },
        {
          kioskId: "0xccc",
          name: "Design Lab",
          description: "UI/UX designs and graphic art",
          coverImage: "",
          subscriptionPrice: "1800000000",
          creator: "0xpqr",
          category: "art",
        },
        {
          kioskId: "0xddd",
          name: "Cooking Channel",
          description: "Recipes and culinary adventures",
          coverImage: "",
          subscriptionPrice: "900000000",
          creator: "0xstu",
          category: "other",
        },
        {
          kioskId: "0xeee",
          name: "Fitness Hub",
          description: "Workout routines and health tips",
          coverImage: "",
          subscriptionPrice: "1100000000",
          creator: "0xvwx",
          category: "social",
        },
      ];

      setSpaces(mockSpaces);
    } catch (error) {
      console.error("Failed to load spaces:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RetroPanel className="h-full flex flex-col">
      {/* Header */}
        <RetroHeading 
          title="Explore Spaces"
          subtitle="Discover creators' 3D worlds"
        className="mb-0"
        />

      {/* Filters */}
      <SpaceCategoryFilter
        selectedCategory={filter}
        onCategoryChange={setFilter}
        spaces={spaces}
      />

      {/* Space Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden px-3 md:px-6 pt-2 md:pt-4 pb-3 md:pb-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <RetroPanel 
                key={i}
                variant="inset"
                className="h-64 animate-pulse"
              >
                <div />
              </RetroPanel>
            ))}
          </div>
        ) : (() => {
          // Filter spaces based on selected category
          const filteredSpaces = filter === "all" 
            ? spaces 
            : spaces.filter(space => space.category === filter);

          return filteredSpaces.length === 0 ? (
          <RetroEmptyState
            icon="🏛️"
            title="No Spaces Found"
              message={filter === "all" 
                ? "Be the first creator to build a space!" 
                : `No spaces found in ${filter.charAt(0).toUpperCase() + filter.slice(1)} category.`}
          />
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {filteredSpaces.map((space) => (
              <SpaceCard key={space.kioskId} space={space} />
            ))}
          </div>
          );
        })()}
      </div>
    </RetroPanel>
  );
}

