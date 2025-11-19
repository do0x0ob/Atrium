import { ReactNode } from 'react';

/**
 * All available window types for Atrium
 */
export type WindowType = 
  | 'video-player'
  | 'essay-reader'
  | 'merch-detail'
  ; 

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Window instance data
 * Each window has a unique ID and can carry custom data
 */
export interface WindowInstance {
  id: string;
  type: WindowType;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  resizable?: boolean;
  data?: Record<string, any>; // Custom data for the window content
}

export interface WindowState {
  type: WindowType;
  title: string;
  isOpen: boolean;
  zIndex: number;
  position: WindowPosition;
  size: WindowSize;
}

export interface WindowProps {
  id: string;
  title: string;
  children: ReactNode;
  position: WindowPosition;
  size: WindowSize;
  isActive: boolean;
  resizable?: boolean;
  onClose?: () => void;
  onDragStart?: (e: React.MouseEvent<Element>) => void;
  onResize?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  zIndex?: number;
}

export interface WindowManagerState {
  windows: Record<string, WindowInstance>;
  activeWindowId: string | null;
  draggingWindowId: string | null;
  maxZIndex: number;
}

export interface WindowConfig {
  title: string;
  defaultSize: WindowSize;
  defaultPosition?: WindowPosition;
  resizable?: boolean;
}

// For backward compatibility
export type WindowName = WindowType;

