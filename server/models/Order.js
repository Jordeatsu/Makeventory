import mongoose from 'mongoose';

const productEntrySchema = new mongoose.Schema(
    {
        productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
        productName: { type: String, default: '' },
        sku:         { type: String, default: '' },
        category:    { type: String, default: '' },
        basePrice:   { type: Number, default: 0 },
        quantity:    { type: Number, default: 1 },
    },
    { _id: false },
);

const materialEntrySchema = new mongoose.Schema(
    {
        materialId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Material', default: null },
        materialName: { type: String, required: true },
        materialType: { type: String, default: '' },
        quantityUsed: { type: Number, required: true, default: 1 },
        unit:         { type: String, default: 'pieces' },
        costPerUnit:  { type: Number, default: 0 },
        packCost:     { type: Number, default: null },
        lineCost:     { type: Number, default: 0 },
    },
    { _id: false },
);

const ALL_STATUSES = ['Pending', 'In Progress', 'Completed', 'Shipped', 'Cancelled'];

const orderSchema = new mongoose.Schema(
    {
        orderNumber:        { type: String, trim: true, default: null },
        origin:             { type: String, trim: true, default: '' },
        originOrderId:      { type: String, trim: true, default: '' },
        orderDate:          { type: Date, default: null },
        status:             { type: String, enum: ALL_STATUSES, default: 'Pending' },
        locked:             { type: Boolean, default: false },
        customer:           { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
        products:           [productEntrySchema],
        materials:          [materialEntrySchema],
        productDescription: { type: String, trim: true, default: '' },
        notes:              { type: String, trim: true, default: '' },
        trackingNumber:     { type: String, trim: true, default: '' },
        totalCharged:       { type: Number, default: 0 },
        shippingCost:       { type: Number, default: 0 },
        buyerTax:           { type: Number, default: 0 },
        discount:           { type: Number, default: 0 },
        discountType:       { type: String, enum: ['percent', 'fixed'], default: 'fixed' },
        hostingCost:        { type: Number, default: 0 },
        marketingCost:      { type: Number, default: 0 },
        refund:             { type: Number, default: 0 },
        totalMaterialCost:  { type: Number, default: 0 },
        profit:             { type: Number, default: 0 },
        createdBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        updatedBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    { timestamps: true },
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
