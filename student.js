const mongoose = require('mongoose');

// use for creating schemas for our models
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
    user_id: {type: Objectid, required: true},  // foreign key to users collection
    school: {type: String, required: false}     // optional school field
});

StudentSchema.index(user_id);
module.exports = mongoose("Student", StudentSchema);