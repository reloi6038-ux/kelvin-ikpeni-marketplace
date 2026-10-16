/**
 * models/index.js
 * ---------------
 * Barrel file — imports every Mongoose model so that registering
 * the schema with mongoose.model() happens at boot.
 *
 * Imported once (from config/db.js) so that populate() calls
 * anywhere in the app can resolve models by name.
 */

export { default as User } from './User.js';
export { default as Seller } from './Seller.js';
export { default as Category } from './Category.js';
export { default as Product } from './Product.js';
export { default as Cart } from './Cart.js';
export { default as Wishlist } from './Wishlist.js';
export { default as Order } from './Order.js';
export { default as Payment } from './Payment.js';
export { default as Review } from './Review.js';
export { default as Coupon } from './Coupon.js';
export { default as Notification } from './Notification.js';
export { default as Payout } from './Payout.js';
export { default as AuditLog } from './AuditLog.js';
export { default as Address } from './Address.js';