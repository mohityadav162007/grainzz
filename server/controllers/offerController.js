const Offer = require('../models/Offer');
const Product = require('../models/Product');

// POST /api/offers (admin)
const createOffer = async (req, res) => {
  try {
    const { title, discountPercentage, applicableProducts, applicableCategories, expiryDate } = req.body;
    const offer = await Offer.create({
      title, discountPercentage: Number(discountPercentage),
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });
    // Link offer to products
    if (applicableProducts && applicableProducts.length > 0) {
      await Product.updateMany({ _id: { $in: applicableProducts } }, { offerId: offer._id });
    }
    if (applicableCategories && applicableCategories.length > 0) {
      await Product.updateMany({ category: { $in: applicableCategories } }, { offerId: offer._id });
    }
    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/offers (admin)
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 }).populate('applicableProducts', 'name');
    res.json({ success: true, data: offers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/offers/:id (admin)
const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (offer) {
      await Product.updateMany({ offerId: offer._id }, { offerId: null });
    }
    res.json({ success: true, message: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOffer, getOffers, deleteOffer };
