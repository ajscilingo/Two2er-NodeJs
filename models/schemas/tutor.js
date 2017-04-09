const mongoose = require('mongoose');

// use for creating schemas for our models
const Schema = mongoose.Schema;

const TutorSchema = new Schema({
    subjects: {type: [String], required: false}, // list of subjects approved to tutor, for now making required false
    rating : Number,  // user rating
    isAvailableNow : Boolean  // can tutor right now?
});

//TutorSchema.index(user_id);
module.exports = TutorSchema;