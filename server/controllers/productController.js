const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, isSale, search, page = 1, limit = 12, sort = 'createdAt' } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (isSale === 'true') filter.isSale = true;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const sortOptions = {
      'best-selling': { stock: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      newest: { createdAt: -1 },
      createdAt: { createdAt: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('offerId');

    res.json({
      success: true,
      data: products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
      isActive: true,
    }).populate('offerId');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products (admin)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, mrp, category, stock, isSale, tags, nutritionInfo, ingredients } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Handle uploaded images
    const images = req.files ? req.files.map((f) => f.path) : req.body.images || [];

    const product = await Product.create({
      name, slug, description, price: Number(price), mrp: Number(mrp),
      images, category, stock: Number(stock) || 0,
      isSale: isSale === 'true' || isSale === true,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      nutritionInfo, ingredients,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id (admin)
const updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((f) => f.path);
    }
    if (updates.price) updates.price = Number(updates.price);
    if (updates.mrp) updates.mrp = Number(updates.mrp);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    if (updates.isSale !== undefined) updates.isSale = updates.isSale === 'true' || updates.isSale === true;
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(t => t.trim());
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id (admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/admin/all (admin - includes inactive)
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getAllProductsAdmin };
