/**
 * Seal Content Encryption Service
 * Handles encryption and decryption of content (video, text/markdown) for subscription-based access
 */

import { SealClient, DemType, SessionKey } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { fromHex } from '@mysten/sui/utils';
import { SEAL_CONFIG, getSealKeyServers } from '@/config/seal';
import { sealApproveBySubscription } from '@/utils/transactions';

type SuiJsonRpcClient = any;

export interface ContentEncryptionResult {
  encryptedBlob: Blob;
  resourceId: string;
  metadata: {
    encrypted: boolean;
    originalSize: number;
    encryptedSize: number;
    encryptionDate: string;
    contentType: string; // 'video/mp4', 'text/markdown', etc.
  };
}

export interface ContentEncryptionOptions {
  spaceKioskId: string;
  title?: string;
  contentType?: string; // MIME type
}

let sealClientInstance: SealClient | null = null;

function getSealClient(network: 'testnet' | 'mainnet' = 'testnet'): SealClient {
  if (!sealClientInstance) {
    const keyServers = getSealKeyServers(network);
    const serverConfigs = keyServers.map(server => ({
      objectId: server.objectId,
      weight: server.weight,
    }));

    console.log('🔐 Initializing Seal Client for content encryption');

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
 * Encrypt content file using Seal SDK with SessionKey
 * This allows subscription-based access control
 */
export async function encryptContent(
  file: File | Blob,
  options: ContentEncryptionOptions,
  userAddress: string,
  signPersonalMessage: (message: Uint8Array) => Promise<{ signature: string }>,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<ContentEncryptionResult> {
  try {
    console.log('🔐 Encrypting content with Seal...', {
      fileSize: file.size,
      spaceKioskId: options.spaceKioskId,
      contentType: options.contentType || file.type
    });

    const contentType = options.contentType || file.type;

    // Check if Seal is enabled
    if (!SEAL_CONFIG.enabled) {
      console.warn('⚠️ Seal is disabled, returning unencrypted');
      const blob = new Blob([await file.arrayBuffer()], { type: contentType });
      return {
        encryptedBlob: blob,
        resourceId: `unencrypted_${Date.now()}`,
        metadata: {
          encrypted: false,
          originalSize: file.size,
          encryptedSize: blob.size,
          encryptionDate: new Date().toISOString(),
          contentType,
        },
      };
    }

    // Convert file to Uint8Array
    const fileBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(fileBuffer);

    // Prepare metadata
    const metadata = {
      fileType: contentType,
      title: options.title || 'Untitled',
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

    // Get SealClient and encrypt
    const sealClient = getSealClient(network);
    
    // Use AES-GCM for better performance on larger files
    const { encryptedObject } = await sealClient.encrypt({
      demType: DemType.AesGcm256,
      threshold: 1,
      packageId: PACKAGE_ID,
      id: resourceId,
      data: fileData,
      aad: new TextEncoder().encode(JSON.stringify(metadata)),
    });

    const encryptedBlob = new Blob([encryptedObject], { type: 'application/octet-stream' });

    console.log('✅ Content encryption completed', {
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
        contentType,
      },
    };
  } catch (error) {
    console.error('❌ Content encryption failed:', error);
    
    // Fallback to unencrypted
    const blob = new Blob([await file.arrayBuffer()], { type: options.contentType || file.type });
    return {
      encryptedBlob: blob,
      resourceId: `fallback_${Date.now()}`,
      metadata: {
        encrypted: false,
        originalSize: file.size,
        encryptedSize: blob.size,
        encryptionDate: new Date().toISOString(),
        contentType: options.contentType || file.type,
      },
    };
  }
}

/**
 * Decrypt content using Seal SDK with SessionKey
 * Requires valid subscription
 */
export async function decryptContent(
  encryptedData: Uint8Array,
  resourceId: string,
  userAddress: string,
  signPersonalMessage: (message: Uint8Array) => Promise<{ signature: string }>,
  network: 'testnet' | 'mainnet' = 'testnet',
  expectedContentType: string = 'application/octet-stream'
): Promise<Blob> {
  try {
    console.log('🔓 Decrypting content with Seal...', {
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

    const blob = new Blob([new Uint8Array(decryptedData)], { type: expectedContentType });

    console.log('✅ Content decryption completed', {
      decryptedSize: blob.size,
      type: expectedContentType
    });

    return blob;
  } catch (error) {
    console.error('❌ Content decryption failed:', error);
    throw new Error('Failed to decrypt content. Please ensure you have an active subscription.');
  }
}

/**
 * Download and decrypt content from Walrus
 */
export async function downloadAndDecryptContent(
  blobId: string,
  resourceId: string,
  userAddress: string,
  signPersonalMessage: (message: Uint8Array) => Promise<{ signature: string }>,
  contentType: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<string> {
  try {
    // Download encrypted content from Walrus
    // Using aggregator URL
    const aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || "https://aggregator.walrus-testnet.walrus.space";
    const response = await fetch(
      `${aggregatorUrl}/v1/blobs/${blobId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to download content from Walrus');
    }

    const encryptedData = new Uint8Array(await response.arrayBuffer());

    // Decrypt content
    const decryptedBlob = await decryptContent(
      encryptedData,
      resourceId,
      userAddress,
      signPersonalMessage,
      network,
      contentType
    );

    // Create object URL for playback/display
    if (contentType === 'text/markdown' || contentType === 'text/plain') {
       return await decryptedBlob.text();
    }
    
    const url = URL.createObjectURL(decryptedBlob);
    return url;
  } catch (error) {
    console.error('Error downloading and decrypting content:', error);
    throw error;
  }
}

