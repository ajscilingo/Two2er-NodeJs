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

router.post ('/request', (req, res) => {

    console.log(`${req.ip} is doing a POST via /booking/request`)

    if(req.user){ 

        var booking = new Booking();

        booking.student_user_id = req.user.customData.user_id;
        tutor_user_id = req.body.tutor_user_id
        scheduledmeetingdate = req.body.scheduledmeetingdate;
        bookingcreationdate = Date.now();

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

module.exports = router;