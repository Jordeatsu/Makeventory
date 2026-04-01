import mongoose from "mongoose";

// Singleton — one document holds all product-related settings.
// No configurable fields yet; the collection is seeded at install time
// so routes can upsert/return without checking for missing docs.
const productSettingsSchema = new mongoose.Schema(
    {
        // Column visibility map for the products table – key → boolean (absent = true)
        tableColumns: { type: mongoose.Schema.Types.Mixed, default: {} },

        // Prefix used when auto-assigning product numbers (e.g. PRD-00000001)
        numberPrefix: { type: String, default: "PRD-" },
    },
    { timestamps: true },
);

export default mongoose.model("ProductSettings", productSettingsSchema);
