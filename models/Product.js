// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  
  slug: { 
    type: String, 
    unique: true 
  },
  
  description: { 
    type: String 
  },
  
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  
  categories: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category'
  }],
  // ====================================
  
  stock: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Auto-generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
