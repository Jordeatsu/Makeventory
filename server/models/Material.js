import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
    {
        name:              { type: String, required: true, trim: true },
        materialType:      { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialType', required: true },
        color:             { type: String, trim: true, default: null },
        quantity:          { type: Number, required: true, default: 0 },
        unit:              { type: String, trim: true, default: 'pieces' }, // 'metres', 'cm²', 'pieces'
        costPerUnit:       { type: Number, required: true, default: 0 },
        unitsPerPack:      { type: Number, required: true, default: 0 },
        lowStockThreshold: { type: Number, required: true, default: 1 },
        supplier:          { type: String, trim: true, default: null },
        sku:               { type: String, trim: true, default: null },
        description:       { type: String, trim: true, default: null },
        createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        updatedBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    { timestamps: true },
);

const Material = mongoose.model('Material', materialSchema);

export default Material;