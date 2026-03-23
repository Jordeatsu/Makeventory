import mongoose from 'mongoose';

const overheadSchema = new mongoose.Schema(
    {
        name:         { type: String, required: true, trim: true },
        category:     { type: String, trim: true, default: 'General' },
        cost:         { type: Number, required: true, min: 0 },
        purchaseDate: { type: Date, required: true },
        notes:        { type: String, trim: true, default: '' },
        year:         { type: Number },
        createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    { timestamps: true },
);

// Derive the year from purchaseDate automatically
overheadSchema.pre('save', function (next) {
    if (this.purchaseDate) {
        this.year = new Date(this.purchaseDate).getFullYear();
    }
    next();
});

const Overhead = mongoose.model('Overhead', overheadSchema);

export default Overhead;
