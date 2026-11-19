const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
    keplerName: { // used this name to match it with clients side 
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Planet', planetSchema);