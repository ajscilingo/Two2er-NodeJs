const mongoose = require('mongoose');
const User = require('./user.js');

const Schema = mongoose.Schema;

// Created upon request of a tutor booking, rejected and confirmed not set initially 
// set to confirmed when booking is accepted by tutor
// set to rejected when booking is rejected by tutor

const BookingSchema = new Schema ({
    studentid: {type: Schema.Types.ObjectId, required: true, ref: User},  // foreign key to users collection
    tutorid: {type: Schema.Types.ObjectId, required: true, ref: User},
    schedulemeetingtime : Date,
    confirmed : Boolean,
    bookingcreationgdate : Date
    rejected: Boolean;
});

module.exports = mongoose.model("Booking", BookingSchema);