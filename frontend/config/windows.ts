import { WindowType, WindowConfig } from '@/components/features/window-manager/types';

export const defaultWindowConfigs: Record<WindowType, WindowConfig> = {
  'video-player': {
    title: 'Video Player',
    defaultSize: { width: 800, height: 500 },
    resizable: true,
  },
  'essay-reader': {
    title: 'Essay',
    defaultSize: { width: 600, height: 700 },
    resizable: true,
  },
  'merch-detail': {
    title: 'Item Details',
    defaultSize: { width: 400, height: 500 },
    resizable: false,
  },
};

