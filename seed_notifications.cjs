const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const Notification = require('./backend/models/Notification');
const Business = require('./backend/models/Business');
const User = require('./backend/models/User');

const seedTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const businesses = await Business.find({});
    const customer = await User.findOne({ role: 'Customer' });

    for (const biz of businesses) {
      await Notification.create({
        receiverId: String(biz._id),
        receiverRole: 'business',
        title: 'New Appointment Request',
        message: `📅 New Appointment Request: Demo Customer booked for ${new Date().toLocaleDateString()} at 10:30 AM (General Consultation).`,
        type: 'appointment_new',
        isRead: false
      });
      console.log('Added business notification for:', biz.name, biz._id);
    }

    if (customer) {
      await Notification.create({
        receiverId: String(customer._id),
        receiverRole: 'customer',
        title: 'Token Generated',
        message: `✅ Your queue verification was approved! Your token is A-001.`,
        type: 'queue_approved',
        isRead: false
      });
      console.log('Added customer notification for:', customer.name, customer._id);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

seedTest();
