/**
 * Utility to convert Google Drive shareable URLs into direct, embeddable image URLs
 * that render cleanly in standard <img> tags and browser clients.
 */
export function formatGoogleDriveUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();

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
