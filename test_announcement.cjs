const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });
const Business = require('./backend/models/Business');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');
    const business = await Business.findOne();
    console.log('Found business:', business.name);
    
    if (!business.staffAnnouncements) {
      business.staffAnnouncements = [];
    }
    
    business.staffAnnouncements.unshift({ message: 'Test announcement from script', date: new Date() });
    await business.save();
    console.log('Saved business. staffAnnouncements length:', business.staffAnnouncements.length);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

test();
