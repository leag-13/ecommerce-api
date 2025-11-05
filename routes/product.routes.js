// routes/product.routes.js
const express = require('express');
const { getProducts, createProduct } = require('../controllers/product.controller');
const router = express.Router();

router.get('/', getProducts);
router.post('/', createProduct);

module.exports = router;
