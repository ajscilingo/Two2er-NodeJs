const mongoose = require('mongoose');

// use for creating schemas for our models
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
    courses : [String],
     _id : {id: false}
});

// export both schema and model
module.exports = {schema: StudentSchema, model: mongoose.model("Student", StudentSchema)}