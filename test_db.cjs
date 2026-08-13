const mongoose = require('mongoose');
const Queue = require('./backend/models/Queue');

mongoose.connect('mongodb://127.0.0.1:27017/queueless_db')
  .then(async () => {
    const q = await Queue.find({status: 'pending_verification'});
    console.log(JSON.stringify(q, null, 2));
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
