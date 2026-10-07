/**
 * Image processing utilities for ReceiptGuard AI:
 * 1. Downscales full images on an offscreen canvas (max dimension 1600px)
 * 2. Generates ~200px JPEG thumbnails for lightweight localStorage storage
 * 3. Computes 64-bit Average Perceptual Hash (aHash) for visual duplicate matching
 * 4. Computes Hamming distance between two perceptual hashes
 */

/**
 * Resizes an image file or data URL to fit within maxDimension while maintaining aspect ratio.
 * @param {File|string} source - File object or image URL/base64
 * @param {number} maxDimension - Max width or height (default 1600)
 * @param {string} mimeType - Target MIME type (default image/jpeg)
 * @param {number} quality - Quality between 0 and 1 (default 0.85)
 * @returns {Promise<{ dataUrl: string, base64Data: string, mimeType: string, width: number, height: number }>}
 */
export async function resizeImage(source, maxDimension = 1600, mimeType = 'image/jpeg', quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.naturalWidth || img.width || 800;
      let height = img.naturalHeight || img.height || 1000;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get 2D canvas context'));
        return;
      }

      // Fill white background (useful for transparent PNG receipts)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL(mimeType, quality);
      const base64Data = dataUrl.split(',')[1] || '';

      resolve({
        dataUrl,
        base64Data,
        mimeType,
        width,
        height,
      });
    };

    img.onerror = (err) => reject(new Error('Failed to load image for resizing: ' + err));

    if (source instanceof File || source instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    } else if (typeof source === 'string') {
      img.src = source;
    } else {
      reject(new Error('Invalid image source type'));
    }
  });
}

/**
 * Creates a compact ~200px JPEG thumbnail data URL for fast rendering without exhausting localStorage.
 * @param {File|string} source
 * @returns {Promise<string>} dataUrl of thumbnail
 */
export async function createThumbnail(source) {
  const result = await resizeImage(source, 220, 'image/jpeg', 0.7);
  return result.dataUrl;
}

/**
 * Computes an 8x8 (64-bit) Average Perceptual Hash (aHash) of an image.
 * 1. Scales to 8x8 grayscale
 * 2. Computes mean pixel luminance
 * 3. Each bit is 1 if pixel >= mean, 0 otherwise
 * @param {File|string} source
 * @returns {Promise<string>} 64-character binary string (e.g. "1011001...")
 */
export async function computePerceptualHash(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 8;
      canvas.height = 8;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context unavailable for hashing'));
        return;
      }

      ctx.drawImage(img, 0, 0, 8, 8);
      const imgData = ctx.getImageData(0, 0, 8, 8);
      const pixels = imgData.data;

      // Calculate grayscale values (luminance: 0.299R + 0.587G + 0.114B)
      const grays = new Float32Array(64);
      let sum = 0;

      for (let i = 0; i < 64; i++) {
        const offset = i * 4;
        const gray = 0.299 * pixels[offset] + 0.587 * pixels[offset + 1] + 0.114 * pixels[offset + 2];
        grays[i] = gray;
        sum += gray;
      }

      const mean = sum / 64;
      let hash = '';
      for (let i = 0; i < 64; i++) {
        hash += grays[i] >= mean ? '1' : '0';
      }

      resolve(hash);
    };

    img.onerror = () => reject(new Error('Failed to load image for perceptual hash'));

    if (source instanceof File || source instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    } else if (typeof source === 'string') {
      img.src = source;
    } else {
      reject(new Error('Invalid image source'));
    }
  });
}

/**
 * Computes Hamming distance between two binary hash strings.
 * @param {string} hash1
 * @param {string} hash2
 * @returns {number} Count of differing bits
 */
export function getHammingDistance(hash1, hash2) {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) {
    return 64; // Max difference
  }
  let diff = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) diff++;
  }
  return diff;
}
