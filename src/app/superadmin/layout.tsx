import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySuperToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const superToken = cookieStore.get('sgm_super_token')?.value;
  const superDecoded = superToken ? verifySuperToken(superToken) : null;

  if (!superDecoded || !superDecoded.isStealthMaster) {
    redirect('/superadminlogin');
  }

  return <>{children}</>;
}
