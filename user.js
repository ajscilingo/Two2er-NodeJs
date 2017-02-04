const mongoose = require('mongoose');

// use for creating schemas for our models
const Schema = mongoose.Schema;

// explicitly telling mongo to not 
// generate an _id field on our geoJSON objects
// with _id : {id: false}

const LocationSchema = new Schema({
    type: {type: String, default: "Point"},
    coordinates: {type: [Number], default: [0,0]},
    _id : {id: false}
});

const UserSchema = new Schema({
    name: {type: String, required: true},
    age: {type: Number, required: false},
    userName: {type: String, required: true},       // adding userName filed
    location: LocationSchema
});

const StudentLocationSchema = new Schema({
    user_id: {type: Objectid, required: true},      // foreign key to users collection
    location: LocationSchema
});

const TutorLocationSchema = new Schema({
    user_id: {type: Objectid, required: true},    // foreign key to users collection
    location: LocationSchema
});

const StudentSchema = new Schema({
    user_id: {type: Objectid, required: true},  // foreign key to users collection
    school: {type: String, required: false}     // optional school field
});

const TutorSchema = new Schema({
    user_id: {type: Objectid, required: true},  // foreign key to users collection
    subjects: {type: [String], required: false} // list of subjects approved to tutor, for now making required false
});

// Make sure this attribute has a spatial index
UserSchema.index({location: '2dsphere'});

module.exports = mongoose.model('User', UserSchema);
