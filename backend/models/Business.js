const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  category: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  ratingDistribution: {
    5: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    1: { type: Number, default: 0 }
  },
  waitTime: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationStatus: { 
    type: String, 
    enum: ['Pending Review', 'Pending Update Review', 'Approved', 'Rejected', 'Documents Missing'],
    default: 'Documents Missing' 
  },
  queueActive: { type: Boolean, default: true },
  queueStatus: { 
    type: String, 
    enum: ['open', 'paused', 'closed'], 
    default: 'open' 
  },
  currentToken: { type: String, default: '-' },
  waiting: { type: Number, default: 0 },
  completedToday: { type: Number, default: 0 },
  // Location
  country: { type: String },
  state: { type: String },
  district: { type: String },
  city: { type: String },
  address: { type: String, default: 'Address pending verification' },
  pinCode: { type: String },
  
  // Owner Info
  ownerName: { type: String },
  ownerEmail: { type: String },
  ownerMobile: { type: String },
  designation: { type: String },
  
  // Documents
  docLogo: { type: mongoose.Schema.Types.Mixed },
  docPhoto: { type: mongoose.Schema.Types.Mixed },
  docGovId: { type: mongoose.Schema.Types.Mixed },
  docRegCert: { type: mongoose.Schema.Types.Mixed },
  docGst: { type: mongoose.Schema.Types.Mixed },
  
  // Pending Documents (Awaiting Admin Approval)
  pendingDocs: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  // Favorites
  favoritesCount: { type: Number, default: 0 },

  // Queue Setup
  openingTime: { type: String },
  closingTime: { type: String },
  workingDays: { type: String },
  serviceCounters: { type: String },
  avgServiceTime: { type: String },

  // Queue Verification Settings
  verificationSettings: {
    requireVerification: { type: Boolean, default: false },
    verificationBy: [{ type: String, enum: ['Business Owner', 'Manager', 'Staff'] }],
    requiredDocuments: [{ type: String }],
    verificationMode: { type: String, enum: ['Manual', 'Automatic'], default: 'Manual' },
    maxVerificationTime: { type: Number, default: 10 },
    autoRejectAfter: { type: Number, default: 30 }
  },

  // Simple queue array containing tickets
  activeQueue: [{
    token: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['waiting', 'served', 'skipped'], default: 'waiting' },
    position: Number,
    joinTime: Date
  }],
  // Staff Management
  staff: [{
    name: String,
    role: String,
    email: String,
    phone: String,
    counterNumber: String,
    status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
    joinDate: { type: Date, default: Date.now }
  }],
  // Staff Announcements
  staffAnnouncements: [{
    message: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Business', BusinessSchema);
