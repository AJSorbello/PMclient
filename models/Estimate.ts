import mongoose from 'mongoose';

const EstimateSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'approved', 'rejected'],
    default: 'draft',
  },
  validUntil: {
    type: Date,
    required: true,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30); // Valid for 30 days by default
      return date;
    },
  },
  items: [{
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  notes: {
    type: String,
  },
  terms: {
    type: String,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  revisions: [{
    version: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    items: [{
      description: String,
      quantity: Number,
      unitPrice: Number,
      total: Number,
    }],
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Calculate total amount before saving
EstimateSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.amount = this.items.reduce((sum, item) => sum + item.total, 0);
  }
  next();
});

export default mongoose.models.Estimate || mongoose.model('Estimate', EstimateSchema);
