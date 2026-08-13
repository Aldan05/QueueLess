const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  employeeId: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  designation: { type: String },
  counterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Counter', default: null },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePhoto: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  permissions: {
    canCallNext: { type: Boolean, default: true },
    canSkip: { type: Boolean, default: true },
    canRecall: { type: Boolean, default: true },
    canComplete: { type: Boolean, default: true },
    canStartBreak: { type: Boolean, default: true },
    canViewQueue: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Staff', StaffSchema);
