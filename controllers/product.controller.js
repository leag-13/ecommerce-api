// controllers/product.controller.js
const Product = require('../models/Product');
const Category = require('../models/Category');

// ========== GET ALL PRODUCTS ==========
exports.getProducts = async (req, res) => {
  try {
    const { 
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10
    } = req.query;
  
    const query = { isActive: true };
  
    if (category) {
      query.categories = category;
    }
  
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
  
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    let sortOrder = { createdAt: -1 };
    if (sort === 'price') sortOrder = { price: 1 };
    if (sort === '-price') sortOrder = { price: -1 };
    if (sort === 'name') sortOrder = { name: 1 };
  
    const products = await Product.find(query)
      .populate('categories', 'name slug')
      .populate('seller', 'username email')
      .sort(sortOrder)
      .limit(limit * 1)
      .skip((page - 1) * limit);
  
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

// ========== GET SINGLE PRODUCT ==========
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

// ========== CREATE PRODUCT ==========
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
    
    // TỰ ĐỘNG LẤY SELLER TỪ TOKEN
    const productData = {
      ...req.body,
      seller: req.user.userId   // ← Từ middleware protect
    };
    
    const product = await Product.create(productData);
    
    // Populate sau khi tạo
    await product.populate([
      { path: 'categories', select: 'name slug' },
      { path: 'seller', select: 'username email' }
    ]);
    
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

// ========== UPDATE PRODUCT (CẢI TIẾN - KIỂM TRA OWNERSHIP) ==========
exports.updateProduct = async (req, res) => {
  try {
    // Bước 1: Tìm product
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Bước 2: Kiểm tra quyền sở hữu
    // Chỉ cho phép: chủ sở hữu (seller) hoặc admin
    if (product.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to update this product' 
      });
    }
    
    // Bước 3: Validate categories (nếu có)
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
    
    // Bước 4: KHÔNG CHO PHÉP thay đổi seller
    delete req.body.seller;  // Xóa seller khỏi body nếu có
    
    // Bước 5: Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    )
    .populate('categories', 'name slug')
    .populate('seller', 'username email');
  

    res.json({ 
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// ========== DELETE PRODUCT (CẢI TIẾN - KIỂM TRA OWNERSHIP) ==========
exports.deleteProduct = async (req, res) => {
  try {
    // Bước 1: Tìm product
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Bước 2: Kiểm tra quyền sở hữu
    // Chỉ cho phép: chủ sở hữu (seller) hoặc admin
    if (product.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to delete this product' 
      });
    }
    
    // Bước 3: Soft delete
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
