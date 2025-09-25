const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false, // Make it optional
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username must not exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name must not exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name must not exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  profilePicture: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userType: {
    type: String,
    enum: ['customer', 'business', 'admin'],
    default: 'customer'
  },
  location: {
    city: String,
    area: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Password reset fields
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },
  // Email verification fields
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpiry: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for profile URL
userSchema.virtual('profileUrl').get(function() {
  return `/api/users/${this._id}`;
});

// Pre-save middleware to hash password and generate username
userSchema.pre('save', async function(next) {
  // Generate username from email if not provided
  if (!this.username) {
    const emailPrefix = this.email.split('@')[0];
    let baseUsername = emailPrefix;
    let counter = 1;
    
    // Check if username exists and generate unique one
    while (await mongoose.model('User').findOne({ username: baseUsername })) {
      baseUsername = `${emailPrefix}${counter}`;
      counter++;
    }
    this.username = baseUsername;
  }
  
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to automatically add tags based on user type
userSchema.pre('save', function(next) {
  // Ensure tags array exists
  if (!this.tags) {
    this.tags = [];
  }
  
  // Add appropriate tag based on user type
  if (this.userType === 'customer' && !this.tags.includes('Customer')) {
    this.tags.push('Customer');
  } else if (this.userType === 'business' && !this.tags.includes('Service Provider')) {
    this.tags.push('Service Provider');
  } else if (this.userType === 'admin' && !this.tags.includes('Admin')) {
    this.tags.push('Admin');
  }
  
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash the token and save to database
  this.resetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expiry time (1 hour from now)
  this.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
  
  return resetToken;
};

// Method to clear password reset token
userSchema.methods.clearPasswordResetToken = function() {
  this.resetToken = undefined;
  this.resetTokenExpiry = undefined;
};

// Method to check if reset token is valid
userSchema.methods.isResetTokenValid = function(token) {
  if (!this.resetToken || !this.resetTokenExpiry) {
    return false;
  }
  
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  return this.resetToken === hashedToken && Date.now() < this.resetTokenExpiry;
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  // Generate random token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Hash the token and save to database
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  // Set expiry time (24 hours from now)
  this.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

// Method to clear email verification token
userSchema.methods.clearEmailVerificationToken = function() {
  this.emailVerificationToken = undefined;
  this.emailVerificationExpiry = undefined;
};

// Method to check if email verification token is valid
userSchema.methods.isEmailVerificationTokenValid = function(token) {
  if (!this.emailVerificationToken || !this.emailVerificationExpiry) {
    return false;
  }
  
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  return this.emailVerificationToken === hashedToken && Date.now() < this.emailVerificationExpiry;
};

// Method to verify email
userSchema.methods.verifyEmail = function() {
  this.emailVerified = true;
  this.isVerified = true; // Also update the general verification status
  this.clearEmailVerificationToken();
};

// Static method to find users by location
userSchema.statics.findByLocation = function(city) {
  return this.find({ 'location.city': city, isActive: true });
};

// Static method to find users by type
userSchema.statics.findByType = function(userType) {
  return this.find({ userType, isActive: true });
};

module.exports = mongoose.model('User', userSchema);
