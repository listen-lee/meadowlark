let mongoose = require('mongoose');

let vacationInSeasonListenerSchema = mongoose.Schema({
    email: String,
    skus: [String]
});

let VacationInSeasonListener = mongoose.model('VacationInSeasonListener', vacationInSeasonListenerSchema);

module.exports = VacationInSeasonListener;