import { requireAuth } from "../middleware/authMiddleware.js";

/**
 * Registers symmetric GET + PUT singleton-settings routes on `router`.
 *
 * GET  /settings/:path
 *   Returns the singleton settings document (creates it with schema defaults if it doesn't
 *   exist yet) and responds with { settings }.
 *
 * PUT  /settings/:path
 *   Upserts the singleton with the request body.
 *   If `allowedFields` is supplied, only those keys are written (others are silently ignored).
 *   If omitted, the entire request body is spread into the update.
 *
 * @param {import('express').Router} router
 * @param {string}   path          - Route segment, e.g. "materials"
 * @param {object}   Model         - Mongoose model for the settings document
 * @param {object}   [opts]
 * @param {string[]} [opts.allowedFields] - Whitelist of writable field names
 */
export function createSettingsRoutes(router, path, Model, { allowedFields } = {}) {
    router.get(`/settings/${path}`, requireAuth, async (_req, res) => {
        try {
            let settings = await Model.findOne().lean();
            if (!settings) settings = await Model.create({});
            res.json({ settings });
        } catch {
            res.status(500).json({ error: "Server error." });
        }
    });

    router.put(`/settings/${path}`, requireAuth, async (req, res) => {
        try {
            const body = req.body ?? {};
            const update = allowedFields ? Object.fromEntries(allowedFields.filter((k) => k in body).map((k) => [k, body[k]])) : { ...body };
            const settings = await Model.findOneAndUpdate({}, update, {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            });
            res.json({ settings });
        } catch {
            res.status(500).json({ error: "Server error." });
        }
    });
}
