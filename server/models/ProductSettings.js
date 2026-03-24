import mongoose from 'mongoose';

// Singleton — one document holds all product-related settings.
// No configurable fields yet; the collection is seeded at install time
// so routes can upsert/return without checking for missing docs.
const productSettingsSchema = new mongoose.Schema(
    {},
    { timestamps: true },
);

export default mongoose.model('ProductSettings', productSettingsSchema);
