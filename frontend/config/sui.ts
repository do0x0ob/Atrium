/**
 * Sui blockchain configuration
 * Unified management of Sui network and transaction settings
 */

export const SUI_CONFIG = {
  NETWORK: 'testnet' as const,
  CHAIN: 'sui:testnet' as const,
  CLOCK_ID: '0x6',
  MIST_PER_SUI: 1_000_000_000,
} as const;

export const SUI_NETWORK = SUI_CONFIG.NETWORK;
export const SUI_CHAIN = SUI_CONFIG.CHAIN;
export const SUI_CLOCK = SUI_CONFIG.CLOCK_ID;
export const MIST_PER_SUI = SUI_CONFIG.MIST_PER_SUI;

// Contract addresses - Testnet deployment (Dual auth: Creator + Subscriber - 2024-11-22)
export const PACKAGE_ID = '0x44e4b638ccb516b5bfb0e08e151bc59b07bd9a82a5d33fa5f99e324debded8c8';
export const IDENTITY_REGISTRY_ID = '0x5b35ba97a16cc1a6f1fe865c67fd280704dcf46908cc6d01a3ebd4ed40cf219b';
export const SPACE_REGISTRY_ID = '0x12bb23c97b999c58b5c7e2acf6ebf266303148ef13804736daaed110a8bb544e';
export const FAN_REGISTRY_ID = '0xbd50b87c35b6a85d0cc3e16bd3fb81ffd639afd5f316f993b1300bb79660aecd';
export const SUBSCRIPTION_REGISTRY_ID = '0x9581f4c52e699b7bd3c1d8a1c672ff6702561d15c9651c5ace623981a96fb42c';

