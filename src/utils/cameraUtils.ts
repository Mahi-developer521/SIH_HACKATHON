/**
 * Multi-tier resilient camera stream utility for desktop, laptop, mobile, and tablet browsers.
 * Seamlessly handles permission negotiations, resolution fallbacks, and mobile/desktop facingMode differences.
 */
export async function getCameraStream(
  requestedFacingMode: 'environment' | 'user' = 'environment'
): Promise<MediaStream> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera access API is not supported by your browser or environment.');
  }

  // Tier 1: Try with preferred facingMode and ideal HD resolution
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: requestedFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
  } catch (err1) {
    console.warn(`[Camera] Tier 1 (${requestedFacingMode} + 720p) failed:`, err1);
  }

  // Tier 2: Try with preferred facingMode without dimension constraints
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: requestedFacingMode },
      audio: false
    });
  } catch (err2) {
    console.warn(`[Camera] Tier 2 (${requestedFacingMode}) failed:`, err2);
  }

  // Tier 3: Try opposite facingMode (e.g. user instead of environment on desktop)
  try {
    const fallbackFacing = requestedFacingMode === 'environment' ? 'user' : 'environment';
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: fallbackFacing },
      audio: false
    });
  } catch (err3) {
    console.warn('[Camera] Tier 3 opposite facingMode failed:', err3);
  }

  // Tier 4: Generic video: true (works with any webcam, integrated laptop cam, or virtual camera device)
  return await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  });
}

/**
 * Safely captures a high-resolution JPEG data URL snapshot from a video element.
 */
export function captureVideoFrame(video: HTMLVideoElement, quality = 0.9): string | null {
  try {
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  } catch (err) {
    console.error('[Camera] Failed to capture video frame:', err);
    return null;
  }
}
