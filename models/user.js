const mongoose = require('mongoose');
const LocationSchema = require('./schemas/location.js');

// use for creating schemas for our models
const Schema = mongoose.Schema;

// explicitly telling mongo to not 
// generate an _id field on our geoJSON objects
// with _id : {id: false}

const UserSchema = new Schema({
    name: {type: String, required: true},
    age: {type: Number, required: false},
    userName: {type: String, required: true},       // adding userName filed
    location: LocationSchema
});

// Make sure this attribute has a spatial index
UserSchema.index({location: '2dsphere'});

module.exports = mongoose.model('User', UserSchema);
