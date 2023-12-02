import { VerificationTypes } from '@/auth/auth.dto';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

export const asyncScrypt = promisify(scrypt);
export const asyncRandomBytes = promisify(randomBytes);

export const OTP_WINDOW: Record<VerificationTypes, { window: number }> = {
  'forgot-password': { window: 0 },
  'change-email': { window: 0 },
  login: { window: 0 },
  '2fa': { window: 1 },
  '2fa-verify': { window: 1 },
  registration: { window: 0 },
  onboarding: { window: 0 },
};
