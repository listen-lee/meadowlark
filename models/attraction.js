const mongoose = require('mongoose');

let attractionSchema = mongoose.Schema({
    name: String,
    description: String,
    location: {lat: Number, lng: Number},
    history: {
        event: String,
        notes: String,
        email: String,
        date: Date
    },
    updateId: String,
    approved: Boolean
});

let Attraction = mongoose.model('Attraction', attractionSchema);

module.exports = Attraction;