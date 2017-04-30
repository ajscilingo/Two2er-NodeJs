const mongoose = require('mongoose');

// use for creating schemas for our models
const Schema = mongoose.Schema;

// model for our master list of Subjects, separate collection

const SubjectSchema = mongoose.Schema ({
    name : {type: String, index: {unique: true} }
});

module.exports = mongoose.model("Subject", SubjectSchema);