import { NextRequest, NextResponse } from 'next/server';

const ALL_AUTH_COOKIES = [
  'sgm_admin_token',
  'sgm_super_token',
  'sgm_admin_active',
  'sgm_admin_mode',
  'sgm_user_token',
  'sgm_user_active',
];

const ADMIN_AUTH_COOKIES = [
  'sgm_admin_token',
  'sgm_super_token',
  'sgm_admin_active',
  'sgm_admin_mode',
];

const USER_AUTH_COOKIES = [
  'sgm_user_token',
  'sgm_user_active',
  'sgm_admin_mode',
];

function clearCookies(response: NextResponse, cookiesToClear: string[]) {
  for (const name of cookiesToClear) {
    // 1. Standard delete
    response.cookies.delete(name);

    // 2. Explicitly expire with maxAge: 0 and past timestamp for cross-browser safety
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: name.includes('token'),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get('target') || 'all'; // 'admin', 'user', 'superadmin', 'all'
  const redirectParam = searchParams.get('redirect');

  let defaultRedirect = '/login';
  let cookiesToClear = ALL_AUTH_COOKIES;

  if (target === 'admin') {
    defaultRedirect = '/adminlogin';
    // If admin also had masqueraded member session, clear all
    cookiesToClear = ALL_AUTH_COOKIES;
  } else if (target === 'superadmin') {
    defaultRedirect = '/superadminlogin';
    cookiesToClear = ALL_AUTH_COOKIES;
  } else if (target === 'user') {
    defaultRedirect = '/login';
    cookiesToClear = USER_AUTH_COOKIES;
  }

  const destination = redirectParam || defaultRedirect;
  const response = NextResponse.redirect(new URL(destination, req.url));
  clearCookies(response, cookiesToClear);
  return response;
}

export async function POST(req: NextRequest) {
  try {
    let target = 'all';
    try {
      const body = await req.json();
      target = body.target || 'all';
    } catch {}

    const cookiesToClear = target === 'user' ? USER_AUTH_COOKIES : ALL_AUTH_COOKIES;
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully, session cleared.',
    });

    clearCookies(response, cookiesToClear);
    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ success: true, message: 'Logged out' });
    clearCookies(response, ALL_AUTH_COOKIES);
    return response;
  }
}
