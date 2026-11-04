import { prisma } from './prisma';

export interface DriveUploadResult {
  success: boolean;
  url: string;
  fileId?: string;
  driveUrl?: string;
  provider: 'google_drive';
  message?: string;
  error?: string;
}

export const DEFAULT_DRIVE_FOLDER_ID = '1SPTSkz7LEJjCy1R9Zuu6-R5t14w26lbf';

/**
 * Uploads a base64 or buffer media file (images, PDFs, documents) directly to the configured Google Drive folder.
 * Uses Google Apps Script Web App webhook configured in SystemSetting or GOOGLE_DRIVE_UPLOAD_URL env.
 */
export async function uploadToGoogleDrive({
  base64Data,
  filename,
  mimeType = 'image/jpeg',
  folder = 'media',
}: {
  base64Data: string;
  filename?: string;
  mimeType?: string;
  folder?: string;
}): Promise<DriveUploadResult> {
  try {
    // 1. Get Google Drive upload configuration
    let uploadUrl = process.env.GOOGLE_DRIVE_UPLOAD_URL?.trim();
    let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim() || DEFAULT_DRIVE_FOLDER_ID;

    if (!uploadUrl) {
      try {
        const setting = await prisma.systemSetting.findUnique({
          where: { id: 'default_setting' },
          select: { googleDriveUploadUrl: true, googleDriveFolderId: true },
        });
        if (setting?.googleDriveUploadUrl) {
          uploadUrl = setting.googleDriveUploadUrl.trim();
        }
        if (setting?.googleDriveFolderId) {
          folderId = setting.googleDriveFolderId.trim();
        }
      } catch (dbErr) {
        console.warn('Could not read google drive settings from DB:', dbErr);
      }
    }

    // Clean base64 data
    const cleanBase64 = base64Data.includes('base64,')
      ? base64Data.split('base64,')[1]
      : base64Data;

    const ext = mimeType === 'application/pdf' ? '.pdf' : '.jpg';
    const safeFilename = filename || `${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;

    // 2. If Google Drive Webhook URL is configured, upload to Google Drive
    if (uploadUrl && uploadUrl.startsWith('http')) {
      const payload = {
        base64: cleanBase64,
        filename: safeFilename,
        mimeType: mimeType || 'image/jpeg',
        folderId: folderId || DEFAULT_DRIVE_FOLDER_ID,
        folderType: folder,
      };

      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (pErr) {
        console.error('Google Drive script raw response was not JSON:', text);
      }

      if (data && (data.success || data.fileId)) {
        const fileId = data.fileId;
        const directUrl = data.url || `https://lh3.googleusercontent.com/d/${fileId}`;
        const driveUrl = data.driveUrl || `https://drive.google.com/file/d/${fileId}/view`;

        return {
          success: true,
          url: directUrl,
          fileId,
          driveUrl,
          provider: 'google_drive',
          message: 'Google Drive में सफलतापूर्वक सेव किया गया।',
        };
      } else {
        console.warn('Google Drive script returned error:', data);
        return {
          success: false,
          url: '',
          provider: 'google_drive',
          error: data?.error || 'Google Drive में फ़ाइल सेव नहीं हो सकी।',
        };
      }
    }

    return {
      success: false,
      url: '',
      provider: 'google_drive',
      error: 'Google Drive Webhook URL कॉन्फ़िगर नहीं है।',
    };
  } catch (error: any) {
    console.error('Error uploading to Google Drive:', error);
    return {
      success: false,
      url: '',
      provider: 'google_drive',
      error: error.message || 'Drive upload failed',
    };
  }
}

/**
 * Ensures media (image or PDF) is stored on Google Drive and NEVER as raw Base64 in Neon database.
 * If input is already an HTTP URL, returns as-is.
 * If input is Base64 data, uploads to Google Drive and returns the direct Google Drive URL.
 */
export async function ensureGoogleDriveUrl(
  input: string | undefined | null,
  folder: string = 'media',
  filenamePrefix: string = 'file'
): Promise<string> {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Already a cloud/web link
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If base64 data, upload to Google Drive
  if (trimmed.startsWith('data:')) {
    const mimeMatch = trimmed.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const ext = mimeType === 'application/pdf' ? '.pdf' : '.jpg';
    const filename = `${folder}_${filenamePrefix.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}${ext}`;

    const res = await uploadToGoogleDrive({
      base64Data: trimmed,
      filename,
      mimeType,
      folder,
    });

    if (res.success && res.url) {
      return res.url;
    }

    console.error('Failed to upload base64 to Google Drive:', res.error || res.message);
    throw new Error('Google Drive में फ़ाइल अपलोड असफल रहा। कृपया पुनः प्रयास करें।');
  }

  return trimmed;
}
