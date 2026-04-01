import mongoose from "mongoose";

// Singleton — there is always exactly one document in this collection.
// Access via MaterialSettings.getSettings() or upsert via PUT /api/settings/materials.
const materialSettingsSchema = new mongoose.Schema(
    {
        // Pre-fills the low stock threshold field when a new material is created
        defaultLowStockThreshold: { type: Number, required: true, min: 0, default: 5 },

        // Currency symbol shown next to costs throughout the app
        currency: {
            type: String,
            enum: ["GBP", "USD", "EUR", "AUD", "CAD", "NZD"],
            default: "GBP",
        },

        // Automatically reduce material stock when an order is marked complete
        autoDeductOnOrderComplete: { type: Boolean, default: false },

        // Track bulk/percentage material quantities to 2 decimal places rather than whole numbers
        trackFractionalQuantities: { type: Boolean, default: false },

        // Column visibility map for the materials table – key → boolean (absent = true)
        tableColumns: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true },
);

const MaterialSettings = mongoose.model("MaterialSettings", materialSettingsSchema);

export default MaterialSettings;
