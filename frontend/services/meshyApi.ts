/**
 * Meshy AI API Service
 * Handles 2D image to 3D model generation
 */

import {
  MESHY_CONFIG,
  MeshyTask,
  MeshyTaskStatus,
  MeshyImageTo3DRequest,
  MeshyApiError,
} from '@/config/meshy';

/**
 * Upload image and start 3D generation task
 */
export async function generateGLBFromImage(
  imageFile: File,
  options?: Partial<MeshyImageTo3DRequest>
): Promise<string> {
  try {
    // Step 1: Upload image to temporary storage (or convert to base64)
    const imageUrl = await uploadImageToTemporary(imageFile);

    // Step 2: Create 3D generation task
    const taskId = await createImageTo3DTask(imageUrl, options);

    // Step 3: Poll for completion
    const task = await pollTaskCompletion(taskId);

    // Step 4: Return GLB URL
    if (!task.model_urls?.glb) {
      throw new Error('GLB model URL not found in task result');
    }

    return task.model_urls.glb;
  } catch (error) {
    console.error('Error generating GLB from image:', error);
    throw error;
  }
}

/**
 * Upload image to temporary storage (or use Walrus)
 */
async function uploadImageToTemporary(imageFile: File): Promise<string> {
  // For now, convert to data URL
  // In production, you might want to upload to Walrus first
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Create image-to-3D generation task
 */
async function createImageTo3DTask(
  imageUrl: string,
  options?: Partial<MeshyImageTo3DRequest>
): Promise<string> {
  const requestBody: MeshyImageTo3DRequest = {
    image_url: imageUrl,
    enable_pbr: options?.enable_pbr ?? MESHY_CONFIG.defaultSettings.enable_pbr,
    art_style: options?.art_style ?? MESHY_CONFIG.defaultSettings.art_style,
    negative_prompt: options?.negative_prompt,
  };

  const response = await fetch(
    `${MESHY_CONFIG.apiBaseUrl}${MESHY_CONFIG.imageTo3DEndpoint}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MESHY_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const error: MeshyApiError = await response.json();
    throw new Error(`Meshy API Error: ${error.message}`);
  }

  const data = await response.json();
  return data.result; // Task ID
}

/**
 * Get task status
 */
async function getTaskStatus(taskId: string): Promise<MeshyTask> {
  const response = await fetch(
    `${MESHY_CONFIG.apiBaseUrl}${MESHY_CONFIG.imageTo3DEndpoint}/${taskId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MESHY_CONFIG.apiKey}`,
      },
    }
  );

  if (!response.ok) {
    const error: MeshyApiError = await response.json();
    throw new Error(`Meshy API Error: ${error.message}`);
  }

  return await response.json();
}

/**
 * Poll task until completion
 */
async function pollTaskCompletion(taskId: string): Promise<MeshyTask> {
  let attempts = 0;

  while (attempts < MESHY_CONFIG.maxPollingAttempts) {
    const task = await getTaskStatus(taskId);

    if (task.status === MeshyTaskStatus.SUCCEEDED) {
      return task;
    }

    if (task.status === MeshyTaskStatus.FAILED) {
      throw new Error(`Task failed: ${task.error || 'Unknown error'}`);
    }

    if (task.status === MeshyTaskStatus.EXPIRED) {
      throw new Error('Task expired');
    }

    // Wait before next poll
    await new Promise(resolve => 
      setTimeout(resolve, MESHY_CONFIG.pollingInterval)
    );
    attempts++;
  }

  throw new Error('Task polling timeout');
}

/**
 * Download GLB file as Blob
 */
export async function downloadGLB(glbUrl: string): Promise<Blob> {
  const response = await fetch(glbUrl);
  if (!response.ok) {
    throw new Error('Failed to download GLB file');
  }
  return await response.blob();
}

