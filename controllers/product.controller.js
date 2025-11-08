// controllers/product.controller.js
const Product = require('../models/Product');
const Category = require('../models/Category');

// ========== GET ALL PRODUCTS (CẢI TIẾN) ==========
exports.getProducts = async (req, res) => {
  try {
    // Query parameters cho filter, search, sort
    const { 
      category,     // Lọc theo category ID
      search,       // Tìm theo tên
      minPrice,     // Giá tối thiểu
      maxPrice,     // Giá tối đa
      sort,         // Sắp xếp: 'price', '-price', 'createdAt'
      page = 1,     // Trang hiện tại
      limit = 10    // Số sản phẩm mỗi trang
    } = req.query;
    
    // Build query object
    const query = { isActive: true };
    
    // Lọc theo category
    if (category) {
      query.categories = category;
    }
    
    // Tìm kiếm theo tên
    if (search) {
      query.name = { $regex: search, $options: 'i' };  // Case-insensitive
    }
    
    // Lọc theo giá
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Xác định sort order
    let sortOrder = { createdAt: -1 };  // Mặc định: mới nhất
    if (sort === 'price') sortOrder = { price: 1 };        // Giá tăng dần
    if (sort === '-price') sortOrder = { price: -1 };      // Giá giảm dần
    if (sort === 'name') sortOrder = { name: 1 };          // Tên A-Z
    
    // Execute query với pagination
    const products = await Product.find(query)
      .populate('categories', 'name slug')
      .populate('seller', 'username email')
      .sort(sortOrder)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Đếm tổng số sản phẩm
    const total = await Product.countDocuments(query);
    
    res.json({ 
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: products 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// ========== GET SINGLE PRODUCT (MỚI) ==========
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categories', 'name slug description')
      .populate('seller', 'username email');
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: product 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// ========== CREATE PRODUCT (CẢI TIẾN) ==========
exports.createProduct = async (req, res) => {
  try {
    // Validate categories exist
    if (req.body.categories && req.body.categories.length > 0) {
      const categoryCount = await Category.countDocuments({
        _id: { $in: req.body.categories },
        isActive: true
      });
      
      if (categoryCount !== req.body.categories.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'One or more categories are invalid or inactive' 
        });
      }
    }
    
    const product = await Product.create(req.body);
    
    // Populate categories sau khi tạo
    await product.populate('categories', 'name slug');
    
    res.status(201).json({ 
      success: true,
      message: 'Product created successfully',
      data: product 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// ========== UPDATE PRODUCT (MỚI) ==========
exports.updateProduct = async (req, res) => {
  try {
    // Validate categories nếu có trong request
    if (req.body.categories && req.body.categories.length > 0) {
      const categoryCount = await Category.countDocuments({
        _id: { $in: req.body.categories },
        isActive: true
      });
      
      if (categoryCount !== req.body.categories.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'One or more categories are invalid' 
        });
      }
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    )
    .populate('categories', 'name slug')
    .populate('seller', 'username email');
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Product updated successfully',
      data: product 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// ========== DELETE PRODUCT (MỚI - Soft Delete) ==========
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Soft delete
    product.isActive = false;
    await product.save();
    
    res.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};