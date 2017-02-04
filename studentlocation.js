const mongoose = require('mongoose');
const Location = require('./location.js');

// use for creating schemas for our models
const Schema = mongoose.Schema;

const StudentLocationSchema = new Schema({
    user_id: {type: Schema.Types.ObjectId, required: true},      // foreign key to users collection
    location: Location
});

// Make sure this attribute has a spatial index
StudentLocationSchema.index({location: '2dsphere'});
StudentLocationSchema.index(user_id);
module.exports = mongoose("StudentLocation", StudentLocationSchema);
