import mongoose from "mongoose";

// Singleton — one document holds all order-related settings.
// No configurable fields yet; the collection is seeded at install time
// so routes can upsert/return without checking for missing docs.
const orderSettingsSchema = new mongoose.Schema(
    {
        // Column visibility map for the orders table – key → boolean (absent = true)
        tableColumns: { type: mongoose.Schema.Types.Mixed, default: {} },

        // Prefix used when auto-assigning order numbers (e.g. ORD-00000001)
        numberPrefix: { type: String, default: "ORD-" },
    },
    { timestamps: true },
);

export default mongoose.model("OrderSettings", orderSettingsSchema);
