const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    images: [{ type: String }],
    category: {
      type: String,
      enum: ['Puffed Rice', 'Healthy Chips', 'Grain Puffs', 'Combos', 'Gift Packs'],
      required: true,
    },
    stock: { type: Number, default: 0 },
    isSale: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }], // e.g. ['Jar', '150g']
    nutritionInfo: { type: String, default: '' },
    ingredients: { type: String, default: '' },
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null },
  },
  { timestamps: true }
);

// Auto-generate discount percentage
productSchema.virtual('discountPercent').get(function () {
  if (!this.mrp || this.mrp === 0) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
