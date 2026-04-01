import mongoose from "mongoose";

const productMaterialSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
        materialQuantityUsed: { type: Number, required: true, min: 0 },
    },
    { timestamps: true },
);

// Composite unique index — a material can only appear once per product
productMaterialSchema.index({ productId: 1, materialId: 1 }, { unique: true });

const ProductMaterial = mongoose.model("ProductMaterial", productMaterialSchema);

export default ProductMaterial;
