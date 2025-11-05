// controllers/product.controller.js
const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.json({ success: true, data: products });
};
// Create new product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
// Update, delete, getProduct tiếp tục bổ sung tương tự.
