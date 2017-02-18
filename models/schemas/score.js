const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ScoreSchema = new Schema({
    name : String,
    score : Number,
    _id : {id: false}
});

module.exports = ScoreSchema;