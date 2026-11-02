import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyUserToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, mobile, currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: {
      email?: string;
      mobile?: string;
      passwordHash?: string;
    } = {};

    // Validate and update email
    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return NextResponse.json({ error: 'अमान्य ईमेल पता (Invalid email address)' }, { status: 400 });
      }
      updateData.email = trimmedEmail || null;
    }

    // Validate and update mobile
    if (mobile !== undefined) {
      const trimmedMobile = mobile.trim();
      if (!/^\d{10}$/.test(trimmedMobile)) {
        return NextResponse.json(
          { error: 'मोबाइल नंबर 10 अंकों का होना अनिवार्य है (Mobile must be 10 digits)' },
          { status: 400 }
        );
      }
      updateData.mobile = trimmedMobile;
    }

    // Change password if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'पासवर्ड बदलने हेतु वर्तमान पासवर्ड दर्ज करना अनिवार्य है (Current password required)' },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'वर्तमान पासवर्ड गलत है (Incorrect current password)' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए (New password must be at least 6 characters)' },
          { status: 400 }
        );
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        userCode: true,
        name: true,
        email: true,
        mobile: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'प्रोफाइल विवरण सफलतापूर्वक अपडेट हुआ (Profile updated successfully)',
      user: updatedUser,
      passwordChanged: Boolean(updateData.passwordHash),
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
