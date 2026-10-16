/**
 * models/User.js
 * ---------------
 * User model — represents customers, sellers (as users), and admins.
 * Sellers have an additional Seller profile linked 1:1.
 *
 * Mongoose 8 note: document middleware (pre('save')) uses async functions
 * WITHOUT a next() callback. Using next() throws "next is not a function".
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ─────────────────────────────────────────────────────────────
// Embedded address sub-schema
// ─────────────────────────────────────────────────────────────
const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: 'Home',
      trim: true,
      maxlength: [30, 'Label cannot exceed 30 characters'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [80, 'Full name cannot exceed 80 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street cannot exceed 200 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [60, 'City cannot exceed 60 characters'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [60, 'State cannot exceed 60 characters'],
    },
    country: {
      type: String,
      default: 'Nigeria',
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Postal code cannot exceed 20 characters'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true, timestamps: false }
);

// ─────────────────────────────────────────────────────────────
// Main User schema
// ─────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      // `unique: true` creates a unique index automatically.
      // Do NOT also add userSchema.index({ email: 1 }) — that duplicates it.
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    phone: {
      type: String,
      trim: true,
      match: [
        /^(\+?234|0)[789][01]\d{8}$/,
        'Please provide a valid Nigerian phone number',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ['customer', 'seller', 'admin'],
        message: 'Role must be customer, seller, or admin',
      },
      default: 'customer',
    },

    avatar: {
      type: String,
      default: '',
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedReason: {
      type: String,
      maxlength: 500,
    },

    lastLoginAt: {
      type: Date,
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
  }
);

// ─────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────
// Email already has unique index via `unique: true` above.
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, isSuspended: 1 });

// ─────────────────────────────────────────────────────────────
// Pre-save: hash password when modified
// Mongoose 8: async function, NO next() callback.
// ─────────────────────────────────────────────────────────────
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─────────────────────────────────────────────────────────────
// Instance method: compare candidate password with stored hash
// ─────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password) {
    throw new Error('Password field not loaded — use .select("+password")');
  }
  return bcrypt.compare(candidate, this.password);
};

// ─────────────────────────────────────────────────────────────
// Virtuals
// ─────────────────────────────────────────────────────────────
userSchema.virtual('initials').get(function getInitials() {
  if (!this.name) return '';
  return this.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
});

userSchema.virtual('defaultAddress').get(function getDefaultAddress() {
  if (!this.addresses || this.addresses.length === 0) return null;
  return this.addresses.find((a) => a.isDefault) || this.addresses[0];
});

userSchema.virtual('isAdmin').get(function isAdmin() {
  return this.role === 'admin';
});

userSchema.virtual('isSeller').get(function isSeller() {
  return this.role === 'seller';
});

// ─────────────────────────────────────────────────────────────
// Static helper for public field projection
// ─────────────────────────────────────────────────────────────
userSchema.statics.publicFields =
  'name email phone role avatar emailVerified addresses wishlist createdAt';

// ─────────────────────────────────────────────────────────────
// Compile and export
// ─────────────────────────────────────────────────────────────
const User = mongoose.model('User', userSchema);

export default User;