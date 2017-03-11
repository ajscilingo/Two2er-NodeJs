// For the booking routes, we will have three possible routes 
// 1) Request (i.e. create) the booking, 
// 2) Accept the booking (confirmed)
// 3) Reject the booking (rejected)

const router = require('express').Router();
const Booking = require('../models/booking.js');
const User = require('../models/user.js')
const Location = require('../models/schemas/location.js')
const mongoose = require('mongoose');
const dateFormat = require('dateformat');
const Promise = require('bluebird');

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  console.log('Time:', dateFormat(Date.now(),'dd-mmm-yyyy HH:mm:ss'));
  next();
});

// Request a booking with a tutor
// student has to be logged in and authenticated
// through stormpath for this to work.
// the student_user_id is obtained this way
// remember to put date in epoch-time for storage

router.post ('/request', (req, res) => {

    console.log(`${req.ip} is doing a POST via /booking/request`);

    if(req.user){ 

        var booking = new Booking();
        
        booking.bookingcreationdate = Date.now();
        booking.scheduledmeetingdate = req.body.scheduledmeetingdate;
        booking.tutor_user_id = req.body.tutor_user_id;
        booking.student_user_id = req.user.customData.user_id;
        booking.status = "requested";

        User.findById(mongoose.Types.ObjectId(req.user.customData.user_id), (err, student) => {
            if(student){
                booking.student_name = student.name;
                User.findById(mongoose.Types.ObjectId(req.body.tutor_user_id), (err, tutor) => {
                    if(tutor){
                        booking.tutor_name = tutor.name;
                        booking.save( (err) => {
                            if(err) 
                                res.status(404).send(err);
                            else{
                                console.log(`${booking.student_user_id} requesting appointment`);
                                res.json({message: `${booking.student_user_id} requesting appointment`});
                            }
                        });
                    }
                    else{
                        res.status(404).send(err) ;
                    }
                });
            }
            else{
                res.status(404).send(err);
            }
        });
    }
    else{
        res.json({student_user_id: 0});
    }
});

// Route for tutor to reject booking
// Also used later if tutor needs to cancel
router.post('/reject', (req, res) => {

     console.log(`${req.ip} is doing a POST via /booking/reject`);

     if(req.user){ 
        Booking.findByIdAndUpdate(req.body.booking_id, {status: "rejected"}, (err, booking) =>{
            if(err)
                re.status(404).send(err);
            else{
                console.log(`Booking ${booking._id} has been rejected by ${req.user.customData.user_id}`);
                res.json({message: `Booking ${booking._id} has been rejected by ${req.user.customData.user_id}`});
            }
        });
     }
     else{
        res.json({tutor_user_id: 0});
    }

});

// Route for tutor to confirm booking
router.post('/confirm', (req, res) => {

    console.log(`${req.ip} is doing a POST via /booking/confirm`)

    if(req.user){ 
        Booking.findByIdAndUpdate(req.body.booking_id, {status: "confirmed"}, (err, booking) =>{
            if(err)
                re.status(404).send(err);
            else{
                console.log(`Booking ${booking._id} has been confirmed by ${req.user.customData.user_id}`);
                res.json({message: `Booking ${booking._id} has been confirmed by ${req.user.customData.user_id}`});
            }
        });
     }
     else{
        res.json({tutor_user_id: 0});
    }
});

// Route for student to cancel booking
router.post('/cancel', (req, res) => {

     console.log(`${req.ip} is doing a POST via /booking/cancel`)

    if(req.user){ 
        Booking.findByIdAndUpdate(req.body.booking_id, {status: "cancelled"}, (err, booking) => {
            if(err)
                re.status(404).send(err);
            else{
                console.log(`Booking ${booking._id} has been cancelled by ${req.user.customData.user_id}`);
                res.json({message: `Booking ${booking._id} has been cancelled by ${req.user.customData.user_id}`});
            }
        });
     }
     else{
        res.json({student_user_id: 0});
    }
});


router.get('/', (req, res) => {
    console.log(`${req.ip} is doing a GET via /booking`);

    if(req.user) {
        Booking.find( {$or :[{student_user_id : req.user.customData.user_id}, {tutor_user_id : req.user.customData.user_id}]}).lean().exec((err, booking) => {
            if (err)
                res.status(404).send(err);
            
            var obj = JSON.parse(JSON.stringify(booking));

            booking.forEach( function(b, index, theArray) {
                User.findById(mongoose.Types.ObjectId(b.student_user_id), (err2, stu) => {
                    if (err2)
                        res.status(404).send(err2);
                    User.findById(mongoose.Types.ObjectId(b.tutor_user_id), (err3, tut) => {
                        if (err3)
                            res.status(404).send(err3);
                        
                        if (stu)
                            theArray[index]["student_name"] = stu.name;
                        else
                            theArray[index]["student_name"] = "N/A";
                        
                        if (tut)
                            theArray[index]["tutor_name"] = tut.name;
                        else
                            theArray[index]["tutor_name"] = "N/A";
                    });
                });
            });
            res.json(booking);
        });
    }
});

// router.get('/', (req, res) => {
//     console.log(`${req.ip} is doing a GET via /booking`);

//     // used to 
//     // var UserData = {
//     //     mo : (id) => {
//     //         User.findById(mongoose.Types.ObjectId(id)).then( ;
//     //     }
//     // }    if(req.user) {
//         Booking.find( {$or :[{student_user_id : req.user.customData.user_id}, {tutor_user_id : req.user.customData.user_id}]}).then((bookings) => {

//             Promise.map(bookings, (booking) => {
//                console.log(`student_user_id ${booking.student_user_id}`);
//                console.log(`tutor_user_id ${booking.tutor_user_id}`);
//                return {
//                    booking_name: "booking 1234",
//                    booking_title: "my booking",
//                    student_user_id : booking.student_user_id,
//                    tutor_user_id: booking.tutor_user_id
//                }
//             }).then( (transformedBookings) => {
//                 res.json(transformedBookings);
//             }).catch( (err) => {
//                 console.log(err);
//                 res.status(500).send(err);
//             });
//             //   booking.forEach( (document, index, array) => {
//             //         User.findById(mongoose.Types.ObjectId(booking.student_user_id)).then( (student) =>{
//             //             student_name = student.name;
//             //             console.log(`Student Name: ${student_name}`);
//             //         }).catch( (err) => {
//             //             res.status(500).send(err);
//             //         });
//             //         User.findById(mongoose.Types.ObjectId(booking.tutor_user_id)).then( (tutor) => {
//             //             tutor_name = tutor.name; 
//             //             console.log(`Tutor Name: ${tutor_name}`);
//             //         }).catch( (err) => {
//             //             res.status(500).send(err);
//             //         });
//             //   });
//             //   booking[0]["test"] = "test";
//             //   var response = {student_user_id : booking[0].student_user_id, test : User.findById()};
//             //   res.json(response);

//         }).catch( (err) => { 
//             res.status(500).send(err);
//             console.log(err);
//         });
//     }
// });

module.exports = router;