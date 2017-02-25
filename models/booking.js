const mongoose = require('mongoose');
const User = require('./user.js');

const Schema = mongoose.Schema;

// Created upon request of a tutor booking, rejected and confirmed not set initially 
// set to confirmed when booking is accepted by tutor
// set to rejected when booking is rejected by tutor
// both student_user_id and tutor_user_id are foreign keys to users collection

const BookingSchema = new Schema ({
    student_user_id: {type: Schema.Types.ObjectId, required: true, ref: User},  
    tutor_user_id: {type: Schema.Types.ObjectId, required: true, ref: User},   
    scheduledmeetingdate : Date,
    confirmed : Boolean,
    bookingcreationdate : Date,
    rejected: Boolean,
    cancelled: Boolean
});

module.exports = mongoose.model("Booking", BookingSchema);