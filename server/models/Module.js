import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: null },
        isActive: { type: Boolean, required: true, default: false },
        displayOrder: { type: Number, required: true },
    },
    { timestamps: true },
);

const Module = mongoose.model("Module", moduleSchema, "modules");

export default Module;