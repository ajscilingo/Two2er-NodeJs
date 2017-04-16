const mongoose = require('mongoose');
const User = require('./user.js');

const Schema = mongoose.Schema;

// Created upon request of a tutor booking, rejected and confirmed not set initially 
// set to confirmed when booking is accepted by tutor
// set to rejected when booking is rejected by tutor
// both student_user_id and tutor_user_id are foreign keys to users collection

const BookingSchema = new Schema ({
    student_user_id: {type: Schema.Types.ObjectId, required: true, ref: User},  
    student_name: {type: String, required: true},
    tutor_user_id: {type: Schema.Types.ObjectId, required: true, ref: User},
    tutor_name: {type: String, required: true},
    scheduledmeetingdate : Date,
    scheduledendingdate : Date,
    bookingcreationdate : Date,
    timekit_booking_id : {type: String, required: false},
    status: {type: String, required: true}
});

BookingSchema.methods.isCancelled = function (callback) {
    return (this.status == "cancelled");
}

BookingSchema.methods.isRejected = function (callback) {
    return (this.status == "rejected");
}

BookingSchema.methods.isAccepted = function (callback) {
    return (this.status == "accepted");
}

module.exports = mongoose.model("Booking", BookingSchema);