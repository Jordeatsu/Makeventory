import { scrypt, timingSafeEqual, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/**
 * Constant-time password verification against a stored `salt:hashHex` string.
 * Uses scrypt; timing-safe to prevent side-channel attacks.
 */
export async function verifyPassword(plaintext, stored) {
    const [salt, hashHex] = stored.split(":");
    const inputBuf = await scryptAsync(plaintext, salt, 64);
    const storedBuf = Buffer.from(hashHex, "hex");
    return inputBuf.byteLength === storedBuf.byteLength && timingSafeEqual(inputBuf, storedBuf);
}

/** Hashes a plaintext password with scrypt, returning a `salt:hashHex` string. */
export async function hashPassword(plaintext) {
    const salt = randomBytes(16).toString("hex");
    const hashBuf = await scryptAsync(plaintext, salt, 64);
    return `${salt}:${hashBuf.toString("hex")}`;
}

/** Session cookie options — reads COOKIE_SECURE at call time so dotenv has been applied. */
export function cookieOpts() {
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.COOKIE_SECURE === "true",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };
}

/** Converts a populated user document to a minimal label object { _id, name }. */
export function userLabel(u) {
    if (!u) return null;
    return { _id: u._id, name: `${u.firstName} ${u.lastName}`.trim() };
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
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Generates the next sequential number string for an entity using an atomic counter.
 *
 * Stores the current sequence in `SettingsModel.numberSeq` and increments it with
 * `$inc` so concurrent requests can never generate the same number.
 * On first use (upgrade from old code), the sequence is initialised by deriving it
 * from the highest number already assigned to an existing document.
 *
 * @param {object} Model          - Mongoose model for the entity (Customer, Order, etc.)
 * @param {string} numberField    - Field name on the entity, e.g. "customerNumber"
 * @param {object} SettingsModel  - Mongoose settings model with `numberPrefix` / `numberSeq` fields
 * @param {string} defaultPrefix  - Fallback prefix if none is configured, e.g. "CST-"
 * @returns {Promise<string>}
 */
export async function generateNextNumber(Model, numberField, SettingsModel, defaultPrefix) {
    // Ensure a settings document exists and read the current state.
    let settings = await SettingsModel.findOne().lean();
    if (!settings) {
        settings = await SettingsModel.findOneAndUpdate({}, { $setOnInsert: { numberPrefix: defaultPrefix } }, { new: true, upsert: true, setDefaultsOnInsert: true, lean: true });
    }
    const prefix = settings.numberPrefix ?? defaultPrefix;

    // One-time initialization: derive the starting sequence from existing documents
    // so that upgrading from the old non-atomic code doesn't restart the counter.
    if (settings.numberSeq == null) {
        const latest = await Model.findOne({ [numberField]: { $ne: null } })
            .sort({ createdAt: -1 })
            .select(numberField)
            .lean();
        const lastSeq = latest?.[numberField] ? parseInt(latest[numberField].match(/(\d+)$/)?.[1], 10) || 0 : 0;
        settings = await SettingsModel.findByIdAndUpdate(settings._id, { $set: { numberSeq: lastSeq } }, { new: true, lean: true });
    }

    // Atomically increment — safe under concurrent requests.
    const updated = await SettingsModel.findByIdAndUpdate(settings._id, { $inc: { numberSeq: 1 } }, { new: true, lean: true });
    const seq = updated.numberSeq || 1;

    return `${prefix}${String(seq).padStart(8, "0")}`;
}
