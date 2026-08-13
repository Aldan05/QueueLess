const User = require('./models/User');
const Business = require('./models/Business');

const seedDB = async () => {
  try {
    // 1. Seed Admin
    const adminEmail = 'admin@queueless.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: 'password123',
        role: 'Super Admin'
      });
      console.log('Seeded Super Admin:', adminEmail);
    } else {
      console.log('Super Admin already exists');
    }

    // 2. Seed Customer
    const customerEmail = 'customer@queueless.com';
    const customerExists = await User.findOne({ email: customerEmail });
    if (!customerExists) {
      await User.create({
        name: 'Demo Customer',
        email: customerEmail,
        password: 'password123',
        role: 'Customer'
      });
      console.log('Seeded Demo Customer:', customerEmail);
    } else {
      console.log('Demo Customer already exists');
    }

    // 3. Seed Business & Business Admin
    const businessEmail = 'business@queueless.com';
    const businessUserExists = await User.findOne({ email: businessEmail });
    
    if (!businessUserExists) {
      // Create Business Profile first
      const business = await Business.create({
        name: 'Demo Hospital',
        category: 'Hospital',
        rating: 4.8,
        waitTime: 15,
        isVerified: true,
        verificationStatus: 'Approved',
        queueActive: true,
        currentToken: 'A-002',
        waiting: 5,
        country: 'USA',
        state: 'New York',
        district: 'Central',
        city: 'Metropolis',
        address: '123 Health Ave, Medical District',
        pinCode: '10001',
        ownerName: 'Dr. John Doe',
        ownerEmail: 'johndoe@demohospital.com',
        ownerMobile: '+15551234567',
        designation: 'Chief Medical Officer',
        openingTime: '08:00',
        closingTime: '20:00',
        workingDays: 'Monday - Saturday',
        serviceCounters: '3',
        avgServiceTime: '15m'
      });

      // Create linked Business User
      await User.create({
        name: 'Demo Hospital Admin',
        email: businessEmail,
        password: 'password123',
        role: 'Business',
        businessId: business._id
      });
      console.log('Seeded Demo Business and Business Admin:', businessEmail);
    } else {
      console.log('Demo Business Admin already exists');
    }

    // 4. Ensure default counters exist for all businesses in the database
    const Counter = require('./models/Counter');
    const allBusinesses = await Business.find({});
    for (const biz of allBusinesses) {
      const countersCount = await Counter.countDocuments({ businessId: biz._id });
      if (countersCount === 0) {
        await Counter.create([
          { businessId: biz._id, name: 'Counter 1', status: 'Closed' },
          { businessId: biz._id, name: 'Counter 2', status: 'Closed' },
          { businessId: biz._id, name: 'Counter 3', status: 'Closed' }
        ]);
        console.log(`Seeded default counters for business: ${biz.name}`);
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDB;
