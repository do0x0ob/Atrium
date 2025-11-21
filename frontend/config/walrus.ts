/**
 * Walrus 統一配置
 * Centralized Walrus configuration
 */

// Get Walrus aggregator URL from environment or use default
const getAggregatorUrl = () => {
  return process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || 
    'https://aggregator.walrus-testnet.walrus.space';
};

export const WALRUS_CONFIG = {
  // Walrus Aggregator base URL
  aggregatorUrl: getAggregatorUrl(),
  
  // Get complete blob URL
  getBlobUrl: (blobId: string) => `${getAggregatorUrl()}/v1/blobs/${blobId}`,
  
  // Epochs for upload retention period
  defaultEpochs: 1,
} as const;

// Export utility functions
export const getWalrusBlobUrl = WALRUS_CONFIG.getBlobUrl;
export const getWalrusAggregatorUrl = getAggregatorUrl;
