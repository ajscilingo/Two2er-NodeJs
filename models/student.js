const mongoose = require('mongoose');
const User = require('./user.js');

// use for creating schemas for our models
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
    user_id: {type: Schema.Types.ObjectId, required: true, ref: User},  // foreign key to users collection
    school: {type: String, required: false}, // optional school field
    courses : [String]
});

//StudentSchema.index(user_id);
module.exports = mongoose.model("Student", StudentSchema);