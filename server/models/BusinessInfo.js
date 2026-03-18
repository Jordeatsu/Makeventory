import mongoose from 'mongoose';

const businessInfoSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    logo:         { type: String, default: null },  // Base64 data URI
    website:      { type: String, default: null },
    twitter:      { type: String, default: null },
    instagram:    { type: String, default: null },
    tiktok:       { type: String, default: null },
    facebook:     { type: String, default: null },
  },
  { timestamps: true }
);

const BusinessInfo = mongoose.model('BusinessInfo', businessInfoSchema, 'businessinfo');

export default BusinessInfo;
