import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  targetModel: {
    type: String,
    enum: ['User', 'Seller', 'Product', 'Order', 'Category', 'Coupon', 'Payment', 'Payout', 'Review', 'System'],
  },
  targetId: mongoose.Schema.Types.ObjectId,
  description: { type: String, maxlength: 500 },
  changes: { type: mongoose.Schema.Types.Mixed },
  ipAddress: String,
  userAgent: String,
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info',
  },
}, {
  timestamps: true,
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;