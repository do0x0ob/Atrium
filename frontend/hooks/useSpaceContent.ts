import { useMemo } from 'react';
import { useSpaceContents } from './useSpaceContents';
import { ContentItemData } from '@/components/space/content';

/**
 * useSpaceContent - Unified content data transformation and management
 * Handles loading space contents and transforming them to ContentItemData format
 */
export function useSpaceContent(spaceId: string | null) {
  const { contents: spaceContents, loading, error, refetch } = useSpaceContents(spaceId);

  // Transform to ContentItemData format
  const contentItems: ContentItemData[] = useMemo(() => {
    return spaceContents
      .filter(c => c.type !== 'image') // ContentItemData doesn't support 'image' type
      .map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        type: c.type as 'video' | 'essay' | 'merch',
        blobId: c.blobId,
        isLocked: c.encrypted,
        price: c.price,
        sealResourceId: c.sealResourceId,
      }));
  }, [spaceContents]);

  // Get content by type
  const getContentByType = (type: 'video' | 'essay' | 'merch') => {
    return contentItems.filter(item => item.type === type);
  };

  // Get locked vs free content
  const lockedContent = useMemo(() => {
    return contentItems.filter(item => item.isLocked);
  }, [contentItems]);

  const freeContent = useMemo(() => {
    return contentItems.filter(item => !item.isLocked);
  }, [contentItems]);

  return {
    contentItems,
    loading,
    error,
    refetch,
    getContentByType,
    lockedContent,
    freeContent,
    hasContent: contentItems.length > 0,
  };
}

