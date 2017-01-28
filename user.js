const mongoose = require('mongoose');

// use for creating schemas for our models
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    Type: String,
    Coordinates: [Number]
});

const UserSchema = new Schema({
    Name: String,
    Age: Number,
    Location: LocationSchema
});

module.exports = mongoose.model('User', UserSchema);
