import mongoose from "mongoose";

const materialTypeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: null },
        usageType: {
            type: String,
            enum: ["Whole Item", "Percentage"],
            required: true,
            default: "Whole Item",
        },

        unitOfMeasure: {
            type: String,
            enum: ["mm", "cm", "m", "in", "ft", "yd", "piece"],
            trim: true,
            required: true,
            default: "piece",
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

const MaterialType = mongoose.model("MaterialType", materialTypeSchema);

export default MaterialType;
