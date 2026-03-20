import { scrypt, timingSafeEqual, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Constant-time password verification against a stored `salt:hashHex` string.
 * Uses scrypt; timing-safe to prevent side-channel attacks.
 */
export async function verifyPassword(plaintext, stored) {
    const [salt, hashHex] = stored.split(':');
    const inputBuf  = await scryptAsync(plaintext, salt, 64);
    const storedBuf = Buffer.from(hashHex, 'hex');
    return inputBuf.byteLength === storedBuf.byteLength &&
           timingSafeEqual(inputBuf, storedBuf);
}

/** Hashes a plaintext password with scrypt, returning a `salt:hashHex` string. */
export async function hashPassword(plaintext) {
    const salt    = randomBytes(16).toString('hex');
    const hashBuf = await scryptAsync(plaintext, salt, 64);
    return `${salt}:${hashBuf.toString('hex')}`;
}

/** Session cookie options — reads COOKIE_SECURE at call time so dotenv has been applied. */
export function cookieOpts() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure:   process.env.COOKIE_SECURE === 'true',
        maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days
    };
}

/** Returns true if `id` is a valid 24-character hex MongoDB ObjectId. */
export function isValidId(id) {
    return /^[a-f\d]{24}$/i.test(id);
}

/**
 * Escapes a string for safe use in a MongoDB $regex query.
 * Prevents ReDoS attacks from user-supplied search terms.
 */
export function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
