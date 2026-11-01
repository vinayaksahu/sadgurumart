import jwt from 'jsonwebtoken';

const USER_SECRET = process.env.JWT_USER_SECRET || 'sgm_usr_sec_fallback_random_key_1122';
const ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || 'sgm_adm_sec_fallback_random_key_3344';
const SUPER_SECRET = process.env.JWT_SUPERADMIN_SECRET || 'sgm_super_stealth_root_fallback_key_9988';

export interface UserTokenPayload {
  id: string;
  userCode: string;
  mobile: string;
  role: 'USER';
}

export interface AdminTokenPayload {
  id: string;
  username: string;
  email: string;
  role: string; // Staff role
  permissions: any;
}

export interface SuperTokenPayload {
  id: string;
  username: string;
  stealthRole: 'SUPER_ROOT';
  isStealthMaster: true;
}

// User JWT
export function signUserToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, USER_SECRET, { expiresIn: '7d' });
}

export function verifyUserToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, USER_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
}

// Admin JWT
export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, ADMIN_SECRET, { expiresIn: '12h' });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, ADMIN_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

// Stealth Superadmin JWT
export function signSuperToken(payload: SuperTokenPayload): string {
  return jwt.sign(payload, SUPER_SECRET, { expiresIn: '4h' });
}

export function verifySuperToken(token: string): SuperTokenPayload | null {
  try {
    return jwt.verify(token, SUPER_SECRET) as SuperTokenPayload;
  } catch {
    return null;
  }
}
