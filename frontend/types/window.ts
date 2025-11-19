/**
 * 視窗管理系統類型定義
 */

import { ReactNode } from 'react';

/**
 * 視窗類型
 */
export type WindowType = 
  | 'video'         // 影片播放視窗
  | 'essay'         // 文章閱讀視窗
  | 'nft-detail'    // NFT 詳情視窗
  | 'settings'      // 設置視窗
  | 'purchase'      // 購買視窗
  ;

/**
 * 視窗位置
 */
export interface WindowPosition {
  x: number;
  y: number;
}

/**
 * 視窗尺寸
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * 視窗狀態
 */
export interface WindowState {
  id: string;           // 視窗唯一 ID
  type: WindowType;     // 視窗類型
  title: string;        // 視窗標題
  isOpen: boolean;      // 是否打開
  isMinimized: boolean; // 是否最小化
  zIndex: number;       // Z 軸索引
  position: WindowPosition; // 位置
  size: WindowSize;     // 尺寸
  data?: any;           // 視窗特定數據 (如影片 URL、文章內容等)
}

/**
 * 視窗組件 Props
 */
export interface WindowProps {
  id: string;
  type: WindowType;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isActive?: boolean;
  isMinimized?: boolean;
  resizable?: boolean;
  children: ReactNode;
  onClose: (id: string) => void;
  onMinimize?: (id: string) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  onResize?: (e: React.MouseEvent, id: string) => void;
  onClick?: () => void;
  className?: string;
}

/**
 * 視窗管理器狀態
 */
export interface WindowManagerState {
  windows: Map<string, WindowState>;
  activeWindowId: string | null;
  draggingWindowId: string | null;
  maxZIndex: number;
}

/**
 * 視窗配置
 */
export interface WindowConfig {
  type: WindowType;
  title: string;
  defaultSize: WindowSize;
  defaultPosition?: WindowPosition;
  resizable?: boolean;
  data?: any;
}

/**
 * 影片視窗數據
 */
export interface VideoWindowData {
  videoUrl: string;
  blobId?: string;
  thumbnail?: string;
  duration?: number;
  encrypted?: boolean;
  requiresSubscription?: boolean;
}

/**
 * 文章視窗數據
 */
export interface EssayWindowData {
  content: string;
  markdown?: boolean;
  author?: string;
  createdAt?: number;
  encrypted?: boolean;
  requiresSubscription?: boolean;
}

/**
 * NFT 詳情視窗數據
 */
export interface NFTDetailWindowData {
  nftId: string;
  name: string;
  description: string;
  imageUrl: string;
  price?: number;
  owner?: string;
  attributes?: Record<string, any>;
}

