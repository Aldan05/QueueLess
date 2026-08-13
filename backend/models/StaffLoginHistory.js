const mongoose = require('mongoose');

const StaffLoginHistorySchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  loginTime: { type: Date, default: Date.now },
  logoutTime: { type: Date },
  ipAddress: { type: String },
  device: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('StaffLoginHistory', StaffLoginHistorySchema);
