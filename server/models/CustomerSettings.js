import mongoose from 'mongoose';

// Singleton — exactly one document controls which customer fields appear in
// the Create/Edit Customer form across the whole app.
const customerSettingsSchema = new mongoose.Schema(
    {
        // Which customer form fields are visible.
        // "name" is always required and cannot be toggled off.
        fields: {
            email:        { type: Boolean, default: true },
            phone:        { type: Boolean, default: true },
            addressLine1: { type: Boolean, default: true },
            addressLine2: { type: Boolean, default: false },
            city:         { type: Boolean, default: true },
            state:        { type: Boolean, default: true },
            postcode:     { type: Boolean, default: true },
            country:      { type: Boolean, default: true },
        },
    },
    { timestamps: true },
);

const CustomerSettings = mongoose.model('CustomerSettings', customerSettingsSchema);

export default CustomerSettings;
