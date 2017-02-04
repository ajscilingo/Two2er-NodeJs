const mongoose = require('mongoose');

// use for creating schemas for our models
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    type: {type: String, default: "Point"},
    coordinates: {type: [Number], default: [0,0]},
    _id : {id: false}
});

module.exports = LocationSchema;
