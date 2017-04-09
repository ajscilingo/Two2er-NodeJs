const mongoose = require('mongoose');

// use for creating schemas for our models
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
    courses : [String]
});

module.exports = StudentSchema;