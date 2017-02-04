const mongoose = require('mongoose');

// use for creating schemas for our models
const Schema = mongoose.Schema;

const TutorSchema = new Schema({
    user_id: {type: Schema.Types.ObjectId, required: true},  // foreign key to users collection
    subjects: {type: [String], required: false} // list of subjects approved to tutor, for now making required false
});

//TutorSchema.index(user_id);
module.exports = mongoose.model("Tutor", TutorSchema);