import mongoose from "mongoose";

const materialTypeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: null },
        usageType: {
            type: String,
            enum: ["Whole Item", "Percentage", "Bulk"],
            required: true,
            default: "Whole Item",
        },

        // Default values pre-populated when creating a material of this type
        defaultStockQty:   { type: Number, default: null },
        lowStockThreshold: { type: Number, default: null },
        defaultCostPrice:  { type: Number, default: null },
        purchaseQty:       { type: Number, default: null },

        unitOfMeasure: {
            type: String,
            enum: ["mm", "mm2", "cm", "cm2", "m", "m2", "in", "in2", "piece"],
            trim: true,
            required: true,
            default: "piece",
        },
        isActive:  { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    { timestamps: true },
);

const MaterialType = mongoose.model("MaterialType", materialTypeSchema);

export default MaterialType;
