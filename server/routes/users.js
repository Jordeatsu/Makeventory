import { Router } from 'express';

import User from '../models/User.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { isValidId, verifyPassword, hashPassword } from '../lib/helpers.js';

const router = Router();

// Get a user profile — non-admins may only view their own profile
router.get('/users/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ error: 'Invalid user ID.' });
        }
        if (req.user.role !== 'admin' && req.user.sub !== id) {
            return res.status(403).json({ error: 'Forbidden.' });
        }
        const user = await User.findById(id).select('-passwordHash').lean();
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ user });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Update a user profile — non-admins may only edit their own profile
router.patch('/users/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid user ID.' });
        if (req.user.role !== 'admin' && req.user.sub !== id) {
            return res.status(403).json({ error: 'Forbidden.' });
        }
        const { firstName, lastName, email, username } = req.body ?? {};
        const updates = {};
        if (firstName?.trim()) updates.firstName = firstName.trim();
        if (lastName?.trim())  updates.lastName  = lastName.trim();
        if (email?.trim())     updates.email     = email.trim().toLowerCase();
        if (username?.trim())  updates.username  = username.trim();
        if (!Object.keys(updates).length) {
            return res.status(400).json({ error: 'No valid fields provided.' });
        }
        const user = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-passwordHash').lean();
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ user });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: 'Username or email already in use.' });
        res.status(500).json({ error: 'Server error.' });
    }
});

// Change own password — requires current password verification
router.patch('/users/:id/password', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid user ID.' });
        if (req.user.sub !== id) return res.status(403).json({ error: 'Forbidden.' });
        const { currentPassword, newPassword } = req.body ?? {};
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required.' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters.' });
        }
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (!await verifyPassword(currentPassword, user.passwordHash)) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }
        user.passwordHash = await hashPassword(newPassword);
        await user.save();
        res.json({ message: 'Password updated successfully.' });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

export default router;
