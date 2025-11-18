/**
 * Seal Video Encryption Service
 * Handles encryption and decryption of video files for subscription-based access
 */

import { SealClient, DemType, SessionKey } from '@mysten/seal';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { fromHex, fromHEX } from '@mysten/sui/utils';
import { SEAL_CONFIG, getSealKeyServers } from '@/config/seal';
import { sealApproveBySubscription } from '@/utils/transactions';

type SuiJsonRpcClient = any;

export interface VideoEncryptionResult {
  encryptedBlob: Blob;
  resourceId: string;
  metadata: {
    encrypted: boolean;
    originalSize: number;
    encryptedSize: number;
    encryptionDate: string;
  };
}

export interface VideoEncryptionOptions {
  spaceKioskId: string;
  videoTitle?: string;
}

let sealClientInstance: SealClient | null = null;

function getSealClient(network: 'testnet' | 'mainnet' = 'testnet'): SealClient {
  if (!sealClientInstance) {
    const keyServers = getSealKeyServers(network);
    const serverConfigs = keyServers.map(server => ({
      objectId: server.objectId,
      weight: server.weight,
    }));

    console.log('🔐 Initializing Seal Client for video encryption');

    const suiClient = new SuiClient({ 
      url: getFullnodeUrl(network) 
    }) as SuiJsonRpcClient;

    sealClientInstance = new SealClient({
      suiClient,
      serverConfigs,
      verifyKeyServers: SEAL_CONFIG.verifyKeyServers,
      timeout: SEAL_CONFIG.timeout,
    });
  }

  return sealClientInstance;
}

/**
 * Encrypt a video file using Seal SDK with SessionKey
 * This allows subscription-based access control
 */
