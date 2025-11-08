// routes/product.routes.js
const express = require('express');

const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');

// Public routes
router.get('/', getProducts);        // GET all products (có filter, search, sort)
router.get('/:id', getProduct);      // GET single product

// Protected routes (thêm middleware sau)
router.post('/', createProduct);     // CREATE product
router.put('/:id', updateProduct);   // UPDATE product
router.delete('/:id', deleteProduct); // DELETE product

module.exports = router;
