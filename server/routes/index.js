import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import BusinessInfo from '../models/BusinessInfo.js';
import Module from '../models/Module.js';
import MaterialSettings from '../models/MaterialSettings.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

const scryptAsync = promisify(scrypt);

async function verifyPassword(plaintext, stored) {
  const [salt, hashHex] = stored.split(':');
  const inputBuf  = await scryptAsync(plaintext, salt, 64);
  const storedBuf = Buffer.from(hashHex, 'hex');
  return inputBuf.byteLength === storedBuf.byteLength &&
         timingSafeEqual(inputBuf, storedBuf);
}

function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure:   process.env.COOKIE_SECURE === 'true',
    maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days
  };
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      20,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

// ── Public ────────────────────────────────────────────────────────────────────

// Business branding — shown on the login screen before the user authenticates
router.get('/public/business', async (_req, res) => {
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

// ── Auth ──────────────────────────────────────────────────────────────────────

// Login — accepts username or email
router.post('/auth/login', loginLimiter, async (req, res) => {
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

    const secret = process.env.JWT_SECRET || 'makeventory-dev-secret-change-me';
    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      secret,
      { expiresIn: '30d' }
    );

    res.cookie('token', token, cookieOpts());
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
router.post('/auth/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

// Session check — restores session from cookie on client load
router.get('/auth/me', requireAuth, async (req, res) => {
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

// ── Users ────────────────────────────────────────────────────────────────────

// Get a user profile by ID
router.get('/users/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[a-f\d]{24}$/i)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }
    const user = await User.findById(id).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Modules ───────────────────────────────────────────────────────────────────

// Active modules — drives the client navigation
router.get('/modules', requireAuth, async (_req, res) => {
  try {
    const modules = await Module.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .select('name displayOrder')
      .lean();
    res.json({ modules });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// All modules — for the settings screen
router.get('/modules/all', requireAuth, async (_req, res) => {
  try {
    const modules = await Module.find()
      .sort({ displayOrder: 1 })
      .select('name description isActive displayOrder')
      .lean();
    res.json({ modules });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Bulk update module active states
router.patch('/modules', requireAuth, async (req, res) => {
  try {
    const updates = req.body?.updates;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'updates must be an array.' });
    }
    await Promise.all(
      updates.map(({ id, isActive }) => {
        if (!id?.match(/^[a-f\d]{24}$/i)) return Promise.resolve();
        return Module.findByIdAndUpdate(id, { isActive: Boolean(isActive) });
      })
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Material Types ────────────────────────────────────────────────────────────

import MaterialType from '../models/MaterialType.js';
import Material from '../models/Material.js';

// List all
router.get('/material-types', requireAuth, async (_req, res) => {
  try {
    const types = await MaterialType.find().sort({ name: 1 }).lean();
    res.json({ types });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Create
router.post('/material-types', requireAuth, async (req, res) => {
  try {
    const { name, description, usageType, unitOfMeasure, isActive } = req.body ?? {};
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
    const type = await MaterialType.create({
      name: name.trim(),
      description: description?.trim() || null,
      usageType,
      unitOfMeasure: unitOfMeasure || null,
      isActive: isActive !== false,
    });
    res.status(201).json({ type });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'A material type with that name already exists.' });
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update
router.put('/material-types/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[a-f\d]{24}$/i)) return res.status(400).json({ error: 'Invalid ID.' });
    const { name, description, usageType, unitOfMeasure, isActive } = req.body ?? {};
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
    const type = await MaterialType.findByIdAndUpdate(
      id,
      { name: name.trim(), description: description?.trim() || null, usageType, unitOfMeasure: unitOfMeasure || null, isActive },
      { new: true, runValidators: true }
    );
    if (!type) return res.status(404).json({ error: 'Material type not found.' });
    res.json({ type });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Delete — blocked if any Material references this type
router.delete('/material-types/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[a-f\d]{24}$/i)) return res.status(400).json({ error: 'Invalid ID.' });
    const inUse = await Material.find({ materialType: id }).select('name').lean();
    if (inUse.length > 0) {
      return res.status(409).json({
        error: 'This material type is in use and cannot be deleted.',
        materials: inUse.map((m) => m.name),
      });
    }
    await MaterialType.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;

// ── Material Settings (singleton) ─────────────────────────────────────────────────

// Get (or initialise with defaults if none exist yet)
router.get('/settings/materials', requireAuth, async (_req, res) => {
  try {
    let settings = await MaterialSettings.findOne().lean();
    if (!settings) {
      settings = await MaterialSettings.create({});
    }
    res.json({ settings });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Upsert
router.put('/settings/materials', requireAuth, async (req, res) => {
  try {
    const { defaultLowStockThreshold, currency, autoDeductOnOrderComplete, trackFractionalQuantities } = req.body ?? {};
    const settings = await MaterialSettings.findOneAndUpdate(
      {},
      { defaultLowStockThreshold, currency, autoDeductOnOrderComplete, trackFractionalQuantities },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ settings });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});
