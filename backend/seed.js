const mongoose = require('mongoose');
const dotenv = require('dotenv');
const seedDB = require('./seed_helper');

dotenv.config({ path: require('path').join(__dirname, '.env') });

const runSeeding = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected. Running seeds...');
    await seedDB();
    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

runSeeding();
