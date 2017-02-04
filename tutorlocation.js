const mongoose = require('mongoose');
const Location = require('./location.js');

// use for creating schemas for our models
const Schema = mongoose.Schema;

const TutorLocationSchema = new Schema({
    user_id: {type: Schema.Types.ObjectId, required: true},    // foreign key to users collection
    location: Location
});

TutorLocationSchema.index({location: '2dsphere'});
TutorLocationSchema.index(user_id);
module.exports = mongoose("TutorLocation", TutorLocationSchema);
