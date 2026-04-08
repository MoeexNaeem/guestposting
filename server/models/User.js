const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, 
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer',
    },
    stripeAccountId: {
      type: String, 
    },
    isStripeConnected: {
      type: Boolean,
      default: false,
    },
    isSuspended: { 
      type: Boolean, 
      default: false 
    },
    
    // --- PASSWORD RECOVERY FIELDS ---
    resetPasswordOtp: { 
      type: String 
    },
    resetPasswordExpire: { 
      type: Date 
    },

    // --- FINANCIAL WALLET FIELDS ---
    balance: { 
      type: Number, 
      default: 0 
    }, 
    payoutDetails: { 
      type: String, 
      default: '' 
    }
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('User', userSchema);