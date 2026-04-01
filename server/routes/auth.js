import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import BusinessInfo from '../models/BusinessInfo.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { verifyPassword, cookieOpts } from '../lib/helpers.js';

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max:      20,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

// ── Public ─────────────────────────────────────────────────────────────────────

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

// ── Auth ────────────────────────────────────────────────────────────────────────

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
            { expiresIn: '30d' },
        );

        res.cookie('token', token, cookieOpts());
        // Return _id (not id) to be consistent with the /auth/me response shape
        res.json({
            user: {
                _id:       user._id,
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

export default router;
