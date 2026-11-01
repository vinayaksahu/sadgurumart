/**
 * Utility to convert Google Drive shareable URLs into direct, embeddable image URLs
 * that render cleanly in standard <img> tags and browser clients.
 */
export function formatGoogleDriveUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();

  // If already base64 data URL from mobile gallery, return as is
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Pattern 1: /file/d/{FILE_ID}
  const fileIdMatch1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch1 && fileIdMatch1[1]) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch1[1]}`;
  }

  // Pattern 2: ?id={FILE_ID} or &id={FILE_ID}
  const fileIdMatch2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (fileIdMatch2 && fileIdMatch2[1]) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch2[1]}`;
  }

  // Pattern 3: already lh3.googleusercontent.com
  if (trimmed.includes('googleusercontent.com/d/')) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Creates a clean slug from product title
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}

/**
 * Compresses an image file from mobile/desktop gallery or camera using HTML5 Canvas.
 * Downscales dimensions (max 1000px) and compresses as JPEG,
 * converting heavy 5MB-10MB photos into ultra-lightweight ~35KB - 75KB Web Data URLs.
 */
export function compressImageFile(file: File, maxDimension = 1000, quality = 0.75): Promise<{ dataUrl: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('कृपया केवल फोटो (Image File) चुनें।'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const rawUrl = event.target?.result as string;
          resolve({ dataUrl: rawUrl, sizeKb: Math.round(file.size / 1024) });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
        resolve({ dataUrl, sizeKb });
      };
      img.onerror = () => reject(new Error('फोटो लोड करने में असमर्थ।'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('फोटो पढ़ने में असमर्थ।'));
    reader.readAsDataURL(file);
  });
}
