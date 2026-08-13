const mongoose = require('mongoose');
const Queue = require('./models/Queue');
const Business = require('./models/Business');

mongoose.connect('mongodb://127.0.0.1:27017/queueless_db')
  .then(async () => {
    const business = await Business.findOne({ role: 'Business' });
    if (!business) {
      console.log('No business found');
      process.exit();
    }
    
    // Check if customer exists
    const customer = await Business.findOne({ role: 'Customer' });
    const customerId = customer ? customer._id : new mongoose.Types.ObjectId();
    
    const newQueue = new Queue({
      businessId: business._id,
      customerId: customerId,
      token: 'PENDING-TEST',
      position: 0,
      status: 'pending_verification',
      partySize: 1,
      purpose: 'General',
      documents: [{
        type: 'Aadhaar Card',
        frontImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // tiny red pixel
        backImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      }],
      verificationSubmittedAt: new Date()
    });
    
    await newQueue.save();
    console.log('Test queue created successfully:', newQueue._id);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
