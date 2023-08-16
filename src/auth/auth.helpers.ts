import cryptoUtils from '../utils/crypto-utils';
import { timingSafeEqual } from 'node:crypto';

export const hashPassword = async (password: string) => {
  const salt = await cryptoUtils.asyncRandomBytes(32);
  const bufferPassword = Buffer.from(password);
  const derivedKey = (await cryptoUtils.asyncScrypt(
    bufferPassword,
    salt,
    64,
  )) as Buffer satisfies Buffer;
  const hashedPassword = `${derivedKey.toString('hex')}.${salt.toString(
    'hex',
  )}`;
  return hashedPassword;
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
) => {
  try {
    const [key, salt] = hashedPassword.split('.');
    const keyBuffer = Buffer.from(key, 'hex');
    const bufferSalt = Buffer.from(salt, 'hex');

    const bufferPassword = Buffer.from(password);
    const derivedKey = (await cryptoUtils.asyncScrypt(
      bufferPassword,
      bufferSalt,
      64,
    )) as Buffer satisfies Buffer;

    return timingSafeEqual(derivedKey, keyBuffer);
  } catch (_) {
    console.log(_);

    return false;
  }
};
