import { NextRequest, NextResponse } from 'next/server';

/**
 * Utility Recharge API Route
 * Marked as Coming Soon until direct BBPS / telco operator integration is completed.
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'यूटिलिटी रिचार्ज सेवा शीघ्र प्रारंभ होगी (Recharge service is coming soon).' },
    { status: 400 }
  );
}
