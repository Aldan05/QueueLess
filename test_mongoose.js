const mongoose = require('mongoose');
const Business = require('./backend/models/Business');

mongoose.connect('mongodb://localhost:27017/queueless').then(async () => {
    try {
        const business = await Business.create({
            name: "Test",
            category: "General",
            isVerified: false,
            verificationStatus: 'Pending Review',
            queueActive: false,
            currentToken: '-',
            waiting: 0
        });
        console.log("Business created", business);
    } catch (e) {
        console.error("ERROR", e);
    }
    process.exit(0);
});
