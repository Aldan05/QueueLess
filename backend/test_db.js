const mongoose = require('mongoose');
const Queue = require('./models/Queue');

mongoose.connect('mongodb://127.0.0.1:27017/queueless')
  .then(async () => {
    const q = await Queue.find({});
    console.log(JSON.stringify(q, null, 2));
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
