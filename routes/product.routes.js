// routes/product.routes.js
const express = require('express');
const router = express.Router();

// Import controllers
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');

// ========================================
// Import middleware auth
// ========================================
const { protect, authorize } = require('../middleware/auth');

// ========================================
// PUBLIC ROUTES (không cần đăng nhập)
// ========================================
router.get('/', getProducts);        // Xem danh sách sản phẩm
router.get('/:id', getProduct);      // Xem chi tiết sản phẩm

// ========================================
// PROTECTED ROUTES (cần đăng nhập)
// ========================================
// Tạo sản phẩm - chỉ admin và seller
router.post('/', 
  protect,                           // Xác thực token
  authorize('admin', 'sale'),        // Chỉ admin hoặc sale
  createProduct
);

// Sửa sản phẩm - chỉ admin và seller (controller sẽ check ownership)
router.put('/:id', 
  protect,
  authorize('admin', 'sale'),
  updateProduct
);

// Xóa sản phẩm - chỉ admin và seller
router.delete('/:id', 
  protect,
  authorize('admin', 'sale'),
  deleteProduct
);

module.exports = router;
