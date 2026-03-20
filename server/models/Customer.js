import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    name:         { type: String, required: true },
    email:        { type: String },
    phone:        { type: String },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city:         { type: String },
    state:        { type: String },
    postcode:     { type: String },
    country:      { type: String },
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
