import mongoose from "mongoose";

const materialTypeSchema = new mongoose.Schema(
    {
        language: {
            type: String,
            enum: ['en', 'es', 'fr', 'de', 'zh', 'jp'],
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

const GlobalSettings = mongoose.model("GlobalSettings", materialTypeSchema);

export default GlobalSettings;