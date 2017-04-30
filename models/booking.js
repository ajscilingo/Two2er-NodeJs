const mongoose = require('mongoose');
const User = require('./user.js');

const Schema = mongoose.Schema;

// Created upon request of a tutor booking, declined and confirmed not set initially 
// set to confirmed when booking is accepted by tutor
// set to declined when booking is rejected by tutor
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

BookingSchema.methods.isDeclined = function (callback) {
    return (this.status == "declined");
}

BookingSchema.methods.isConfirmed = function (callback) {
    return (this.status == "confirmed");
}

BookingSchema.methods.isTentative = function (callback) {
    return (this.status == "tentative");
}

module.exports = mongoose.model("Booking", BookingSchema);