/**
 * useContentManagement - Content Data Management Hook
 * Handles loading, caching, and managing content for spaces
 */

import { useState, useEffect, useCallback } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { 
  getContentBySpace, 
  getAllContent, 
  StoredContent, 
  saveContent,
  saveMultipleContents,
  deleteContent as deleteContentFromStorage
} from '@/utils/contentStorage';
import { ContentIndexer } from '@/services/contentIndexer';

interface UseContentManagementOptions {
  spaceId: string;
}

interface UseContentManagementReturn {
  contents: StoredContent[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  handleUpload: (content: StoredContent) => void;
  handleDelete: (id: string) => void;
}

export function useContentManagement({ 
  spaceId 
}: UseContentManagementOptions): UseContentManagementReturn {
  const suiClient = useSuiClient();
  const [contents, setContents] = useState<StoredContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadContents = useCallback(async () => {
    if (!spaceId) return;

    try {
      setLoading(true);
      setError(null);

      // Step 1: Load from localStorage (fast display)
      const cached = getContentBySpace(spaceId);
      if (cached.length > 0) {
        setContents(cached);
      }

      // Step 2: Query from blockchain (authoritative source)
      const indexer = new ContentIndexer(suiClient);
      const chainContents = await indexer.querySpaceContents(spaceId);

      // Update state
      setContents(chainContents);

      // Step 3: Sync to localStorage
      const allContents = getAllContent();
      const otherSpaceContents = allContents.filter(c => c.spaceId !== spaceId);
      const newAllContents = [...otherSpaceContents, ...chainContents];
      saveMultipleContents(newAllContents);
    } catch (err) {
      console.error('[useContentManagement] Failed to load contents:', err);
      setError(err instanceof Error ? err : new Error('Failed to load contents'));
    } finally {
      setLoading(false);
    }
  }, [spaceId, suiClient]);

  useEffect(() => {
    loadContents();

    // Listen for content updates
    const handleContentUpdate = (event: CustomEvent) => {
      const { spaceId: updatedSpaceId } = event.detail || {};
      if (updatedSpaceId === spaceId) {
        loadContents();
      }
    };

    window.addEventListener('atrium-content-updated', handleContentUpdate as EventListener);

    return () => {
      window.removeEventListener('atrium-content-updated', handleContentUpdate as EventListener);
    };
  }, [loadContents, spaceId]);

  const handleUpload = useCallback((content: StoredContent) => {
    setContents(prev => [...prev, content]);
    saveContent(content);
  }, []);

  const handleDelete = useCallback((id: string) => {
    // TODO: Implement on-chain content deletion
    alert('Delete functionality is not yet implemented.');
    
    // Temporary localStorage-only deletion (commented out for safety)
    // deleteContentFromStorage(id);
    // setContents(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    contents,
    loading,
    error,
    refetch: loadContents,
    handleUpload,
    handleDelete,
  };
}