export async function encryptVideo(
  file: File,
  options: VideoEncryptionOptions,
  userAddress: string,
  signPersonalMessage: (message: Uint8Array) => Promise<{ signature: string }>,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<VideoEncryptionResult> {
  try {
    console.log('🔐 Encrypting video with Seal...', {
      fileName: file.name,
      fileSize: file.size,
      spaceKioskId: options.spaceKioskId,
    });

    // Check if Seal is enabled
    if (!SEAL_CONFIG.enabled) {
      console.warn('⚠️ Seal is disabled, returning unencrypted');
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      return {
        encryptedBlob: blob,
        resourceId: `unencrypted_${Date.now()}`,
        metadata: {
          encrypted: false,
          originalSize: file.size,
          encryptedSize: blob.size,
          encryptionDate: new Date().toISOString(),
        },
      };
    }

    // Convert file to Uint8Array
    const fileBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(fileBuffer);

    // Prepare metadata
    const metadata = {
      fileName: file.name,
      fileType: file.type,
      videoTitle: options.videoTitle || file.name,
      timestamp: Date.now(),
      spaceKioskId: options.spaceKioskId,
    };

    // Use Atrium package ID for encryption namespace
    const PACKAGE_ID = process.env.NEXT_PUBLIC_SPACE_PACKAGE_ID || process.env.NEXT_PUBLIC_PACKAGE_ID || "0x0";
    const resourceId = options.spaceKioskId.replace('0x', '');
    const suiClient = new SuiClient({ url: getFullnodeUrl(network) });

    // Create SessionKey for encryption
    const sessionKey = await SessionKey.create({
      address: userAddress,
      packageId: PACKAGE_ID.toString(),
      ttlMin: 10,
      suiClient,
    });

    // Get personal message and request signature
    const message = sessionKey.getPersonalMessage();
    const { signature } = await signPersonalMessage(message);
    sessionKey.setPersonalMessageSignature(signature);

    console.log('🔐 Encrypting with Seal SDK...', {
      dataSize: fileData.length,
      packageId: PACKAGE_ID,
      resourceId,
      userAddress,
    });

    // Get SealClient and encrypt
    // For large video files, Seal recommends using AES-GCM for best performance
    const sealClient = getSealClient(network);
    const { encryptedObject } = await sealClient.encrypt({
      demType: DemType.AesGcm256,
      threshold: 1,
      packageId: PACKAGE_ID,
      id: resourceId,
      data: fileData,
      aad: new TextEncoder().encode(JSON.stringify(metadata)),
    });

    const encryptedBlob = new Blob([encryptedObject], { type: 'application/octet-stream' });

    console.log('✅ Video encryption completed', {
      resourceId,
      originalSize: file.size,
      encryptedSize: encryptedBlob.size,
    });

    return {
      encryptedBlob,
      resourceId,
      metadata: {
        encrypted: true,
        originalSize: file.size,
        encryptedSize: encryptedBlob.size,
        encryptionDate: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('❌ Video encryption failed:', error);
    
    // Fallback to unencrypted
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    return {
      encryptedBlob: blob,
      resourceId: `fallback_${Date.now()}`,
      metadata: {
        encrypted: false,
        originalSize: file.size,
        encryptedSize: blob.size,
        encryptionDate: new Date().toISOString(),
      },
    };
  }
}

/**
 * Decrypt a video file using Seal SDK with SessionKey
 * Requires valid subscription
 */
export async function decryptVideo(
  encryptedData: Uint8Array,
  resourceId: string,
  userAddress: string,
  signPersonalMessage: (message: Uint8Array) => Promise<{ signature: string }>,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<Blob> {
  try {
    console.log('🔓 Decrypting video with Seal...', {
      dataSize: encryptedData.length,
      resourceId,
      userAddress,
    });

    const PACKAGE_ID = process.env.NEXT_PUBLIC_SPACE_PACKAGE_ID || process.env.NEXT_PUBLIC_PACKAGE_ID || "0x0";
    const suiClient = new SuiClient({ url: getFullnodeUrl(network) });

    // Create SessionKey for decryption
    const sessionKey = await SessionKey.create({
      address: userAddress,
      packageId: PACKAGE_ID,
      ttlMin: 10,
      suiClient,
    });

    // Get personal message and request signature
    const message = sessionKey.getPersonalMessage();
    const { signature } = await signPersonalMessage(message);
    sessionKey.setPersonalMessageSignature(signature);

    // Build transaction to verify subscription access using unified transaction builder
    const spaceKioskId = resourceId.startsWith('0x') ? resourceId : `0x${resourceId}`;
    const tx = sealApproveBySubscription(fromHex(resourceId), spaceKioskId);

    // Build transaction bytes
    const txBytes = await tx.build({ client: suiClient });

    // Get SealClient and decrypt
    const sealClient = getSealClient(network);
    const decryptedData = await sealClient.decrypt({
      data: encryptedData,
      txBytes,
      sessionKey,
    });

    const videoBlob = new Blob([new Uint8Array(decryptedData)], { type: 'video/mp4' });

    console.log('✅ Video decryption completed', {
      decryptedSize: videoBlob.size,
    });

    return videoBlob;
  } catch (error) {
    console.error('❌ Video decryption failed:', error);
    throw new Error('Failed to decrypt video. Please ensure you have an active subscription.');
  }
}

/**
 * Download and decrypt video from Walrus
 */
export async function downloadAndDecryptVideo(
  blobId: string,
  resourceId: string,
  userAddress: string,
  signPersonalMessage: (message: Uint8Array) => Promise<{ signature: string }>,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<string> {
  try {
    // Download encrypted video from Walrus
    const response = await fetch(
      `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to download video from Walrus');
    }

    const encryptedData = new Uint8Array(await response.arrayBuffer());

    // Decrypt video
    const decryptedBlob = await decryptVideo(
      encryptedData,
      resourceId,
      userAddress,
      signPersonalMessage,
      network
    );

    // Create object URL for video playback
    const videoUrl = URL.createObjectURL(decryptedBlob);
    return videoUrl;
  } catch (error) {
    console.error('Error downloading and decrypting video:', error);
    throw error;
  }
}

