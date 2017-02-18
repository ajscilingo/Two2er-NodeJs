const mongoose = require('mongoose');
const User = require('./user.js');

const Schema = mongoose.Schema;

const BookingSchema = new Schema ({
    studentid: {type: Schema.Types.ObjectId, required: true, ref: User},  // foreign key to users collection
    tutorid: {type: Schema.Types.ObjectId, required: true, ref: User},
    schedulemeetingtime : Date,
    confirmed : Boolean,
    bookingcreationgdate : Date
});

module.exports = mongoose.model("Booking", BookingSchema);