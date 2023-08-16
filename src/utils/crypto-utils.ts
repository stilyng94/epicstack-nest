import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const asyncScrypt = promisify(scrypt);
const asyncRandomBytes = promisify(randomBytes);

export default { asyncScrypt, asyncRandomBytes };
