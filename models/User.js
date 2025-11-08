// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  
  // ========== THÔNG TIN CÁ NHÂN ==========
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    district: String,
    ward: String,
    zipCode: String
  },
  
  // ========== VAI TRÒ ==========
  role: { 
    type: String, 
    enum: ['user', 'sale', 'admin'], 
    default: 'user' 
  },
  
  // ========== SALE-SPECIFIC FIELDS ==========
  // Chỉ dành cho role 'sale'
  employeeId: {
    type: String,
    unique: true,
    sparse: true  // Chỉ unique khi có giá trị
  },
  commissionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100  // % hoa hồng (ví dụ: 5 = 5%)
  },
  totalSales: {
    type: Number,
    default: 0  // Tổng doanh số bán được
  },
  totalOrders: {
    type: Number,
    default: 0  // Tổng số đơn hàng
  },
  
  // ========== STATUS ==========
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  isVerified: {
    type: Boolean,
    default: false  // Email verification
  }
}, { timestamps: true });

// Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
