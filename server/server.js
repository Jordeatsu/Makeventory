import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import pino from 'pino';

import User from './models/User.js';
import BusinessInfo from './models/BusinessInfo.js';
import { requireAuth } from './middleware/authMiddleware.js';

dotenv.config();

const app     = express();
const PORT    = process.env.PORT || 5001;
const IS_PROD = process.env.NODE_ENV === 'production';

const log = pino({
  level: IS_PROD ? 'info' : 'debug',
  ...(IS_PROD ? {} : { transport: { target: 'pino-pretty', options: { colorize: true } } }),
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  log.warn('JWT_SECRET is not set in server/.env — using an insecure default. Set it before going to production.');
}
const SECRET = JWT_SECRET || 'makeventory-dev-secret-change-me';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// ── Rate limiting ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      20,             // max 20 attempts per window per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

// ── Database ──────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => log.info('MongoDB connected'))
  .catch((err) => { log.error({ err }, 'MongoDB connection error'); process.exit(1); });

// ── Helpers ───────────────────────────────────────────────────────────────────

const scryptAsync = promisify(scrypt);

async function verifyPassword(plaintext, stored) {
  const [salt, hashHex] = stored.split(':');
  const inputBuf  = await scryptAsync(plaintext, salt, 64);
  const storedBuf = Buffer.from(hashHex, 'hex');
  return inputBuf.byteLength === storedBuf.byteLength &&
         timingSafeEqual(inputBuf, storedBuf);
}

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure:   IS_PROD,
  maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days
};

// ── Routes ────────────────────────────────────────────────────────────────────

// Public: business branding shown on the login screen
app.get('/api/public/business', async (_req, res) => {
  try {
    const biz = await BusinessInfo.findOne({}).lean();
    res.json({
      businessName: biz?.businessName ?? 'Makeventory',
      logo:         biz?.logo ?? null,
    });
  } catch {
    res.json({ businessName: 'Makeventory', logo: null });
  }
});

// Login — accepts username or email
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
  const { username, password } = req.body ?? {};
  if (!username?.trim() || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = await User.findOne({
    $or: [
      { username: username.trim() },
      { email:    username.trim().toLowerCase() },
    ],
  });

  if (!user || !await verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    SECRET,
    { expiresIn: '30d' }
  );

  res.cookie('token', token, COOKIE_OPTS);
  res.json({
    user: {
      id:        user._id,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      username:  user.username,
      role:      user.role,
    },
  });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Logout
app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

// Session check — called by the client on load to restore session from cookie
app.get('/api/auth/me', requireAuth, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const user = await User.findById(req.user.sub).select('-passwordHash').lean();
    if (!user) {
      res.clearCookie('token');
      return res.status(401).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const BIND_HOST = IS_PROD ? '127.0.0.1' : '0.0.0.0';
app.listen(PORT, BIND_HOST, () =>
  log.info(`Makeventory API running on ${BIND_HOST}:${PORT}`)
);
