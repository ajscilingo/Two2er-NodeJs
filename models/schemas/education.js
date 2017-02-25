const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EducationSchema = new Schema({
    school : String,
    field : String,
    degree: Number,
    year: Number,
    inProgress: Boolean,
    _id : {id: false}
});

module.exports = EducationSchema;