import mongoose from "mongoose";

const globalSettingsSchema = new mongoose.Schema(
    {
        language: {
            type: String,
            enum: ['en', 'fr', 'es'],
            required: true,
            default: 'en',
        },
        currency: {
            type: String,
            enum: ['GBP', 'USD', 'EUR', 'AUD', 'CAD', 'NZD'],
            required: true,
            default: 'GBP',
        },
    },
    { timestamps: true },
);

const GlobalSettings = mongoose.model("GlobalSettings", globalSettingsSchema);

export default GlobalSettings;