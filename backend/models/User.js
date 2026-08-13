const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Customer', 'Business', 'Super Admin'],
    default: 'Customer'
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    marketingEmails: { type: Boolean, default: false },
    theme: { type: String, default: 'light' },
    darkMode: { type: Boolean, default: false },
    kioskMode: { type: Boolean, default: false },
    autoApproveAppointments: { type: Boolean, default: true },
    twoFactorAuth: { type: Boolean, default: false },
    twoFactorMethod: { type: String, enum: ['email', 'phone'], default: 'email' },
    twoFactorContact: { type: String, default: '' }
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  },
  favoriteBusinesses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  }]
}, { timestamps: true });

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return enteredPassword === this.password;
};

module.exports = mongoose.model('User', UserSchema);
