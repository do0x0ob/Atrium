/**
 * Meshy AI API Configuration
 * Documentation: https://docs.meshy.ai
 */

export const MESHY_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_MESHY_API_KEY || '',
  apiBaseUrl: 'https://api.meshy.ai',
  apiVersion: 'v2',
  
  // Image to 3D endpoint
  imageTo3DEndpoint: '/v2/image-to-3d',
  
  // Task polling
  pollingInterval: 3000, // 3 seconds
  maxPollingAttempts: 60, // 3 minutes max
  
  // Model settings
  defaultSettings: {
    art_style: 'realistic',
    enable_pbr: true, // Physically Based Rendering
    topology: 'quad', // quad or tri
    target_polycount: 30000,
  },
  
  // Export formats
  supportedFormats: ['glb', 'fbx', 'obj', 'usdz'] as const,
  defaultFormat: 'glb',
} as const;

export type MeshyConfig = typeof MESHY_CONFIG;
export type MeshyFormat = typeof MESHY_CONFIG.supportedFormats[number];

/**
 * Meshy API Task Status
 */
export enum MeshyTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

/**
 * Meshy API Response Types
 */
export interface MeshyImageTo3DRequest {
  image_url?: string;
  enable_pbr?: boolean;
  art_style?: 'realistic' | 'cartoon' | 'low-poly' | 'sculpture';
  negative_prompt?: string;
}

export interface MeshyTask {
  id: string;
  status: MeshyTaskStatus;
  progress: number;
  thumbnail_url?: string;
  model_urls?: {
    glb?: string;
    fbx?: string;
    obj?: string;
    usdz?: string;
  };
  error?: string;
  created_at: number;
  finished_at?: number;
}

export interface MeshyApiError {
  error: string;
  message: string;
  status_code: number;
}

