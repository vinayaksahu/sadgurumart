import { NextRequest, NextResponse } from 'next/server';
import { uploadToGoogleDrive, DEFAULT_DRIVE_FOLDER_ID } from '@/lib/googleDriveUpload';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { file, filename, mimeType, folder } = body;

    if (!file) {
      return NextResponse.json({ error: 'फोटो या फ़ाइल डेटा आवश्यक है (File data is required)' }, { status: 400 });
    }

    const result = await uploadToGoogleDrive({
      base64Data: file,
      filename: filename || `sgm_upload_${Date.now()}.jpg`,
      mimeType: mimeType || 'image/jpeg',
      folder: folder || 'media',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Upload API route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'फ़ोटो अपलोड में त्रुटि हुई' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    let hasEnvUrl = !!process.env.GOOGLE_DRIVE_UPLOAD_URL?.trim();
    let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim() || DEFAULT_DRIVE_FOLDER_ID;
    let hasDbUrl = false;

    const setting = await prisma.systemSetting.findUnique({
      where: { id: 'default_setting' },
      select: { googleDriveUploadUrl: true, googleDriveFolderId: true },
    });

    if (setting?.googleDriveUploadUrl?.trim()) {
      hasDbUrl = true;
    }
    if (setting?.googleDriveFolderId?.trim()) {
      folderId = setting.googleDriveFolderId.trim();
    }

    return NextResponse.json({
      success: true,
      configured: hasEnvUrl || hasDbUrl,
      folderId,
      driveFolderUrl: `https://drive.google.com/drive/folders/${folderId}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
