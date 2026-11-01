import { prisma } from './prisma';

export interface DriveUploadResult {
  success: boolean;
  url: string;
  fileId?: string;
  driveUrl?: string;
  provider: 'google_drive' | 'local_fallback';
  message?: string;
  error?: string;
}

export const DEFAULT_DRIVE_FOLDER_ID = '1m48lvsU628rR8nhL4i-24GWdJe_4w5Hn';

/**
 * Uploads a base64 or buffer image directly to the configured Google Drive folder.
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

    const safeFilename = filename || `${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;

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
        // Fallback to dataUrl so app continues working seamlessly
        return {
          success: true,
          url: base64Data,
          provider: 'local_fallback',
          message: data.error || 'Google Drive वेबहुक से त्रुटि मिली, स्थानीय रूप से सेव किया गया।',
        };
      }
    }

    // 3. Fallback when Google Drive webhook is not yet entered
    return {
      success: true,
      url: base64Data,
      provider: 'local_fallback',
      message: 'गूगल ड्राइव ऑटो-अपलोड वेबहुक URL अभी एडमिन सेटिंग्स में दर्ज नहीं है। फोटो लोकली सुरक्षित सेव हुई।',
    };
  } catch (error: any) {
    console.error('Error uploading to Google Drive:', error);
    return {
      success: true,
      url: base64Data,
      provider: 'local_fallback',
      error: error.message || 'Drive upload failed',
    };
  }
}
