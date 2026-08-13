const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const Queue = require('./models/Queue');
const Business = require('./models/Business');

mongoose.connect('mongodb://localhost:27017/queueless').then(async () => {
  await Appointment.deleteMany({});
  await Queue.deleteMany({});
  await Business.updateMany({}, { $set: { currentToken: '-', waiting: 0, activeQueue: [] } });
  console.log('Successfully deleted all old appointments and queue history.');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
