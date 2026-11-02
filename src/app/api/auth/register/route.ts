import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { findSpilloverPlacement } from '@/lib/mlm/binaryEngine';
import { getSystemSettings } from '@/lib/settings';

export async function POST(req: NextRequest) {
  try {
    const settings = await getSystemSettings();
    if (!settings.registrationEnabled) {
      return NextResponse.json(
        { error: 'नया पंजीकरण वर्तमान में अस्थायी रूप से बंद है (New registration temporarily paused by Admin).' },
        { status: 403 }
      );
    }

    const { sponsorId, placementPosition, name, mobile, email, pan, password } = await req.json();

    if (!sponsorId || !name || !mobile || !password) {
      return NextResponse.json(
        { error: 'Sponsor Code, Name, Mobile and Password are required' },
        { status: 400 }
      );
    }

    // Verify sponsor exists
    const sponsor = await prisma.user.findFirst({
      where: {
        OR: [
          { userCode: sponsorId.trim().toUpperCase() },
          { id: sponsorId.trim() },
        ],
      },
    });

    if (!sponsor) {
      return NextResponse.json(
        { error: 'Invalid Sponsor ID. Please verify sponsor code.' },
        { status: 400 }
      );
    }

    // 1. Mobile Check - Exactly 10 digits & Max 3 IDs allowed per phone number
    const cleanMobile = mobile.trim();
    if (!/^\d{10}$/.test(cleanMobile)) {
      return NextResponse.json(
        { error: 'कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें (Invalid 10-digit mobile number)' },
        { status: 400 }
      );
    }

    const mobileCount = await prisma.user.count({
      where: { mobile: cleanMobile },
    });

    if (mobileCount >= 3) {
      return NextResponse.json(
        { error: `इस मोबाइल नंबर (${cleanMobile}) से अधिकतम 3 आईडी की अनुमति है। यह सीमा पूरी हो चुकी है। (Maximum 3 IDs allowed per Mobile number)` },
        { status: 400 }
      );
    }

    // 2. Email Check - Max 3 IDs allowed per email ID
    const cleanEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
    if (cleanEmail) {
      const emailCount = await prisma.user.count({
        where: { email: cleanEmail },
      });

      if (emailCount >= 3) {
        return NextResponse.json(
          { error: `इस ईमेल आईडी (${cleanEmail}) से अधिकतम 3 आईडी की अनुमति है। यह सीमा पूरी हो चुकी है। (Maximum 3 IDs allowed per Email ID)` },
          { status: 400 }
        );
      }
    }

    // 3. PAN Check - Max 3 IDs allowed per PAN card (if provided during registration)
    const cleanPAN = pan && typeof pan === 'string' && pan.trim() ? pan.trim().toUpperCase() : null;
    if (cleanPAN) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPAN)) {
        return NextResponse.json(
          { error: 'अमान्य पैन कार्ड नंबर (Invalid PAN format, e.g. ABCDE1234F)' },
          { status: 400 }
        );
      }

      const [panUserCount, panKycCount] = await Promise.all([
        prisma.user.count({ where: { pan: cleanPAN } }),
        prisma.kYCDetail.count({ where: { panNumber: cleanPAN } }),
      ]);
      const panCount = Math.max(panUserCount, panKycCount);

      if (panCount >= 3) {
        return NextResponse.json(
          { error: `इस पैन कार्ड (${cleanPAN}) से अधिकतम 3 आईडी की अनुमति है। यह सीमा पूरी हो चुकी है। (Maximum 3 IDs allowed per PAN Card)` },
          { status: 400 }
        );
      }
    }

    // Determine Binary Placement Parent (with automatic spillover)
    const position = placementPosition === 'RIGHT' ? 'RIGHT' : 'LEFT';
    const placement = await findSpilloverPlacement(sponsor.id, position);

    // Generate unique random SGM User Code (e.g. SGM54963, SGM65884)
    let nextCode = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 100) {
      attempts++;
      // Generate 5-digit random integer between 10000 and 99999 (e.g. SGM54963, SGM65884)
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const candidateCode = `SGM${randomNum}`;

      const existing = await prisma.user.findUnique({
        where: { userCode: candidateCode },
        select: { id: true },
      });

      if (!existing) {
        nextCode = candidateCode;
        isUnique = true;
      }
    }

    if (!nextCode) {
      // High-entropy fallback if 100 attempts were occupied
      nextCode = `SGM${Math.floor(10000 + Math.random() * 90000)}`;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with default wallet and binary parent link
    const newUser = await prisma.user.create({
      data: {
        userCode: nextCode,
        name: name.trim(),
        mobile: cleanMobile,
        email: cleanEmail,
        pan: cleanPAN,
        passwordHash,
        sponsorId: sponsor.id,
        placementParentId: placement.parentId,
        placementPosition: placement.position,
        wallet: {
          create: {
            mainBalance: 0,
            p2pBalance: 0,
            shoppingBalance: 0,
            holdBalance: 0,
            autoPoolReserve: 0,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      userCode: newUser.userCode,
      name: newUser.name,
      placementParent: placement.parentId,
      placementPosition: placement.position,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during registration' },
      { status: 500 }
    );
  }
}

// GET /api/auth/register?code=SGM10001 - Check and return sponsor details
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('sponsorCode') || searchParams.get('code') || searchParams.get('ref');

    if (!code) {
      return NextResponse.json({ error: 'Sponsor code is required' }, { status: 400 });
    }

    const sponsor = await prisma.user.findFirst({
      where: {
        OR: [
          { userCode: code.trim().toUpperCase() },
          { id: code.trim() },
        ],
      },
      select: { userCode: true, name: true, isActive: true },
    });

    if (!sponsor) {
      return NextResponse.json({ error: 'मान्य स्पॉन्सर कोड नहीं मिला (Sponsor not found)' }, { status: 404 });
    }

    return NextResponse.json({ success: true, sponsor });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lookup failed' }, { status: 500 });
  }
}
