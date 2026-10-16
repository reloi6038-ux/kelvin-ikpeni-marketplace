/**
 * models/User.js
 * ---------------
 * User model — represents customers, sellers (as users), and admins.
 * Sellers have an additional Seller profile linked 1:1.
 *
 * Security notes:
 *  - Passwords are hashed with bcrypt (12 rounds) before saving.
 *  - The password field has `select: false` — it must be explicitly
 *    requested with `.select('+password')` to be loaded.
 *  - Reset/verification tokens have short expirations.
 *  - `toJSON` strips sensitive fields from API responses.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ─────────────────────────────────────────────────────────────
// Embedded address sub-schema
// Users can save multiple delivery addresses.
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
      // Nigerian mobile: 080..., 090..., 070..., 081... or +234 variants
      match: [
        /^(\+?234|0)[789][01]\d{8}$/,
        'Please provide a valid Nigerian phone number',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      // select: false means queries won't return the hash unless
      // explicitly requested with .select('+password').
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

    // ─────────────────────────────────────────────────────────
    // Email verification
    // ─────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────
    // Password reset
    // ─────────────────────────────────────────────────────────
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ─────────────────────────────────────────────────────────
    // Account state
    // ─────────────────────────────────────────────────────────
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

    // Quick-reference wishlist (the full Wishlist model holds richer data)
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
        // Rename _id → id for cleaner frontend API
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;

        // Never expose secrets or reset tokens
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
// Note: email already has a unique index via `unique: true` above.
// Only additional indexes belong here.
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, isSuspended: 1 });

// ─────────────────────────────────────────────────────────────
// Pre-save: hash password when modified
// ─────────────────────────────────────────────────────────────
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────
// Instance method: compare candidate password with stored hash
// Usage:
//   const user = await User.findOne({ email }).select('+password');
//   const ok = await user.comparePassword('candidate');
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

// Initials (e.g. "Kelvin Ikpeni" → "KI")
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

// Default address (first with isDefault = true, else first in array)
userSchema.virtual('defaultAddress').get(function getDefaultAddress() {
  if (!this.addresses || this.addresses.length === 0) return null;
  return this.addresses.find((a) => a.isDefault) || this.addresses[0];
});

// Is this user an admin?
userSchema.virtual('isAdmin').get(function isAdmin() {
  return this.role === 'admin';
});

// Is this user a seller?
userSchema.virtual('isSeller').get(function isSeller() {
  return this.role === 'seller';
});

// ─────────────────────────────────────────────────────────────
// Static helper: safe public fields for select()
// Usage: User.find().select(User.publicFields)
// ─────────────────────────────────────────────────────────────
userSchema.statics.publicFields =
  'name email phone role avatar emailVerified addresses wishlist createdAt';

// ─────────────────────────────────────────────────────────────
// Compile and export
// ─────────────────────────────────────────────────────────────
const User = mongoose.model('User', userSchema);

export default User;