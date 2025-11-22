"use client";

import { ContentItem, ContentItemData } from "./ContentItem";
import { StateContainer } from "@/components/common/StateContainer";

interface ContentListProps {
  items: ContentItemData[];
  type: "merch" | "video" | "essay";
  isSubscribed: boolean;
  isCreator: boolean;
  onUnlock?: (itemId: string) => void;
  onView?: (itemId: string) => void;
}

export function ContentList({ items, type, isSubscribed, isCreator, onUnlock, onView }: ContentListProps) {
  const filteredItems = items.filter(item => item.type === type);

  const getEmptyStateInfo = () => {
    switch (type) {
      case "merch":
        return {
          icon: "🛍️",
          title: "No Merchandise Available",
          message: "This creator hasn't added any merchandise yet."
        };
      case "video":
        return {
          icon: "🎥",
          title: "No Videos Available", 
          message: "This creator hasn't uploaded any videos yet."
        };
      case "essay":
        return {
          icon: "📝",
          title: "No Essays Available",
          message: "This creator hasn't published any essays yet."
        };
      default:
        return {
          icon: "📄",
          title: "No Content Available",
          message: "No content found for this section."
        };
    }
  };

  const emptyState = getEmptyStateInfo();

  return (
    <StateContainer 
      loading={false}
      error={null}
      empty={filteredItems.length === 0}
    >
      <StateContainer.Empty
        icon={emptyState.icon}
        title={emptyState.title}
        message={emptyState.message}
      />

      <StateContainer.Content>
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <ContentItem
              key={item.id}
              item={item}
              isSubscribed={isSubscribed}
              isCreator={isCreator}
              onUnlock={onUnlock}
              onView={onView}
            />
          ))}
        </div>
      </StateContainer.Content>
    </StateContainer>
  );
}
