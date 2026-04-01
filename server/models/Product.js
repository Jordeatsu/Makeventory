import mongoose from "mongoose";

const materialEntrySchema = new mongoose.Schema(
    {
        materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Material", default: null },
        materialName: { type: String, required: true },
        materialType: { type: String, default: "" },
        quantityUsed: { type: Number, required: true, default: 1 },
        unit: { type: String, default: "pieces" },
        costPerUnit: { type: Number, default: 0 },
        packCost: { type: Number, default: null },
        lineCost: { type: Number, default: 0 },
    },
    { _id: false },
);

const productSchema = new mongoose.Schema(
    {
        productNumber: { type: String, trim: true, default: null },
        name: { type: String, required: true, trim: true },
        sku: { type: String, trim: true, default: null },
        category: { type: String, trim: true, default: null },
        description: { type: String, trim: true, default: null },
        basePrice: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
        isTemplate: { type: Boolean, default: false },
        parentProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
        defaultMaterials: [materialEntrySchema],
        estimatedMaterialCost: { type: Number, default: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
