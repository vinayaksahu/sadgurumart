import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      error: 'P2P वॉलेट से मेन वॉलेट में ट्रांसफर नियमानुसार सख्त प्रतिबंधित है (Transfer from P2P Wallet to Main Wallet is strictly prohibited by company policy).' 
    },
    { status: 403 }
  );
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { 
      allowed: false,
      message: 'P2P Wallet to Main Wallet transfer is permanently disabled.' 
    },
    { status: 403 }
  );
}
