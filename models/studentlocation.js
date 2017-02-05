const mongoose = require('mongoose');
const LocationSchema = require('./schemas/location.js');
const User = require('./user.js');

// use for creating schemas for our models
const Schema = mongoose.Schema;

const StudentLocationSchema = new Schema({
    user_id: {type: Schema.Types.ObjectId, required: true, ref: User},      // foreign key to users collection
    createdAt: {type: Date, expires: '10m', default: Date.now},
    location: LocationSchema

});

// Make sure this attribute has a spatial index
StudentLocationSchema.index({location: '2dsphere'});
//StudentLocationSchema.index(user_id);
module.exports = mongoose.model("StudentLocation", StudentLocationSchema);
