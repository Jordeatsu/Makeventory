import mongoose from 'mongoose';

// Singleton — one document holds all order-related settings.
// No configurable fields yet; the collection is seeded at install time
// so routes can upsert/return without checking for missing docs.
const orderSettingsSchema = new mongoose.Schema(
    {},
    { timestamps: true },
);

export default mongoose.model('OrderSettings', orderSettingsSchema);
