const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true }, // e.g. "Counter 1"
  currentStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
  status: { type: String, enum: ['Open', 'Break', 'Closed'], default: 'Closed' }
}, { timestamps: true });

module.exports = mongoose.model('Counter', CounterSchema);
