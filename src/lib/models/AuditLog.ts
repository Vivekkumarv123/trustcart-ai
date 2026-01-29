import mongoose from 'mongoose';

export interface IAuditLog {
  _id?: string;
  action: 'verification_started' | 'verification_completed' | 'seller_registered' | 'trust_score_updated' | 'ai_analysis' | 'system_error';
  userId?: string;
  sellerId?: string;
  verificationId?: string;
  details: {
    [key: string]: any;
  };
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    timestamp: Date;
    aiModel?: string;
    processingTime?: number;
  };
  severity: 'info' | 'warning' | 'error' | 'critical';
  immutable: boolean; // Once true, record cannot be modified
  createdAt: Date;
}

const AuditLogSchema = new mongoose.Schema<IAuditLog>({
  action: {
    type: String,
    required: true,
    enum: ['verification_started', 'verification_completed', 'seller_registered', 'trust_score_updated', 'ai_analysis', 'system_error']
  },
  userId: { type: String },
  sellerId: { type: String },
  verificationId: { type: String },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    userAgent: { type: String },
    ipAddress: { type: String },
    timestamp: { type: Date, required: true, default: Date.now },
    aiModel: { type: String },
    processingTime: { type: Number }
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    required: true,
    default: 'info'
  },
  immutable: {
    type: Boolean,
    required: true,
    default: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    immutable: true // MongoDB level immutability
  }
}, {
  timestamps: false, // We handle timestamps manually
  collection: 'audit_logs'
});

// Prevent updates to immutable records
AuditLogSchema.pre('updateOne', function() {
  throw new Error('Audit logs are immutable and cannot be updated');
});

AuditLogSchema.pre('findOneAndUpdate', function() {
  throw new Error('Audit logs are immutable and cannot be updated');
});

AuditLogSchema.pre('updateMany', function() {
  throw new Error('Audit logs are immutable and cannot be updated');
});

// Index for efficient querying
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ sellerId: 1, createdAt: -1 });
AuditLogSchema.index({ severity: 1, createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);