const mongoose = require('mongoose');

// use for creating schemas for our models
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    type: {type: String, default: "Point"},
    coordinates: {type: [Number], default: [0,0]},
    modifiedAt: {type: Date, default: Date.now}
});

// we need to export the schema here instead of the model.
// the schema will be used in our User, StudentLocation and TutorLocation
// schemas to create documents with a location document embedded in each.
module.exports = LocationSchema;
