// For the booking routes, we will have three possible routes 
// 1) Request (i.e. create) the booking, 
// 2) Accept the booking (confirmed)
// 3) Reject the booking (rejected)

const router = require('express').Router();
const Booking = require('../models/booking.js');
const dateFormat = require('dateformat');

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

module.exports = router;